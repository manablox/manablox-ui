import type { AttributeConverter, SelectOption } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { SELECT_STYLES } from './Select.styles.js';

type SelectSize = 'small' | 'large' | '';
type SelectVariant = 'outlined' | 'filled';

interface FlattenedOption {
	label: string;
	value: unknown;
	disabled: boolean;
	option: SelectOption;
}

type RenderRow =
	| { type: 'group'; label: string }
	| { type: 'option'; item: FlattenedOption; index: number };

function normalizeOptions(value: unknown): SelectOption[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is SelectOption => typeof item === 'object' && item !== null);
}

export class MbSelect extends MbBaseComponent {
	static readonly _componentName = 'mb-select';
	static readonly _componentStyles = SELECT_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['options', 'object'],
			['option-label', 'string'],
			['option-value', 'string'],
			['option-disabled', 'string'],
			['option-group-label', 'string'],
			['option-group-children', 'string'],
			['model-value', 'object'],
			['placeholder', 'string'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['filter', 'boolean'],
			['filter-placeholder', 'string'],
			['show-clear', 'boolean'],
			['size', 'string'],
			['variant', 'string'],
			['empty-message', 'string'],
			['scrollable-height', 'string'],
			['checkmark', 'boolean'],
			['editable', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbSelect.attributeConverters.keys());
	}

	#portalKey = `mb-select-${Math.random().toString(36).slice(2)}`;
	#listId = `mb-select-list-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;
	#isFocused = false;
	#filterValue = '';
	#highlightedIndex = -1;
	#visibleOptions: FlattenedOption[] = [];
	#editableText = '';
	#listenersBound = false;

