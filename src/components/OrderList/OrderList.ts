import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { ORDERLIST_STYLES } from './OrderList.styles.js';

export class MbOrderList extends MbBaseComponent {
	static readonly _componentName = 'mb-orderlist';
	static readonly _componentStyles = ORDERLIST_STYLES;

	renderItem?: (item: unknown, index: number) => string;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['model-value', 'object'],
			['data-key', 'string'],
			['header', 'string'],
			['filter', 'boolean'],
			['filter-placeholder', 'string'],
			['filter-locale', 'string'],
			['filter-fields', 'object'],
			['drag-drop', 'boolean'],
			['meta-key-selection', 'boolean'],
			['striped-rows', 'boolean'],
			['tabindex', 'number'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbOrderList.attributeConverters.keys());
	}

	#listenersBound = false;
	#template: string | null = null;
	#filterValue = '';
	#selection = new Set<number>();
	#anchorIndex = -1;
	#dragIndex = -1;

	connectedCallback(): void {
		this.#captureTemplate();
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onClick(event);
		const onInput = (event: Event) => this.#onInput(event);
		const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);
		const onDragStart = (event: DragEvent) => this.#onDragStart(event);
		const onDragOver = (event: DragEvent) => this.#onDragOver(event);
		const onDrop = (event: DragEvent) => this.#onDrop(event);
		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('keydown', onKeydown);
		this.addEventListener('dragstart', onDragStart);
		this.addEventListener('dragover', onDragOver);
		this.addEventListener('drop', onDrop);
		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
		this._addCleanup(() => this.removeEventListener('dragstart', onDragStart));
		this._addCleanup(() => this.removeEventListener('dragover', onDragOver));
		this._addCleanup(() => this.removeEventListener('drop', onDrop));
	}

	get value(): unknown[] {
		const model = this._obj<unknown[]>('model-value');
		const base = this._obj<unknown[]>('value');
		if (Array.isArray(model)) return model;
		return Array.isArray(base) ? base : [];
	}
	set value(next: unknown[]) {
		const payload = JSON.stringify(next ?? []);
		this.setAttribute('value', payload);
		this.setAttribute('model-value', payload);
	}

	get dataKey(): string {
		return this._str('data-key', 'id');
	}

	get metaKeySelection(): boolean {
		return this._bool('meta-key-selection');
	}

	protected _render(): string {
		const filtered = this.#filteredItems();
		const listClass = this._bool('striped-rows') ? 'mb-orderlist-list mb-orderlist-striped' : 'mb-orderlist-list';
		return this._html`
			<div class="mb-orderlist">
				<div class="mb-orderlist-controls" aria-label="Reorder controls">
					<button type="button" data-action="move-top">⏫</button>
					<button type="button" data-action="move-up">▲</button>
					<button type="button" data-action="move-down">▼</button>
					<button type="button" data-action="move-bottom">⏬</button>
				</div>
				<div class="mb-orderlist-list-container">
					${this._str('header') ? `<div class="mb-orderlist-header">${this._escape(this._str('header'))}</div>` : ''}
					${
						this._bool('filter')
							? `<div class="mb-orderlist-filter-container"><input type="text" value="${this._escape(this.#filterValue)}" placeholder="${this._escape(this._str('filter-placeholder', 'Filter'))}" aria-label="Filter list" /></div>`
							: ''
					}
					<ul class="${listClass}" role="listbox" tabindex="${this._num('tabindex', 0) ?? 0}" aria-multiselectable="true">
						${filtered.map(entry => this.#renderItemRow(entry.item, entry.index)).join('')}
					</ul>
				</div>
			</div>
		`;
	}

	#renderItemRow(item: unknown, index: number): string {
		const selected = this.#selection.has(index);
		const classes = ['mb-orderlist-item', selected ? 'mb-orderlist-item-selected' : ''].filter(Boolean).join(' ');
		const content = this.#renderItemMarkup(item, index);
		return `<li class="${classes}" data-index="${index}" role="option" aria-selected="${selected ? 'true' : 'false'}" ${this._bool('drag-drop') ? 'draggable="true"' : ''}>${content}</li>`;
	}

	#renderItemMarkup(item: unknown, index: number): string {
		if (typeof this.renderItem === 'function') {
			return this.renderItem(item, index) ?? '';
		}
		if (this.#template) {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return this.#template
				.replace(/{{\s*index\s*}}/g, this._escape(index))
				.replace(/{{\s*item\s*}}/g, this._escape(item))
				.replace(/{{\s*([\w-]+)\s*}}/g, (_, key: string) => this._escape(record[key] ?? ''));
		}
		return this._escape(item);
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLElement;
		if (!target.matches('.mb-orderlist-filter-container input')) return;
		this.#filterValue = (target as HTMLInputElement).value;
		this.emit('mb-filter', { value: this.#filterValue });
		this._scheduleRender();
	}

	#onClick(event: Event): void {
		const target = event.target as HTMLElement;
		const action = target.closest<HTMLElement>('[data-action]')?.getAttribute('data-action');
		if (action) {
			this.#performMove(action);
			return;
		}

		const row = target.closest<HTMLElement>('[data-index]');
		if (!row) return;
		const index = Number(row.getAttribute('data-index'));
		if (Number.isNaN(index)) return;
		const mouseEvent = event as MouseEvent;
		this.#selectIndex(index, mouseEvent);
	}

	#onKeydown(event: KeyboardEvent): void {
		if (!['ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) return;
		const list = (event.target as HTMLElement).closest('.mb-orderlist-list');
		if (!list) return;
		const values = [...this.#selection].sort((a, b) => a - b);
		const current = values.length ? (values[values.length - 1] ?? 0) : 0;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.#selectIndex(Math.min(this.value.length - 1, current + 1), { shiftKey: event.shiftKey, ctrlKey: false, metaKey: false } as MouseEvent);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.#selectIndex(Math.max(0, current - 1), { shiftKey: event.shiftKey, ctrlKey: false, metaKey: false } as MouseEvent);
		} else {
			event.preventDefault();
			this.emit('mb-selection-change', { value: this.#selectedValues() });
		}
	}

	#selectIndex(index: number, mouseEvent: MouseEvent): void {
		const ctrl = mouseEvent.ctrlKey || mouseEvent.metaKey;
		if (mouseEvent.shiftKey && this.#anchorIndex >= 0) {
			const sortedRange = [this.#anchorIndex, index].sort((a, b) => a - b);
			const start = sortedRange[0] ?? 0;
			const end = sortedRange[1] ?? start;
			this.#selection.clear();
			for (let i = start; i <= end; i += 1) this.#selection.add(i);
		} else if (this.metaKeySelection && ctrl) {
			if (this.#selection.has(index)) this.#selection.delete(index);
			else this.#selection.add(index);
			this.#anchorIndex = index;
		} else {
			this.#selection.clear();
			this.#selection.add(index);
			this.#anchorIndex = index;
		}

		this.emit('mb-selection-change', { value: this.#selectedValues() });
		this._scheduleRender();
	}

	#performMove(action: string): void {
		if (this.#selection.size === 0) return;
		const list = [...this.value];
		const selected = [...this.#selection].sort((a, b) => a - b);
		const selectedItems = selected.map(index => list[index]);
		const remainder = list.filter((_, index) => !this.#selection.has(index));
		let next: unknown[] = list;
		switch (action) {
			case 'move-up': {
				if (selected[0] === 0) return;
				next = [...list];
				selected.forEach(index => {
					[next[index - 1], next[index]] = [next[index], next[index - 1]];
				});
				break;
			}
			case 'move-down': {
				if ((selected[selected.length - 1] ?? 0) >= list.length - 1) return;
				next = [...list];
				selected
					.slice()
					.reverse()
					.forEach(index => {
						[next[index + 1], next[index]] = [next[index], next[index + 1]];
					});
				break;
			}
			case 'move-top':
				next = [...selectedItems, ...remainder];
				break;
			case 'move-bottom':
				next = [...remainder, ...selectedItems];
				break;
			default:
				return;
		}

		this.value = next;
		this.#selection = new Set(selectedItems.map(item => next.indexOf(item)).filter(index => index >= 0));
		this.emit('mb-change', { value: next });
		this._scheduleRender();
	}

	#onDragStart(event: DragEvent): void {
		if (!this._bool('drag-drop')) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (!row || !event.dataTransfer) return;
		this.#dragIndex = Number(row.getAttribute('data-index'));
		event.dataTransfer.setData('text/plain', String(this.#dragIndex));
		event.dataTransfer.effectAllowed = 'move';
	}

	#onDragOver(event: DragEvent): void {
		if (!this._bool('drag-drop') || this.#dragIndex < 0) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (!row) return;
		event.preventDefault();
	}

	#onDrop(event: DragEvent): void {
		if (!this._bool('drag-drop') || this.#dragIndex < 0) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (!row) return;
		event.preventDefault();
		const dropIndex = Number(row.getAttribute('data-index'));
		if (Number.isNaN(dropIndex) || dropIndex === this.#dragIndex) return;
		const next = [...this.value];
		const [moved] = next.splice(this.#dragIndex, 1);
		next.splice(dropIndex, 0, moved);
		this.value = next;
		this.#dragIndex = -1;
		this.emit('mb-change', { value: next });
		this._scheduleRender();
	}

	#filteredItems(): Array<{ item: unknown; index: number }> {
		const filterValue = this.#filterValue.trim().toLocaleLowerCase(this._str('filter-locale') || undefined);
		if (!filterValue) return this.value.map((item, index) => ({ item, index }));

		const fields = this._obj<string[]>('filter-fields');
		return this.value
			.map((item, index) => ({ item, index }))
			.filter(entry => {
				if (typeof entry.item === 'string') return entry.item.toLocaleLowerCase().includes(filterValue);
				if (typeof entry.item !== 'object' || entry.item == null) return String(entry.item).toLocaleLowerCase().includes(filterValue);
				const record = entry.item as Record<string, unknown>;
				const keys = Array.isArray(fields) && fields.length ? fields : Object.keys(record);
				return keys.some(key => String(record[key] ?? '').toLocaleLowerCase().includes(filterValue));
			});
	}

	#selectedValues(): unknown[] {
		return [...this.#selection].sort((a, b) => a - b).map(index => this.value[index]);
	}

	#captureTemplate(): void {
		const template = this.querySelector<HTMLTemplateElement>('template[data-slot="item"]');
		this.#template = template?.innerHTML ?? null;
	}
}

export const defineOrderList = createDefine('mb-orderlist', MbOrderList);

export {};
