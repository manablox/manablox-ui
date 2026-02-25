import type { AttributeConverter, SelectOption } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { MULTISELECT_STYLES } from './MultiSelect.styles.js';

type MultiSelectSize = 'small' | 'large' | '';
type MultiSelectVariant = 'outlined' | 'filled';
type MultiSelectDisplay = 'comma' | 'chip';

interface FlattenedOption {
	label: string;
	value: unknown;
	disabled: boolean;
}

type RenderRow =
	| { type: 'group'; label: string }
	| { type: 'option'; item: FlattenedOption; index: number };

function normalizeOptions(value: unknown): SelectOption[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is SelectOption => typeof item === 'object' && item !== null);
}

function normalizeValueArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

export class MbMultiSelect extends MbBaseComponent {
	static readonly _componentName = 'mb-multiselect';
	static readonly _componentStyles = MULTISELECT_STYLES;

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
			['display', 'string'],
			['select-all', 'boolean'],
			['selection-limit', 'number'],
			['max-selected-labels', 'number'],
			['selected-items-label', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbMultiSelect.attributeConverters.keys());
	}

	#portalKey = `mb-multiselect-${Math.random().toString(36).slice(2)}`;
	#listId = `mb-multiselect-list-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;
	#isFocused = false;
	#filterValue = '';
	#highlightedIndex = -1;
	#visibleOptions: FlattenedOption[] = [];
	#listenersBound = false;

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

	get modelValue(): unknown[] {
		return normalizeValueArray(this._obj<unknown>('model-value'));
	}
	set modelValue(value: unknown[]) {
		this.setAttribute('model-value', JSON.stringify(value ?? []));
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
	get selectAll(): boolean {
		return this._bool('select-all');
	}
	get size(): MultiSelectSize {
		const size = this._str('size', '');
		return size === 'small' || size === 'large' ? size : '';
	}
	get variant(): MultiSelectVariant {
		return this._str('variant', 'outlined') === 'filled' ? 'filled' : 'outlined';
	}
	get display(): MultiSelectDisplay {
		return this._str('display', 'comma') === 'chip' ? 'chip' : 'comma';
	}
	get selectionLimit(): number {
		const value = this._num('selection-limit', null);
		return value == null || value <= 0 ? 0 : value;
	}
	get maxSelectedLabels(): number {
		const value = this._num('max-selected-labels', 3);
		return value == null ? 3 : value;
	}
	get selectedItemsLabel(): string {
		return this._str('selected-items-label', '{0} items selected');
	}

	protected _render(): string {
		const selected = this.#getSelectedItems();
		const hasValue = selected.length > 0;
		const placeholder = this._escape(this._str('placeholder', 'Select options'));
		const sizeClass = this.size === 'small' ? 'mb-multiselect-sm' : this.size === 'large' ? 'mb-multiselect-lg' : '';
		const focusedClass = this.#isFocused || this.#isOpen ? 'mb-focused' : '';
		const invalidClass = this.invalid ? 'mb-invalid' : '';
		const disabledClass = this.disabled ? 'mb-disabled' : '';
		const filledClass = this.variant === 'filled' ? 'mb-filled' : '';

		return this._html`
			<div
				class="mb-multiselect ${sizeClass} ${focusedClass} ${invalidClass} ${disabledClass} ${filledClass}"
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded="${this.#isOpen ? 'true' : 'false'}"
				aria-controls="${this.#listId}"
			>
				<button class="mb-multiselect-trigger" type="button" ${this.disabled ? 'disabled' : ''}>
					<span class="mb-multiselect-label">${this.#renderLabel(selected, placeholder)}</span>
				</button>
				<div class="mb-multiselect-controls">
					${
						this.showClear && hasValue && !this.disabled
							? '<button class="mb-multiselect-clear" type="button" aria-label="Clear">✕</button>'
							: ''
					}
					<button class="mb-multiselect-dropdown" type="button" aria-label="Toggle options" ${this.disabled ? 'disabled' : ''}>▾</button>
				</div>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen) this.#renderOverlay();
	}

	#renderLabel(selected: FlattenedOption[], placeholder: string): string {
		if (selected.length === 0) {
			return `<span style="color:var(--mb-multiselect-placeholder-color)">${placeholder}</span>`;
		}

		if (this.maxSelectedLabels > 0 && selected.length > this.maxSelectedLabels) {
			const text = this.selectedItemsLabel.replace('{0}', String(selected.length));
			return this._escape(text);
		}

		if (this.display === 'chip') {
			return selected
				.map((item, index) => {
					return `<span class="mb-multiselect-chip" data-chip-index="${index}">
						<span class="mb-multiselect-chip-label">${this._escape(item.label)}</span>
						<button class="mb-multiselect-chip-remove" data-chip-remove="${index}" type="button" aria-label="Remove">✕</button>
					</span>`;
				})
				.join('');
		}

		return this._escape(selected.map(item => item.label).join(', '));
	}

	#handleRootClick(event: Event): void {
		if (this.disabled) return;
		const target = event.target as HTMLElement;

		if (target.closest('.mb-multiselect-clear')) {
			event.preventDefault();
			this.#updateSelection([], true);
			return;
		}

		const chipRemove = target.closest<HTMLElement>('[data-chip-remove]');
		if (chipRemove) {
			event.preventDefault();
			const index = Number(chipRemove.getAttribute('data-chip-remove'));
			if (!Number.isNaN(index)) {
				const selected = this.#getSelectedItems();
				const item = selected[index];
				if (item) this.#toggleItem(item.value, true);
			}
			return;
		}

		if (target.closest('.mb-multiselect-trigger') || target.closest('.mb-multiselect-dropdown')) {
			event.preventDefault();
			this.#togglePanel();
		}
	}

	#handleKeydown(event: KeyboardEvent): void {
		if (this.disabled) return;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (!this.#isOpen) this.#openPanel();
				else this.#moveHighlight(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!this.#isOpen) this.#openPanel();
				else this.#moveHighlight(-1);
				break;
			case 'Enter':
				event.preventDefault();
				if (!this.#isOpen) {
					this.#openPanel();
					return;
				}
				if (this.#highlightedIndex >= 0) {
					const item = this.#visibleOptions[this.#highlightedIndex];
					if (item && !item.disabled) this.#toggleItem(item.value, true);
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
		if (this.#isOpen) this.#closePanel(true);
		else this.#openPanel();
	}

	#openPanel(): void {
		if (this.#isOpen || this.disabled) return;
		this.#isOpen = true;
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#renderOverlay();

		const trigger = this._qs<HTMLElement>('.mb-multiselect') ?? this;
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-multiselect-overlay');
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
		if (emitEvent) this.emit('mb-hide');
		this._scheduleRender();
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;
		const rows = this.#buildRows();
		const selectedValues = this.modelValue;
		const scrollHeight = this._escape(this._str('scrollable-height', '14rem'));
		const emptyMessage = this._escape(this._str('empty-message', 'No results found'));
		const filterPlaceholder = this._escape(this._str('filter-placeholder', 'Search'));

		const optionsMarkup = rows.length
			? rows
					.map(row => {
						if (row.type === 'group') {
							return `<li class="mb-multiselect-item-group" role="presentation">${this._escape(row.label)}</li>`;
						}
						const selected = selectedValues.some(value => this.#isEqual(value, row.item.value));
						const selectedClass = selected ? ' mb-selected' : '';
						const highlightedClass = this.#highlightedIndex === row.index ? ' mb-highlighted' : '';
						return `<li
							class="mb-multiselect-item${selectedClass}${highlightedClass}"
							data-option-index="${row.index}"
							role="option"
							aria-selected="${selected ? 'true' : 'false'}"
							aria-disabled="${row.item.disabled ? 'true' : 'false'}"
						>
							<span class="mb-multiselect-item-check">${selected ? '☑' : '☐'}</span>
							<span>${this._escape(row.item.label)}</span>
						</li>`;
					})
					.join('')
			: `<li class="mb-multiselect-empty-message">${emptyMessage}</li>`;

		const selectable = this.#visibleOptions.filter(item => !item.disabled);
		const selectedCount = selectable.filter(item => selectedValues.some(v => this.#isEqual(v, item.value))).length;
		const allSelected = selectable.length > 0 && selectedCount === selectable.length;

		this.#portalHost.innerHTML = this._html`
			<div class="mb-multiselect-overlay">
				${
					this.filter || this.selectAll
						? `<div class="mb-multiselect-header">
							${this.selectAll ? `<label><input type="checkbox" data-role="select-all" ${allSelected ? 'checked' : ''} /> Select all</label>` : ''}
							${this.filter ? `<input class="mb-multiselect-filter" type="text" value="${this._escape(this.#filterValue)}" placeholder="${filterPlaceholder}" />` : ''}
						</div>`
						: ''
				}
				<div class="mb-multiselect-items-wrapper" style="max-height:${scrollHeight}">
					<ul id="${this.#listId}" class="mb-multiselect-list" role="listbox" aria-multiselectable="true">${optionsMarkup}</ul>
				</div>
			</div>
		`;

		this.#bindOverlayListeners();
	}

	#bindOverlayListeners(): void {
		if (!this.#portalHost) return;
		const filterInput = this.#portalHost.querySelector<HTMLInputElement>('.mb-multiselect-filter');
		const list = this.#portalHost.querySelector<HTMLElement>('.mb-multiselect-list');
		const selectAll = this.#portalHost.querySelector<HTMLInputElement>('[data-role="select-all"]');

		if (filterInput) {
			const onInput = (event: Event) => {
				this.#filterValue = (event.target as HTMLInputElement).value;
				this.emit('mb-filter', { value: this.#filterValue });
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
				this.#toggleItem(option.value, true);
			};
			list.addEventListener('click', onClick);
			this._addCleanup(() => list.removeEventListener('click', onClick));
		}

		if (selectAll) {
			const onChange = (event: Event) => {
				const checked = (event.target as HTMLInputElement).checked;
				if (checked) {
					const all = this.#visibleOptions.filter(item => !item.disabled).map(item => item.value);
					this.#updateSelection(all, true);
				} else {
					this.#updateSelection([], true);
				}
			};
			selectAll.addEventListener('change', onChange);
			this._addCleanup(() => selectAll.removeEventListener('change', onChange));
		}
	}

	#buildRows(): RenderRow[] {
		this.#visibleOptions = [];
		const rows: RenderRow[] = [];
		const filter = this.#filterValue.trim().toLowerCase();

		for (const option of this.options) {
			const childrenRaw = option[this.optionGroupChildren];
			if (Array.isArray(childrenRaw)) {
				const groupRows: RenderRow[] = [];
				for (const child of childrenRaw) {
					if (typeof child !== 'object' || child == null) continue;
					const typed = child as SelectOption;
					const label = this.#getOptionLabel(typed);
					if (filter && !label.toLowerCase().includes(filter)) continue;
					const item: FlattenedOption = {
						label,
						value: this.#getOptionValue(typed),
						disabled: this.#isOptionDisabled(typed),
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
			if (filter && !label.toLowerCase().includes(filter)) continue;
			const item: FlattenedOption = {
				label,
				value: this.#getOptionValue(option),
				disabled: this.#isOptionDisabled(option),
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
		for (let steps = 0; steps < this.#visibleOptions.length; steps += 1) {
			if (index < 0) index = this.#visibleOptions.length - 1;
			if (index >= this.#visibleOptions.length) index = 0;
			const item = this.#visibleOptions[index];
			if (item && !item.disabled) return index;
			index += direction;
		}
		return -1;
	}

	#toggleItem(value: unknown, emitEvent: boolean): void {
		const current = [...this.modelValue];
		const existingIndex = current.findIndex(item => this.#isEqual(item, value));
		if (existingIndex >= 0) {
			current.splice(existingIndex, 1);
			this.#updateSelection(current, emitEvent);
			return;
		}

		if (this.selectionLimit > 0 && current.length >= this.selectionLimit) return;
		current.push(value);
		this.#updateSelection(current, emitEvent);
	}

	#updateSelection(value: unknown[], emitEvent: boolean): void {
		this.modelValue = value;
		if (emitEvent) {
			this.emit('mb-change', { value });
		}
		this._scheduleRender();
		if (this.#isOpen) this.#renderOverlay();
	}

	#getSelectedItems(): FlattenedOption[] {
		const selectedValues = this.modelValue;
		if (selectedValues.length === 0) return [];

		const all: FlattenedOption[] = [];
		for (const option of this.options) {
			const childrenRaw = option[this.optionGroupChildren];
			if (Array.isArray(childrenRaw)) {
				for (const child of childrenRaw) {
					if (typeof child !== 'object' || child == null) continue;
					const typed = child as SelectOption;
					all.push({
						label: this.#getOptionLabel(typed),
						value: this.#getOptionValue(typed),
						disabled: this.#isOptionDisabled(typed),
					});
				}
				continue;
			}
			all.push({
				label: this.#getOptionLabel(option),
				value: this.#getOptionValue(option),
				disabled: this.#isOptionDisabled(option),
			});
		}

		return all.filter(item => selectedValues.some(value => this.#isEqual(value, item.value)));
	}

	#getOptionLabel(option: SelectOption): string {
		const value = option[this.optionLabel] ?? option.label ?? option.value;
		return value == null ? '' : String(value);
	}

	#getOptionValue(option: SelectOption): unknown {
		if (this.optionValue in option) return option[this.optionValue];
		return option.value ?? option.label ?? null;
	}

	#isOptionDisabled(option: SelectOption): boolean {
		if (this.optionDisabled in option) return Boolean(option[this.optionDisabled]);
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

export const defineMultiSelect = createDefine('mb-multiselect', MbMultiSelect);
export default MbMultiSelect;
export {};
