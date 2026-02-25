import type { AttributeConverter, SelectOption } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { LISTBOX_STYLES } from './ListBox.styles.js';

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

export class MbListBox extends MbBaseComponent {
	static readonly _componentName = 'mb-listbox';
	static readonly _componentStyles = LISTBOX_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['options', 'object'],
			['option-label', 'string'],
			['option-value', 'string'],
			['option-disabled', 'string'],
			['option-group-label', 'string'],
			['option-group-children', 'string'],
			['model-value', 'object'],
			['multiple', 'boolean'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['filter', 'boolean'],
			['filter-placeholder', 'string'],
			['checkmark', 'boolean'],
			['empty-message', 'string'],
			['scrollable-height', 'string'],
			['meta-key-selection', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbListBox.attributeConverters.keys());
	}

	#listId = `mb-listbox-list-${Math.random().toString(36).slice(2)}`;
	#filterValue = '';
	#highlightedIndex = -1;
	#visibleOptions: FlattenedOption[] = [];
	#listenersBound = false;

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#handleClick(event);
		const onInput = (event: Event) => this.#handleInput(event);
		const onKeydown = (event: KeyboardEvent) => this.#handleKeydown(event);

		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('keydown', onKeydown);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
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
		if (value == null) this.removeAttribute('model-value');
		else this.setAttribute('model-value', JSON.stringify(value));
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
	get multiple(): boolean {
		return this._bool('multiple');
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
	get checkmark(): boolean {
		return this._bool('checkmark');
	}
	get metaKeySelection(): boolean {
		return this._bool('meta-key-selection');
	}

	protected _render(): string {
		const rows = this.#buildRows();
		const emptyMessage = this._escape(this._str('empty-message', 'No results found'));
		const filterPlaceholder = this._escape(this._str('filter-placeholder', 'Search'));
		const scrollHeight = this._escape(this._str('scrollable-height', '14rem'));

		const listMarkup = rows.length
			? rows
					.map(row => {
						if (row.type === 'group') {
							return `<li class="mb-listbox-item-group" part="group" role="presentation">${this._escape(row.label)}</li>`;
						}
						const selected = this.#isSelected(row.item.value);
						const selectedClass = selected ? ' mb-selected' : '';
						const highlightedClass = this.#highlightedIndex === row.index ? ' mb-highlighted' : '';
						return `<li
							class="mb-listbox-item${selectedClass}${highlightedClass}"
							part="option"
							data-option-index="${row.index}"
							role="option"
							aria-selected="${selected ? 'true' : 'false'}"
							aria-disabled="${row.item.disabled ? 'true' : 'false'}"
						>
							<span part="option-label">${this._escape(row.item.label)}</span>
							${this.checkmark && selected ? '<span part="checkmark">✓</span>' : ''}
						</li>`;
					})
					.join('')
			: `<li class="mb-listbox-empty-message" part="empty">${emptyMessage}</li>`;

		const invalidClass = this.invalid ? 'mb-invalid' : '';
		const disabledClass = this.disabled ? 'mb-disabled' : '';

		return this._html`
			<div class="mb-listbox ${invalidClass} ${disabledClass}" part="root">
				${
					this.filter
						? `<div class="mb-listbox-header">
							<input class="mb-listbox-filter" part="filter" type="text" value="${this._escape(this.#filterValue)}" placeholder="${filterPlaceholder}" ${this.disabled ? 'disabled' : ''} />
						</div>`
						: ''
				}
				<div class="mb-listbox-items-wrapper" part="list-wrapper" style="max-height:${scrollHeight}">
					<ul id="${this.#listId}" class="mb-listbox-list" part="list" role="listbox" tabindex="0" ${this.multiple ? 'aria-multiselectable="true"' : ''}>
						${listMarkup}
					</ul>
				</div>
			</div>
		`;
	}

	#handleInput(event: Event): void {
		const target = event.target as HTMLElement;
		if (!target.matches('.mb-listbox-filter')) return;
		this.#filterValue = (target as HTMLInputElement).value;
		this.emit('mb-filter', { value: this.#filterValue });
		this._scheduleRender();
	}

	#handleClick(event: Event): void {
		if (this.disabled) return;
		const target = (event.target as HTMLElement).closest<HTMLElement>('[data-option-index]');
		if (!target) return;
		const index = Number(target.getAttribute('data-option-index'));
		if (Number.isNaN(index)) return;
		const option = this.#visibleOptions[index];
		if (!option || option.disabled) return;

		this.#highlightedIndex = index;
		const mouseEvent = event as MouseEvent;
		this.#select(option.value, Boolean(mouseEvent.metaKey || mouseEvent.ctrlKey));
	}

	#handleKeydown(event: KeyboardEvent): void {
		if (this.disabled) return;
		const target = event.target as HTMLElement;
		if (target.matches('.mb-listbox-filter')) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this.#moveHighlight(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.#moveHighlight(-1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (this.#highlightedIndex >= 0) {
					const option = this.#visibleOptions[this.#highlightedIndex];
					if (option && !option.disabled) {
						this.#select(option.value, event.metaKey || event.ctrlKey);
					}
				}
				break;
			default:
				break;
		}
	}

	#moveHighlight(direction: 1 | -1): void {
		if (this.#visibleOptions.length === 0) return;
		let index = this.#highlightedIndex;
		if (index < 0) index = direction === 1 ? 0 : this.#visibleOptions.length - 1;
		else index += direction;

		for (let i = 0; i < this.#visibleOptions.length; i += 1) {
			if (index < 0) index = this.#visibleOptions.length - 1;
			if (index >= this.#visibleOptions.length) index = 0;
			const option = this.#visibleOptions[index];
			if (option && !option.disabled) {
				this.#highlightedIndex = index;
				this._scheduleRender();
				return;
			}
			index += direction;
		}
	}

	#select(value: unknown, withMetaKey: boolean): void {
		if (!this.multiple) {
			this.modelValue = value;
			this.emit('mb-change', { value });
			this._scheduleRender();
			return;
		}

		const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
		const index = current.findIndex(item => this.#isEqual(item, value));

		if (this.metaKeySelection && !withMetaKey) {
			if (index >= 0 && current.length === 1) {
				this.modelValue = [];
				this.emit('mb-change', { value: [] });
			} else {
				this.modelValue = [value];
				this.emit('mb-change', { value: [value] });
			}
			this._scheduleRender();
			return;
		}

		if (index >= 0) current.splice(index, 1);
		else current.push(value);

		this.modelValue = current;
		this.emit('mb-change', { value: current });
		this._scheduleRender();
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
			this.#highlightedIndex = 0;
		}

		return rows;
	}

	#isSelected(value: unknown): boolean {
		const current = this.modelValue;
		if (this.multiple) {
			if (!Array.isArray(current)) return false;
			return current.some(item => this.#isEqual(item, value));
		}
		return this.#isEqual(current, value);
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

export const defineListBox = createDefine('mb-listbox', MbListBox);
export default MbListBox;
export {};
