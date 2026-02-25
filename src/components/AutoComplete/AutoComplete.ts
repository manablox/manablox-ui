import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { AUTOCOMPLETE_STYLES } from './AutoComplete.styles.js';

interface SuggestionItem {
	label: string;
	value: unknown;
}

function normalizeSuggestions(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

export class MbAutoComplete extends MbBaseComponent {
	static readonly _componentName = 'mb-autocomplete';
	static readonly _componentStyles = AUTOCOMPLETE_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'object'],
			['suggestions', 'object'],
			['field', 'string'],
			['option-label', 'string'],
			['multiple', 'boolean'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['placeholder', 'string'],
			['delay', 'number'],
			['min-length', 'number'],
			['complete-on-focus', 'boolean'],
			['force-selection', 'boolean'],
			['empty-message', 'string'],
			['dropdown', 'boolean'],
			['scrollable-height', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbAutoComplete.attributeConverters.keys());
	}

	#portalKey = `mb-autocomplete-${Math.random().toString(36).slice(2)}`;
	#listId = `mb-autocomplete-list-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;
	#isFocused = false;
	#highlightedIndex = -1;
	#typedValue = '';
	#debounceTimer: number | null = null;
	#listenersBound = false;
	#visibleSuggestions: SuggestionItem[] = [];

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#handleRootClick(event);
		const onInput = (event: Event) => this.#handleInput(event);
		const onFocusIn = () => {
			this.#isFocused = true;
			if (this.completeOnFocus) {
				this.#emitComplete(this.#typedValue);
			}
			this._scheduleRender();
		};
		const onFocusOut = (event: FocusEvent) => {
			const next = event.relatedTarget as Node | null;
			if (next && (this.contains(next) || this.#portalHost?.contains(next))) return;
			this.#isFocused = false;
			this.#applyForceSelection();
			this.#closeOverlay();
			this._scheduleRender();
		};
		const onKeydown = (event: KeyboardEvent) => this.#handleKeydown(event);

		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('focusin', onFocusIn);
		this.addEventListener('focusout', onFocusOut);
		this.addEventListener('keydown', onKeydown);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('focusin', onFocusIn));
		this._addCleanup(() => this.removeEventListener('focusout', onFocusOut));
		this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
		this._addCleanup(() => this.#closeOverlay());
		this._addCleanup(() => this.#clearDebounce());
	}

	disconnectedCallback(): void {
		this.#closeOverlay();
		this.#clearDebounce();
		super.disconnectedCallback();
	}

	get modelValue(): unknown {
		return this._obj<unknown>('model-value');
	}
	set modelValue(value: unknown) {
		if (value == null) {
			this.removeAttribute('model-value');
		} else {
			this.setAttribute('model-value', JSON.stringify(value));
		}
	}

	get suggestions(): unknown[] {
		return normalizeSuggestions(this._obj<unknown>('suggestions'));
	}
	set suggestions(value: unknown[]) {
		this.setAttribute('suggestions', JSON.stringify(value ?? []));
	}

	get field(): string {
		return this._str('field', 'label');
	}
	get optionLabel(): string {
		return this._str('option-label', this.field);
	}
	get multiple(): boolean {
		return this._bool('multiple');
	}
	get disabled(): boolean {
		return this._bool('disabled');
	}
	get invalid(): boolean {
		return this._bool('invalid');
	}
	get delay(): number {
		return this._num('delay', 300) ?? 300;
	}
	get minLength(): number {
		return this._num('min-length', 1) ?? 1;
	}
	get completeOnFocus(): boolean {
		return this._bool('complete-on-focus');
	}
	get forceSelection(): boolean {
		return this._bool('force-selection');
	}
	get dropdown(): boolean {
		return this._bool('dropdown');
	}

	protected _render(): string {
		const value = this.#displayValue();
		if (!this.multiple && this.#typedValue === '') {
			this.#typedValue = value;
		}

		const focusedClass = this.#isFocused ? 'mb-focused' : '';
		const invalidClass = this.invalid ? 'mb-invalid' : '';
		const disabledClass = this.disabled ? 'mb-disabled' : '';
		const placeholder = this._escape(this._str('placeholder', 'Search'));

		return this._html`
			<div class="mb-autocomplete ${focusedClass} ${invalidClass} ${disabledClass}">
				${
					this.multiple
						? `<div class="mb-autocomplete-multiple">
							${this.#renderMultipleChips()}
							<input class="mb-autocomplete-multiple-input" data-role="input" type="text" value="${this._escape(this.#typedValue)}" placeholder="${placeholder}" ${this.disabled ? 'disabled' : ''} />
						</div>`
						: `<input class="mb-autocomplete-input" data-role="input" type="text" value="${this._escape(this.#typedValue)}" placeholder="${placeholder}" ${this.disabled ? 'disabled' : ''} />`
				}
				<div class="mb-autocomplete-controls">
					${this.#hasValue() && !this.disabled ? '<button class="mb-autocomplete-clear" data-role="clear" type="button" aria-label="Clear">✕</button>' : ''}
					${this.dropdown ? '<button class="mb-autocomplete-dropdown" data-role="dropdown" type="button" aria-label="Show options">▾</button>' : ''}
				</div>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen) this.#renderOverlay();
	}

	#handleRootClick(event: Event): void {
		if (this.disabled) return;
		const target = event.target as HTMLElement;

		if (target.closest('[data-role="clear"]')) {
			event.preventDefault();
			this.#clearValue(true);
			return;
		}

		const remove = target.closest<HTMLElement>('[data-chip-remove]');
		if (remove && this.multiple) {
			event.preventDefault();
			const index = Number(remove.getAttribute('data-chip-remove'));
			if (!Number.isNaN(index)) this.#removeMultipleValue(index, true);
			return;
		}

		if (target.closest('[data-role="dropdown"]')) {
			event.preventDefault();
			this.emit('mb-dropdown-click');
			this.#emitComplete(this.#typedValue, true);
			return;
		}
	}

	#handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (!target.matches('[data-role="input"]')) return;
		this.#typedValue = target.value;
		this.emit('mb-input', { value: this.#typedValue });
		if (this.multiple) {
			this._scheduleRender();
		}
		if (this.#typedValue.length >= this.minLength) {
			this.#debouncedComplete(this.#typedValue);
		} else {
			this.#closeOverlay();
		}
	}

	#handleKeydown(event: KeyboardEvent): void {
		if (this.disabled) return;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (!this.#isOpen) this.#openOverlay();
				this.#moveHighlight(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!this.#isOpen) this.#openOverlay();
				this.#moveHighlight(-1);
				break;
			case 'Enter':
				if (!this.#isOpen) return;
				event.preventDefault();
				if (this.#highlightedIndex >= 0) {
					const item = this.#visibleSuggestions[this.#highlightedIndex];
					if (item) this.#selectSuggestion(item, true);
				}
				break;
			case 'Escape':
				if (this.#isOpen) {
					event.preventDefault();
					this.#closeOverlay();
				}
				break;
			default:
				break;
		}
	}

	#debouncedComplete(query: string): void {
		this.#clearDebounce();
		this.#debounceTimer = window.setTimeout(() => {
			this.#emitComplete(query);
		}, this.delay);
	}

	#emitComplete(query: string, forceOpen = false): void {
		if (query.length < this.minLength && !forceOpen) return;
		this.emit('mb-complete', { query });
		this.#openOverlay();
	}

	#openOverlay(): void {
		if (this.#isOpen || this.disabled) return;
		this.#isOpen = true;
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#renderOverlay();

		const trigger = this._qs<HTMLElement>('.mb-autocomplete') ?? this;
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-autocomplete-overlay');
		if (trigger && panel) {
			this.#positionCleanup = startAutoPosition(trigger, panel, {
				placement: 'bottom-start',
				offsetDistance: 4,
			});
		}

		const onDocDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (this.contains(target)) return;
			if (this.#portalHost?.contains(target)) return;
			this.#closeOverlay();
		};
		document.addEventListener('mousedown', onDocDown, true);
		this.#outsideCleanup = () => document.removeEventListener('mousedown', onDocDown, true);
	}

	#closeOverlay(): void {
		if (!this.#isOpen && !this.#portalHost) return;
		this.#isOpen = false;
		this.#positionCleanup?.();
		this.#positionCleanup = null;
		this.#outsideCleanup?.();
		this.#outsideCleanup = null;
		removePortal(this.#portalKey);
		this.#portalHost = null;
		this.#highlightedIndex = -1;
		this._scheduleRender();
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;
		const suggestions = this.#normalizeSuggestionItems(this.suggestions);
		this.#visibleSuggestions = suggestions;
		const emptyMessage = this._escape(this._str('empty-message', 'No results found'));
		const scrollHeight = this._escape(this._str('scrollable-height', '14rem'));

		if (this.#highlightedIndex >= suggestions.length) {
			this.#highlightedIndex = suggestions.length - 1;
		}
		if (this.#highlightedIndex < 0 && suggestions.length > 0) {
			this.#highlightedIndex = 0;
		}

		const model = this.modelValue;
		const list = suggestions.length
			? suggestions
					.map((item, index) => {
						const selected = this.multiple
							? Array.isArray(model) && model.some(entry => this.#isEqual(entry, item.value))
							: this.#isEqual(model, item.value);
						const selectedClass = selected ? ' mb-selected' : '';
						const highlightedClass = this.#highlightedIndex === index ? ' mb-highlighted' : '';
						return `<li class="mb-autocomplete-item${selectedClass}${highlightedClass}" data-option-index="${index}" role="option" aria-selected="${selected ? 'true' : 'false'}">${this._escape(item.label)}</li>`;
					})
					.join('')
			: `<li class="mb-autocomplete-empty-message">${emptyMessage}</li>`;

		this.#portalHost.innerHTML = this._html`
			<div class="mb-autocomplete-overlay">
				<div class="mb-autocomplete-items-wrapper" style="max-height:${scrollHeight}">
					<ul id="${this.#listId}" class="mb-autocomplete-list" role="listbox">${list}</ul>
				</div>
			</div>
		`;

		const listEl = this.#portalHost.querySelector<HTMLElement>('.mb-autocomplete-list');
		if (listEl) {
			const onClick = (event: Event) => {
				const row = (event.target as HTMLElement).closest<HTMLElement>('[data-option-index]');
				if (!row) return;
				const index = Number(row.getAttribute('data-option-index'));
				if (Number.isNaN(index)) return;
				const selected = this.#visibleSuggestions[index];
				if (selected) this.#selectSuggestion(selected, true);
			};
			listEl.addEventListener('click', onClick);
			this._addCleanup(() => listEl.removeEventListener('click', onClick));
		}
	}

	#selectSuggestion(item: SuggestionItem, emitEvents: boolean): void {
		if (this.multiple) {
			const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
			if (!current.some(value => this.#isEqual(value, item.value))) {
				current.push(item.value);
				this.modelValue = current;
				if (emitEvents) {
					this.emit('mb-select', { value: item.value });
					this.emit('mb-change', { value: current });
				}
			}
			this.#typedValue = '';
			this._scheduleRender();
			return;
		}

		this.modelValue = item.value;
		this.#typedValue = item.label;
		if (emitEvents) {
			this.emit('mb-select', { value: item.value });
			this.emit('mb-change', { value: item.value });
		}
		this.#closeOverlay();
		this._scheduleRender();
	}

	#removeMultipleValue(index: number, emitEvent: boolean): void {
		const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
		const removed = current[index];
		if (removed === undefined) return;
		current.splice(index, 1);
		this.modelValue = current;
		if (emitEvent) {
			this.emit('mb-unselect', { value: removed });
			this.emit('mb-change', { value: current });
		}
		this._scheduleRender();
	}

	#clearValue(emitEvents: boolean): void {
		this.modelValue = this.multiple ? [] : '';
		this.#typedValue = '';
		if (emitEvents) {
			this.emit('mb-clear');
			this.emit('mb-change', { value: this.multiple ? [] : '' });
		}
		this._scheduleRender();
	}

	#applyForceSelection(): void {
		if (!this.forceSelection || this.multiple) return;
		const typed = this.#typedValue.trim();
		if (!typed) return;
		const item = this.#normalizeSuggestionItems(this.suggestions).find(option => option.label === typed);
		if (!item) {
			this.modelValue = null;
			this.#typedValue = '';
			this.emit('mb-change', { value: null });
		}
	}

	#moveHighlight(direction: 1 | -1): void {
		if (this.#visibleSuggestions.length === 0) return;
		if (this.#highlightedIndex < 0) {
			this.#highlightedIndex = direction === 1 ? 0 : this.#visibleSuggestions.length - 1;
		} else {
			this.#highlightedIndex += direction;
			if (this.#highlightedIndex < 0) this.#highlightedIndex = this.#visibleSuggestions.length - 1;
			if (this.#highlightedIndex >= this.#visibleSuggestions.length) this.#highlightedIndex = 0;
		}
		this.#renderOverlay();
	}

	#displayValue(): string {
		if (this.multiple) return '';
		const value = this.modelValue;
		if (typeof value === 'string') return value;
		if (value == null) return '';
		if (typeof value === 'object') {
			const record = value as Record<string, unknown>;
			const label = record[this.optionLabel] ?? record.label;
			return label == null ? '' : String(label);
		}
		return String(value);
	}

	#renderMultipleChips(): string {
		const values = Array.isArray(this.modelValue) ? this.modelValue : [];
		if (values.length === 0) return '';
		return values
			.map((item, index) => {
				const label = this.#resolveLabel(item);
				return `<span class="mb-autocomplete-chip">
					<span>${this._escape(label)}</span>
					<button class="mb-autocomplete-chip-remove" data-chip-remove="${index}" type="button" aria-label="Remove">✕</button>
				</span>`;
			})
			.join('');
	}

	#resolveLabel(value: unknown): string {
		if (value == null) return '';
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}
		if (typeof value === 'object') {
			const record = value as Record<string, unknown>;
			const label = record[this.optionLabel] ?? record[this.field] ?? record.label;
			return label == null ? '' : String(label);
		}
		return '';
	}

	#normalizeSuggestionItems(source: unknown[]): SuggestionItem[] {
		return source.map(item => {
			if (item && typeof item === 'object') {
				const record = item as Record<string, unknown>;
				const value = record.value ?? item;
				const label = record[this.optionLabel] ?? record[this.field] ?? record.label ?? value;
				return { label: label == null ? '' : String(label), value };
			}
			return { label: String(item ?? ''), value: item };
		});
	}

	#hasValue(): boolean {
		if (this.multiple) {
			return Array.isArray(this.modelValue) && this.modelValue.length > 0;
		}
		const value = this.modelValue;
		return value != null && String(value) !== '';
	}

	#isEqual(a: unknown, b: unknown): boolean {
		if (a === b) return true;
		if (a == null || b == null) return false;
		try {
			return JSON.stringify(a) === JSON.stringify(b);
		} catch {
			return false;
		}
	}

	#clearDebounce(): void {
		if (this.#debounceTimer != null) {
			window.clearTimeout(this.#debounceTimer);
			this.#debounceTimer = null;
		}
	}
}

export const defineAutoComplete = createDefine('mb-autocomplete', MbAutoComplete);
export default MbAutoComplete;
export {};
