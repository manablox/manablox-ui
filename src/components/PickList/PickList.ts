import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { PICKLIST_STYLES } from './PickList.styles.js';

type ListType = 'source' | 'target';

interface ListSelectionState {
	source: Set<number>;
	target: Set<number>;
}

export class MbPickList extends MbBaseComponent {
	static readonly _componentName = 'mb-picklist';
	static readonly _componentStyles = PICKLIST_STYLES;

	renderItem?: (item: unknown, index: number, listType: ListType) => string;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['source', 'object'],
			['target', 'object'],
			['source-header', 'string'],
			['target-header', 'string'],
			['source-filter', 'boolean'],
			['target-filter', 'boolean'],
			['source-filter-placeholder', 'string'],
			['target-filter-placeholder', 'string'],
			['filter-locale', 'string'],
			['meta-key-selection', 'boolean'],
			['data-key', 'string'],
			['breakpoint', 'string'],
			['drag-drop', 'boolean'],
			['show-source-controls', 'boolean'],
			['show-target-controls', 'boolean'],
			['striped-rows', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbPickList.attributeConverters.keys());
	}

	#listenersBound = false;
	#selection: ListSelectionState = {
		source: new Set<number>(),
		target: new Set<number>(),
	};
	#filters = { source: '', target: '' };
	#template: string | null = null;
	#dragContext: { list: ListType; index: number } | null = null;

	connectedCallback(): void {
		this.#captureTemplate();
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onClick(event);
		const onInput = (event: Event) => this.#onInput(event);
		const onDragStart = (event: DragEvent) => this.#onDragStart(event);
		const onDragOver = (event: DragEvent) => this.#onDragOver(event);
		const onDrop = (event: DragEvent) => this.#onDrop(event);
		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('dragstart', onDragStart);
		this.addEventListener('dragover', onDragOver);
		this.addEventListener('drop', onDrop);
		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('dragstart', onDragStart));
		this._addCleanup(() => this.removeEventListener('dragover', onDragOver));
		this._addCleanup(() => this.removeEventListener('drop', onDrop));
	}

	get source(): unknown[] {
		const value = this._obj<unknown>('source');
		return Array.isArray(value) ? value : [];
	}
	set source(next: unknown[]) {
		this.setAttribute('source', JSON.stringify(next ?? []));
	}

	get target(): unknown[] {
		const value = this._obj<unknown>('target');
		return Array.isArray(value) ? value : [];
	}
	set target(next: unknown[]) {
		this.setAttribute('target', JSON.stringify(next ?? []));
	}

	get metaKeySelection(): boolean {
		return this._bool('meta-key-selection');
	}

	protected _render(): string {
		const source = this.#filtered(this.source, 'source');
		const target = this.#filtered(this.target, 'target');
		const rootClasses = ['mb-picklist', this._bool('striped-rows') ? 'mb-picklist-striped' : ''].filter(Boolean).join(' ');
		const breakpoint = this._str('breakpoint', '960px');
		return this._html`
			<div class="${rootClasses}" part="root" data-breakpoint="${this._escape(breakpoint)}">
				<slot part="templates" hidden></slot>
				${this.#renderList('source', source)}
				<div class="mb-picklist-controls" part="controls" aria-label="Move controls">
					<button type="button" data-action="move-to-target">&gt;</button>
					<button type="button" data-action="move-all-to-target">&gt;&gt;</button>
					<button type="button" data-action="move-to-source">&lt;</button>
					<button type="button" data-action="move-all-to-source">&lt;&lt;</button>
				</div>
				${this.#renderList('target', target)}
			</div>
		`;
	}

	#renderList(type: ListType, list: Array<{ item: unknown; index: number }>): string {
		const showFilter = this._bool(type === 'source' ? 'source-filter' : 'target-filter');
		const placeholder = this._escape(this._str(type === 'source' ? 'source-filter-placeholder' : 'target-filter-placeholder', 'Filter'));
		const header = this._escape(this._str(type === 'source' ? 'source-header' : 'target-header', type === 'source' ? 'Source' : 'Target'));
		const selection = this.#selection[type];
		const showControls = this._bool(type === 'source' ? 'show-source-controls' : 'show-target-controls');
		const listClass = 'mb-picklist-list';
		return `<div class="mb-picklist-list-wrapper" part="${type}-list-wrapper" data-list="${type}">
			<div class="mb-picklist-list-container" part="${type}-list-container">
				<div class="mb-picklist-header" part="${type}-header">${header}</div>
				${showFilter ? `<div class="mb-picklist-filter-container" part="${type}-filter-container"><input part="${type}-filter" type="text" data-list-filter="${type}" value="${this._escape(this.#filters[type])}" placeholder="${placeholder}" /></div>` : ''}
				<ul class="${listClass}" part="${type}-list" role="listbox" aria-multiselectable="true" data-list="${type}">
					${list
						.map(entry => {
							const selected = selection.has(entry.index);
							return `<li class="mb-picklist-item${selected ? ' mb-picklist-item-selected' : ''}" part="item" role="option" aria-selected="${selected ? 'true' : 'false'}" data-list="${type}" data-index="${entry.index}" ${this._bool('drag-drop') ? 'draggable="true"' : ''}>${this.#renderItem(type, entry.item, entry.index)}</li>`;
						})
						.join('')}
				</ul>
				${showControls ? `<div class="mb-picklist-list-controls" part="${type}-list-controls">
					<button type="button" data-action="${type}-move-top">⏫</button>
					<button type="button" data-action="${type}-move-up">▲</button>
					<button type="button" data-action="${type}-move-down">▼</button>
					<button type="button" data-action="${type}-move-bottom">⏬</button>
				</div>` : ''}
			</div>
		</div>`;
	}

	#renderItem(type: ListType, item: unknown, index: number): string {
		if (typeof this.renderItem === 'function') {
			return this.renderItem(item, index, type) ?? '';
		}
		if (this.#template) {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return this.#template
				.replace(/{{\s*list\s*}}/g, this._escape(type))
				.replace(/{{\s*index\s*}}/g, this._escape(index))
				.replace(/{{\s*item\s*}}/g, this._escape(item))
				.replace(/{{\s*([\w-]+)\s*}}/g, (_, key: string) => this._escape(record[key] ?? ''));
		}
		return this._escape(item);
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLElement;
		if (!target.matches('[data-list-filter]')) return;
		const type = target.getAttribute('data-list-filter') as ListType | null;
		if (!type) return;
		this.#filters[type] = (target as HTMLInputElement).value;
		this.emit('mb-selection-change', { source: this.#selectedValues('source'), target: this.#selectedValues('target') });
		this._scheduleRender();
	}

	#onClick(event: Event): void {
		const target = event.target as HTMLElement;
		const action = target.closest<HTMLElement>('[data-action]')?.getAttribute('data-action');
		if (action) {
			this.#applyAction(action);
			return;
		}

		const row = target.closest<HTMLElement>('[data-index][data-list]');
		if (!row) return;
		const list = row.getAttribute('data-list') as ListType | null;
		const index = Number(row.getAttribute('data-index'));
		if (!list || Number.isNaN(index)) return;
		this.#toggleSelection(list, index, event as MouseEvent);
	}

	#applyAction(action: string): void {
		switch (action) {
			case 'move-to-target':
				this.#moveSelected('source', 'target', 'mb-move-to-target');
				break;
			case 'move-all-to-target':
				this.#moveAll('source', 'target', 'mb-move-all-to-target');
				break;
			case 'move-to-source':
				this.#moveSelected('target', 'source', 'mb-move-to-source');
				break;
			case 'move-all-to-source':
				this.#moveAll('target', 'source', 'mb-move-all-to-source');
				break;
			case 'source-move-up':
			case 'source-move-down':
			case 'source-move-top':
			case 'source-move-bottom':
				this.#reorderWithin('source', action.replace('source-', ''));
				break;
			case 'target-move-up':
			case 'target-move-down':
			case 'target-move-top':
			case 'target-move-bottom':
				this.#reorderWithin('target', action.replace('target-', ''));
				break;
			default:
				break;
		}
	}

	#toggleSelection(list: ListType, index: number, event: MouseEvent): void {
		const selected = this.#selection[list];
		const meta = event.ctrlKey || event.metaKey;
		if (this.metaKeySelection && meta) {
			if (selected.has(index)) selected.delete(index);
			else selected.add(index);
		} else {
			selected.clear();
			selected.add(index);
		}
		this.emit('mb-selection-change', { source: this.#selectedValues('source'), target: this.#selectedValues('target') });
		this._scheduleRender();
	}

	#moveSelected(from: ListType, to: ListType, eventName: string): void {
		const sourceList = [...(from === 'source' ? this.source : this.target)];
		const targetList = [...(to === 'source' ? this.source : this.target)];
		const selectedIndices = [...this.#selection[from]].sort((a, b) => a - b);
		if (selectedIndices.length === 0) return;

		const selectedItems = selectedIndices.map(index => sourceList[index]);
		const remaining = sourceList.filter((_, index) => !this.#selection[from].has(index));
		const nextTarget = [...targetList, ...selectedItems];

		if (from === 'source') {
			this.source = remaining;
			this.target = nextTarget;
		} else {
			this.target = remaining;
			this.source = nextTarget;
		}

		this.#selection[from].clear();
		this.emit(eventName, { source: this.source, target: this.target });
		this.emit('mb-change', { source: this.source, target: this.target });
		this._scheduleRender();
	}

	#moveAll(from: ListType, to: ListType, eventName: string): void {
		const fromList = from === 'source' ? this.source : this.target;
		if (fromList.length === 0) return;
		const toList = to === 'source' ? this.source : this.target;
		const nextTo = [...toList, ...fromList];
		if (from === 'source') {
			this.source = [];
			this.target = nextTo;
		} else {
			this.target = [];
			this.source = nextTo;
		}

		this.#selection[from].clear();
		this.emit(eventName, { source: this.source, target: this.target });
		this.emit('mb-change', { source: this.source, target: this.target });
		this._scheduleRender();
	}

	#reorderWithin(list: ListType, mode: string): void {
		const selection = [...this.#selection[list]].sort((a, b) => a - b);
		if (!selection.length) return;
		const items = [...(list === 'source' ? this.source : this.target)];
		const selectedValues = selection.map(index => items[index]);
		const remaining = items.filter((_, index) => !this.#selection[list].has(index));
		let next = items;

		switch (mode) {
			case 'move-up':
				if (selection[0] === 0) return;
				next = [...items];
				selection.forEach(index => {
					[next[index - 1], next[index]] = [next[index], next[index - 1]];
				});
				break;
			case 'move-down':
				if ((selection[selection.length - 1] ?? 0) >= items.length - 1) return;
				next = [...items];
				selection
					.slice()
					.reverse()
					.forEach(index => {
						[next[index + 1], next[index]] = [next[index], next[index + 1]];
					});
				break;
			case 'move-top':
				next = [...selectedValues, ...remaining];
				break;
			case 'move-bottom':
				next = [...remaining, ...selectedValues];
				break;
			default:
				return;
		}

		if (list === 'source') this.source = next;
		else this.target = next;
		this.emit('mb-change', { source: this.source, target: this.target });
		this._scheduleRender();
	}

	#onDragStart(event: DragEvent): void {
		if (!this._bool('drag-drop')) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index][data-list]');
		if (!row || !event.dataTransfer) return;
		const index = Number(row.getAttribute('data-index'));
		const list = row.getAttribute('data-list') as ListType | null;
		if (Number.isNaN(index) || !list) return;
		this.#dragContext = { list, index };
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', `${list}:${index}`);
	}

	#onDragOver(event: DragEvent): void {
		if (!this._bool('drag-drop') || !this.#dragContext) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index][data-list]');
		if (!row) return;
		event.preventDefault();
	}

	#onDrop(event: DragEvent): void {
		if (!this._bool('drag-drop') || !this.#dragContext) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index][data-list]');
		if (!row) return;
		event.preventDefault();
		const toList = row.getAttribute('data-list') as ListType | null;
		const toIndex = Number(row.getAttribute('data-index'));
		if (!toList || Number.isNaN(toIndex)) return;
		const from = this.#dragContext;
		const fromItems = [...(from.list === 'source' ? this.source : this.target)];
		const [moved] = fromItems.splice(from.index, 1);

		if (from.list === toList) {
			fromItems.splice(toIndex, 0, moved);
			if (toList === 'source') this.source = fromItems;
			else this.target = fromItems;
		} else {
			const toItems = [...(toList === 'source' ? this.source : this.target)];
			toItems.splice(toIndex, 0, moved);
			if (from.list === 'source') this.source = fromItems;
			else this.target = fromItems;
			if (toList === 'source') this.source = toItems;
			else this.target = toItems;
		}
		this.#dragContext = null;
		this.emit('mb-change', { source: this.source, target: this.target });
		this._scheduleRender();
	}

	#filtered(items: unknown[], list: ListType): Array<{ item: unknown; index: number }> {
		const locale = this._str('filter-locale') || undefined;
		const filter = this.#filters[list].trim().toLocaleLowerCase(locale);
		if (!filter) return items.map((item, index) => ({ item, index }));
		return items
			.map((item, index) => ({ item, index }))
			.filter(entry => {
				if (typeof entry.item === 'string') return entry.item.toLocaleLowerCase(locale).includes(filter);
				if (typeof entry.item !== 'object' || entry.item == null) return String(entry.item).toLocaleLowerCase(locale).includes(filter);
				return Object.values(entry.item as Record<string, unknown>).some(value => String(value ?? '').toLocaleLowerCase(locale).includes(filter));
			});
	}

	#selectedValues(list: ListType): unknown[] {
		const items = list === 'source' ? this.source : this.target;
		return [...this.#selection[list]].sort((a, b) => a - b).map(index => items[index]);
	}

	#captureTemplate(): void {
		const template = this._qsLight<HTMLTemplateElement>('template[data-slot="item"]');
		this.#template = template?.innerHTML ?? null;
	}
}

export const definePickList = createDefine('mb-picklist', MbPickList);

export {};