	constructor() {
		super();
	}

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#handleRootClick(event);
		const onKeydown = (event: KeyboardEvent) => this.#handleKeydown(event);
		const onFocusIn = () => {
			this.#isFocused = true;
			this._scheduleRender();
		};
		const onFocusOut = (event: FocusEvent) => {
			const next = event.relatedTarget as Node | null;
			if (next && (this.contains(next) || this.#portalHost?.contains(next))) return;
			this.#isFocused = false;
			this._scheduleRender();
		};

		this.addEventListener('click', onClick);
		this.addEventListener('keydown', onKeydown);
		this.addEventListener('focusin', onFocusIn);
		this.addEventListener('focusout', onFocusOut);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
		this._addCleanup(() => this.removeEventListener('focusin', onFocusIn));
		this._addCleanup(() => this.removeEventListener('focusout', onFocusOut));
		this._addCleanup(() => this.#closePanel(false));
	}

	disconnectedCallback(): void {
		this.#closePanel(false);
		super.disconnectedCallback();
	}

	get options(): SelectOption[] {
		return normalizeOptions(this._obj<unknown>('options'));
	}
	set options(value: SelectOption[]) {
		this.setAttribute('options', JSON.stringify(value ?? []));
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

	get optionLabel(): string {
		return this._str('option-label', 'label');
	}
	get optionValue(): string {
		return this._str('option-value', 'value');
	}
	get optionDisabled(): string {
		return this._str('option-disabled', 'disabled');
	}
	get optionGroupLabel(): string {
		return this._str('option-group-label', 'label');
	}
	get optionGroupChildren(): string {
		return this._str('option-group-children', 'items');
	}

	get disabled(): boolean {
		return this._bool('disabled');
	}
	get invalid(): boolean {
		return this._bool('invalid');
	}
	get filter(): boolean {
		return this._bool('filter');
	}
	get showClear(): boolean {
		return this._bool('show-clear');
	}
	get checkmark(): boolean {
		return this._bool('checkmark');
	}
	get editable(): boolean {
		return this._bool('editable');
	}
	get size(): SelectSize {
		const size = this._str('size', '');
		return size === 'small' || size === 'large' ? size : '';
	}
	get variant(): SelectVariant {
		return this._str('variant', 'outlined') === 'filled' ? 'filled' : 'outlined';
	}

	protected _render(): string {
		const selected = this.#findSelectedOption();
		const selectedLabel = selected ? this.#getOptionLabel(selected.option) : '';
		if (!this.editable) {
			this.#editableText = selectedLabel;
		}

		const placeholder = this._escape(this._str('placeholder', 'Select'));
		const sizeClass = this.size === 'small' ? 'mb-select-sm' : this.size === 'large' ? 'mb-select-lg' : '';
		const focusedClass = this.#isFocused || this.#isOpen ? 'mb-focused' : '';
		const invalidClass = this.invalid ? 'mb-invalid' : '';
		const disabledClass = this.disabled ? 'mb-disabled' : '';
		const filledClass = this.variant === 'filled' ? 'mb-filled' : '';
		const hasValue = selected != null;
		const clearVisible = this.showClear && hasValue && !this.disabled;

		return this._html`
			<div
				class="mb-select ${sizeClass} ${focusedClass} ${invalidClass} ${disabledClass} ${filledClass}"
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded="${this.#isOpen ? 'true' : 'false'}"
				aria-controls="${this.#listId}"
				aria-disabled="${this.disabled ? 'true' : 'false'}"
			>
				<button class="mb-select-trigger" type="button" ${this.disabled ? 'disabled' : ''}>
					${
						this.editable
							? `<input class="mb-select-label" data-role="editable" type="text" value="${this._escape(this.#editableText || '')}" placeholder="${placeholder}" ${this.disabled ? 'disabled' : ''} />`
							: `<span class="mb-select-label">${hasValue ? this._escape(selectedLabel) : `<span style="color:var(--mb-select-placeholder-color)">${placeholder}</span>`}</span>`
					}
				</button>
				${
					clearVisible
						? '<button class="mb-select-clear" type="button" aria-label="Clear"><span class="mb-select-clear-icon">✕</span></button>'
						: ''
				}
				<button class="mb-select-dropdown" type="button" aria-label="Toggle options" ${this.disabled ? 'disabled' : ''}>
					<span class="mb-select-dropdown-icon">▾</span>
				</button>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen) {
			this.#renderOverlay();
		}
	}

	#handleRootClick(event: Event): void {
		if (this.disabled) return;
		const target = event.target as HTMLElement;

		if (target.closest('.mb-select-clear')) {
			event.preventDefault();
			this.#selectValue(null, true);
			return;
		}

		if (target.closest('.mb-select-trigger') || target.closest('.mb-select-dropdown')) {
			event.preventDefault();
			this.#togglePanel();
		}
	}

	#handleKeydown(event: KeyboardEvent): void {
		if (this.disabled) return;
		if (this.editable && (event.target as HTMLElement).matches('[data-role="editable"]') && event.key.length === 1) {
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (!this.#isOpen) {
					this.#openPanel();
				} else {
					this.#moveHighlight(1);
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!this.#isOpen) {
					this.#openPanel();
				} else {
					this.#moveHighlight(-1);
				}
				break;
			case 'Enter':
				event.preventDefault();
				if (!this.#isOpen) {
					this.#openPanel();
					return;
				}
				if (this.#highlightedIndex >= 0) {
					const item = this.#visibleOptions[this.#highlightedIndex];
					if (item && !item.disabled) {
						this.#selectValue(item.value, true);
						this.#closePanel(true);
					}
				}
				break;
			case 'Escape':
				if (this.#isOpen) {
					event.preventDefault();
					this.#closePanel(true);
				}
				break;
			default:
				break;
		}
	}

	#togglePanel(): void {
		if (this.#isOpen) {
			this.#closePanel(true);
		} else {
			this.#openPanel();
		}
	}

	#openPanel(): void {
		if (this.#isOpen || this.disabled) return;
		this.#isOpen = true;
		this.#highlightedIndex = this.#resolveSelectedVisibleIndex();
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#renderOverlay();

		const trigger = this._qs<HTMLElement>('.mb-select') ?? this;
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-select-overlay');
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
			this.#closePanel(true);
		};

		document.addEventListener('mousedown', onDocDown, true);
		this.#outsideCleanup = () => document.removeEventListener('mousedown', onDocDown, true);
		this.emit('mb-show');
		this._scheduleRender();
	}

	#closePanel(emitEvent: boolean): void {
		if (!this.#isOpen && !this.#portalHost) return;
		this.#isOpen = false;
		this.#positionCleanup?.();
		this.#positionCleanup = null;
		this.#outsideCleanup?.();
		this.#outsideCleanup = null;
		removePortal(this.#portalKey);
		this.#portalHost = null;
		this.#highlightedIndex = -1;
		if (emitEvent) this.emit('mb-hide');
		this._scheduleRender();
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;
		const rows = this.#getRenderRows();
		const scrollHeight = this._escape(this._str('scrollable-height', '14rem'));
		const filterPlaceholder = this._escape(this._str('filter-placeholder', 'Search'));
		const emptyMessage = this._escape(this._str('empty-message', 'No results found'));

		const optionsMarkup = rows.length
			? rows
					.map(row => {
						if (row.type === 'group') {
							return `<li class="mb-select-item-group" role="presentation">${this._escape(row.label)}</li>`;
						}

						const isSelected = this.#isEqual(this.modelValue, row.item.value);
						const selectedClass = isSelected ? ' mb-selected' : '';
						const highlightedClass = this.#highlightedIndex === row.index ? ' mb-highlighted' : '';
						return `<li
							class="mb-select-item${selectedClass}${highlightedClass}"
							data-option-index="${row.index}"
							role="option"
							aria-disabled="${row.item.disabled ? 'true' : 'false'}"
							aria-selected="${isSelected ? 'true' : 'false'}"
						>
							<span class="mb-select-item-label">${this._escape(row.item.label)}</span>
							${this.checkmark && isSelected ? '<span class="mb-select-check">✓</span>' : ''}
						</li>`;
					})
					.join('')
			: `<li class="mb-select-empty-message">${emptyMessage}</li>`;

		this.#portalHost.innerHTML = this._html`
			<div class="mb-select-overlay" data-owner="${this.#portalKey}">
				${
					this.filter
						? `<div class="mb-select-header">
							<input class="mb-select-filter" type="text" value="${this._escape(this.#filterValue)}" placeholder="${filterPlaceholder}" />
						</div>`
						: ''
				}
				<div class="mb-select-items-wrapper" style="max-height:${scrollHeight}">
					<ul id="${this.#listId}" class="mb-select-list" role="listbox">${optionsMarkup}</ul>
				</div>
			</div>
		`;

		this.#bindOverlayListeners();
	}

	#bindOverlayListeners(): void {
		if (!this.#portalHost) return;
		const filterInput = this.#portalHost.querySelector<HTMLInputElement>('.mb-select-filter');
		const list = this.#portalHost.querySelector<HTMLElement>('.mb-select-list');

		if (filterInput) {
			const onInput = (event: Event) => {
				this.#filterValue = (event.target as HTMLInputElement).value;
				this.emit('mb-filter', { value: this.#filterValue });
				this.#highlightedIndex = 0;
				this.#renderOverlay();
			};

			filterInput.addEventListener('input', onInput);
			this._addCleanup(() => filterInput.removeEventListener('input', onInput));
		}

		if (list) {
			const onClick = (event: Event) => {
				const item = (event.target as HTMLElement).closest<HTMLElement>('[data-option-index]');
				if (!item) return;
				const index = Number(item.getAttribute('data-option-index'));
				if (Number.isNaN(index)) return;
				const option = this.#visibleOptions[index];
				if (!option || option.disabled) return;
				this.#selectValue(option.value, true);
				this.#closePanel(true);
			};

			const onKeydown = (event: KeyboardEvent) => this.#handleKeydown(event);

			list.addEventListener('click', onClick);
			list.addEventListener('keydown', onKeydown);
			this._addCleanup(() => list.removeEventListener('click', onClick));
			this._addCleanup(() => list.removeEventListener('keydown', onKeydown));
		}
	}

	#getRenderRows(): RenderRow[] {
		const rows: RenderRow[] = [];
		this.#visibleOptions = [];
		const source = this.options;
		const normalizedFilter = this.#filterValue.trim().toLowerCase();

		for (const option of source) {
			const childrenRaw = option[this.optionGroupChildren];
			if (Array.isArray(childrenRaw)) {
				const children = childrenRaw.filter(
					(child): child is SelectOption => typeof child === 'object' && child !== null
				);
				const groupRows: RenderRow[] = [];
				for (const child of children) {
					const label = this.#getOptionLabel(child);
					if (normalizedFilter && !label.toLowerCase().includes(normalizedFilter)) continue;
					const item: FlattenedOption = {
						label,
						value: this.#getOptionValue(child),
						disabled: this.#isOptionDisabled(child),
						option: child,
					};
					const index = this.#visibleOptions.push(item) - 1;
					groupRows.push({ type: 'option', item, index });
				}

				if (groupRows.length > 0) {
					rows.push({ type: 'group', label: String(option[this.optionGroupLabel] ?? '') });
					rows.push(...groupRows);
				}
				continue;
			}

			const label = this.#getOptionLabel(option);
			if (normalizedFilter && !label.toLowerCase().includes(normalizedFilter)) continue;
			const item: FlattenedOption = {
				label,
				value: this.#getOptionValue(option),
				disabled: this.#isOptionDisabled(option),
				option,
			};
			const index = this.#visibleOptions.push(item) - 1;
			rows.push({ type: 'option', item, index });
		}

		if (this.#highlightedIndex >= this.#visibleOptions.length) {
			this.#highlightedIndex = this.#visibleOptions.length - 1;
		}
		if (this.#highlightedIndex < 0 && this.#visibleOptions.length > 0) {
			this.#highlightedIndex = this.#findNextEnabled(0, 1);
		}

		return rows;
	}

	#findSelectedOption(): FlattenedOption | null {
		const rows = this.#getRenderRows();
		if (rows.length === 0) return null;
		const value = this.modelValue;
		for (const option of this.#visibleOptions) {
			if (this.#isEqual(option.value, value)) return option;
		}
		for (const option of this.#flattenAllOptions()) {
			if (this.#isEqual(option.value, value)) return option;
		}
		return null;
	}

	#flattenAllOptions(): FlattenedOption[] {
		const output: FlattenedOption[] = [];
		for (const option of this.options) {
			const childrenRaw = option[this.optionGroupChildren];
			if (Array.isArray(childrenRaw)) {
				for (const child of childrenRaw) {
					if (typeof child !== 'object' || child == null) continue;
					const typed = child as SelectOption;
					output.push({
						label: this.#getOptionLabel(typed),
						value: this.#getOptionValue(typed),
						disabled: this.#isOptionDisabled(typed),
						option: typed,
					});
				}
				continue;
			}
			output.push({
				label: this.#getOptionLabel(option),
				value: this.#getOptionValue(option),
				disabled: this.#isOptionDisabled(option),
				option,
			});
		}
		return output;
	}

	#resolveSelectedVisibleIndex(): number {
		const selected = this.modelValue;
		for (let i = 0; i < this.#visibleOptions.length; i += 1) {
			if (this.#isEqual(this.#visibleOptions[i]?.value, selected)) return i;
		}
		return this.#findNextEnabled(0, 1);
	}

	#moveHighlight(direction: 1 | -1): void {
		if (this.#visibleOptions.length === 0) return;
		const start = this.#highlightedIndex < 0 ? (direction === 1 ? 0 : this.#visibleOptions.length - 1) : this.#highlightedIndex + direction;
		const next = this.#findNextEnabled(start, direction);
		if (next >= 0) {
			this.#highlightedIndex = next;
			this.#renderOverlay();
		}
	}

	#findNextEnabled(start: number, direction: 1 | -1): number {
		if (this.#visibleOptions.length === 0) return -1;
		let index = start;
		const max = this.#visibleOptions.length;
		for (let steps = 0; steps < max; steps += 1) {
			if (index < 0) index = max - 1;
			if (index >= max) index = 0;
			const item = this.#visibleOptions[index];
			if (item && !item.disabled) return index;
			index += direction;
		}
		return -1;
	}

	#selectValue(value: unknown, emitEvent: boolean): void {
		this.modelValue = value;
		if (this.editable) {
			const selected = this.#flattenAllOptions().find(item => this.#isEqual(item.value, value));
			this.#editableText = selected?.label ?? '';
		}
		if (emitEvent) {
			this.emit('mb-change', { value });
		}
		this._scheduleRender();
	}

	#getOptionLabel(option: SelectOption): string {
		const value = option[this.optionLabel] ?? option.label ?? option.value;
		return value == null ? '' : String(value);
	}

	#getOptionValue(option: SelectOption): unknown {
		if (this.optionValue in option) {
			return option[this.optionValue];
		}
		return option.value ?? option.label ?? null;
	}

	#isOptionDisabled(option: SelectOption): boolean {
		if (this.optionDisabled in option) {
			return Boolean(option[this.optionDisabled]);
		}
		return Boolean(option.disabled);
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
}

export const defineSelect = createDefine('mb-select', MbSelect);
export default MbSelect;
export {};
