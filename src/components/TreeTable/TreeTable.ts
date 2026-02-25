import type { AttributeConverter, SelectionMode, SortOrder, TreeNode } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { TREETABLE_STYLES } from './TreeTable.styles.js';

interface ColumnDef {
	field: string;
	header?: string;
	sortable?: boolean;
	style?: string;
	className?: string;
	expander?: boolean;
}

interface FlattenedRow {
	key: string;
	node: TreeNode;
	level: number;
	hasChildren: boolean;
	expanded: boolean;
}

type SelectionKeys = Record<string, true | false | 'partial'>;
type ExpandedKeys = Record<string, boolean>;

function asTreeNodes(value: unknown): TreeNode[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is TreeNode => typeof item === 'object' && item !== null);
}

function asColumns(value: unknown): ColumnDef[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is ColumnDef => typeof item === 'object' && item !== null)
		.filter(column => typeof column.field === 'string' && column.field.length > 0);
}

export class MbTreeTable extends MbBaseComponent {
	static readonly _componentName = 'mb-treetable';
	static readonly _componentStyles = TREETABLE_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['columns', 'object'],
			['expanded-keys', 'object'],
			['selection-mode', 'string'],
			['selection-keys', 'object'],
			['sort-field', 'string'],
			['sort-order', 'number'],
			['paginator', 'boolean'],
			['rows', 'number'],
			['first', 'number'],
			['loading', 'boolean'],
			['lazy', 'boolean'],
			['scroll-height', 'string'],
			['scrollable', 'boolean'],
			['size', 'string'],
			['show-gridlines', 'boolean'],
			['striped-rows', 'boolean'],
			['empty-message', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTreeTable.attributeConverters.keys());
	}

	#listenersBound = false;
	#flatRows: FlattenedRow[] = [];
	#metaMap = new Map<string, { parentKey: string | null; childrenKeys: string[] }>();
	#templateCache = new Map<string, string>();

	connectedCallback(): void {
		this.#captureTemplates();
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onClick(event);
		this.addEventListener('click', onClick);
		this._addCleanup(() => this.removeEventListener('click', onClick));
	}

	get value(): TreeNode[] {
		return asTreeNodes(this._obj<unknown>('value'));
	}
	set value(next: TreeNode[]) {
		this.setAttribute('value', JSON.stringify(next ?? []));
	}

	get columns(): ColumnDef[] {
		return asColumns(this._obj<unknown>('columns'));
	}

	get expandedKeys(): ExpandedKeys {
		return this._obj<ExpandedKeys>('expanded-keys') ?? {};
	}
	set expandedKeys(next: ExpandedKeys) {
		this.setAttribute('expanded-keys', JSON.stringify(next ?? {}));
	}

	get selectionMode(): SelectionMode | null {
		const value = this._str('selection-mode', '');
		return value === 'single' || value === 'multiple' || value === 'checkbox' ? value : null;
	}

	get selectionKeys(): SelectionKeys {
		return this._obj<SelectionKeys>('selection-keys') ?? {};
	}
	set selectionKeys(next: SelectionKeys) {
		this.setAttribute('selection-keys', JSON.stringify(next ?? {}));
	}

	get sortField(): string {
		return this._str('sort-field', '');
	}

	get sortOrder(): SortOrder {
		const value = this._num('sort-order', 1);
		return value === -1 || value === 0 ? value : 1;
	}

	get paginator(): boolean {
		return this._bool('paginator');
	}

	get rows(): number {
		return this._num('rows', 10) ?? 10;
	}

	get first(): number {
		return this._num('first', 0) ?? 0;
	}
	set first(value: number) {
		this.setAttribute('first', String(Math.max(0, value)));
	}

	get loading(): boolean {
		return this._bool('loading');
	}

	get lazy(): boolean {
		return this._bool('lazy');
	}

	protected _render(): string {
		this.#metaMap.clear();
		const sorted = this.#sortNodes(this.value);
		this.#flatRows = [];
		sorted.forEach((node, index) => {
			this.#flatten(node, String(index), 1, null);
		});

		const total = this.#flatRows.length;
		const start = this.paginator ? Math.max(0, this.first) : 0;
		const end = this.paginator ? Math.min(total, start + Math.max(1, this.rows)) : total;
		const rows = this.#flatRows.slice(start, end);

		const wrapperStyle = this._bool('scrollable')
			? `max-height:${this._escape(this._str('scroll-height', '24rem'))};`
			: '';
		const tableClasses = [
			'mb-treetable',
			this._bool('show-gridlines') ? 'mb-treetable-show-gridlines' : '',
			this._str('size') === 'small' ? 'mb-treetable-sm' : this._str('size') === 'large' ? 'mb-treetable-lg' : '',
		]
			.filter(Boolean)
			.join(' ');

		const columns = this.columns;
		const body = rows
			.map((row, rowIndex) => {
				const selected = this.selectionKeys[row.key] === true;
				const rowClasses = [
					'mb-treetable-row',
					selected ? 'mb-treetable-row-selected' : '',
					this._bool('striped-rows') && rowIndex % 2 === 1 ? 'mb-treetable-row-striped' : '',
				]
					.filter(Boolean)
					.join(' ');

				return `<tr class="${rowClasses}" part="row" data-key="${this._escape(row.key)}" role="row" aria-selected="${selected ? 'true' : 'false'}">
					${columns.map((column, colIndex) => this.#renderCell(row, column, colIndex === 0)).join('')}
				</tr>`;
			})
			.join('');

		const emptyMessage = this._escape(this._str('empty-message', 'No records found'));

		return this._html`
			<div class="${tableClasses}" part="root">
				<slot part="templates" hidden></slot>
				${this.loading ? '<div class="mb-treetable-loading-overlay" part="loading" aria-live="polite">Loading...</div>' : ''}
				<div class="mb-treetable-wrapper" part="wrapper" style="${wrapperStyle}">
					<table class="mb-treetable-table" part="table" role="treegrid" aria-busy="${this.loading ? 'true' : 'false'}">
						<thead>
							<tr part="header-row" role="row">
								${columns.map(column => this.#renderHeader(column)).join('')}
							</tr>
						</thead>
						<tbody part="body">
							${body || `<tr part="row"><td part="cell" colspan="${Math.max(columns.length, 1)}"><div class="mb-treetable-empty" part="empty">${emptyMessage}</div></td></tr>`}
						</tbody>
					</table>
				</div>
				${this.paginator ? this.#renderPaginator(total, start, end) : ''}
			</div>
		`;
	}

	#renderHeader(column: ColumnDef): string {
		const sortable = column.sortable ? 'mb-treetable-header-cell-sort' : '';
		const sortIcon =
			column.sortable && this.sortField === column.field
				? this.sortOrder === 1
					? ' ▲'
					: this.sortOrder === -1
						? ' ▼'
						: ''
				: '';
		const className = [sortable, column.className ?? ''].filter(Boolean).join(' ');

		return `<th part="header-cell" class="${this._escape(className)}" data-action="sort" data-field="${this._escape(column.field)}" style="${this._escape(column.style ?? '')}">${this._escape(column.header ?? column.field)}${sortIcon}</th>`;
	}

	#renderCell(row: FlattenedRow, column: ColumnDef, firstColumn: boolean): string {
		const selected = this.selectionKeys[row.key] === true;
		const checkbox =
			this.selectionMode === 'checkbox' && firstColumn
				? `<input part="checkbox" type="checkbox" data-action="select-checkbox" data-key="${this._escape(row.key)}" ${selected ? 'checked' : ''} aria-label="Select row" />`
				: '';

		const expander =
			firstColumn && row.hasChildren
				? `<button type="button" class="mb-treetable-toggler" part="toggler" data-action="toggle" data-key="${this._escape(row.key)}" aria-label="Toggle row">${row.expanded ? '▾' : '▸'}</button>`
				: firstColumn
					? '<span style="display:inline-flex;width:1.25rem"></span>'
					: '';

		const data = (row.node.data ?? row.node) as Record<string, unknown>;
		const defaultValue = data[column.field] ?? '';
		const content = this.#renderCellTemplate(column.field, row.node, row.key, defaultValue);

		const valueMarkup = firstColumn
			? `<div style="display:flex;align-items:center;gap:0.375rem;padding-inline-start:calc((var(--mb-treetable-node-indent, 1rem)) * ${Math.max(0, row.level - 1)});">${expander}${checkbox}<span>${content}</span></div>`
			: content;

		return `<td part="cell" data-action="select-row" data-key="${this._escape(row.key)}" role="gridcell">${valueMarkup}</td>`;
	}

	#renderCellTemplate(field: string, node: TreeNode, key: string, fallback: unknown): string {
		const rendererKey = `renderCell${field.charAt(0).toUpperCase()}${field.slice(1)}`;
		const renderer = (this as unknown as Record<string, unknown>)[rendererKey];
		if (typeof renderer === 'function') {
			const output = (renderer as (node: TreeNode, key: string) => unknown)(node, key);
			return this.#toMarkup(output);
		}

		const template = this.#templateCache.get(`col-${field}`);
		if (template) {
			return this.#interpolateTemplate(template, node, key, fallback);
		}

		return this._escape(fallback);
	}

	#renderPaginator(total: number, start: number, end: number): string {
		const prevDisabled = start <= 0;
		const nextDisabled = end >= total;
		return `<div class="mb-treetable-paginator" part="paginator">
			<span>${total === 0 ? 0 : start + 1}-${end} / ${total}</span>
			<button type="button" data-action="page-prev" ${prevDisabled ? 'disabled' : ''}>Prev</button>
			<button type="button" data-action="page-next" ${nextDisabled ? 'disabled' : ''}>Next</button>
		</div>`;
	}

	#flatten(node: TreeNode, key: string, level: number, parentKey: string | null): void {
		const children = Array.isArray(node.children)
			? node.children.filter((item): item is TreeNode => typeof item === 'object' && item !== null)
			: [];
		const hasChildren = children.length > 0;
		const expanded = Boolean(this.expandedKeys[key] || node.expanded);
		this.#flatRows.push({ key, node, level, hasChildren, expanded });
		this.#metaMap.set(key, {
			parentKey,
			childrenKeys: children.map((_, index) => `${key}-${index}`),
		});

		if (!expanded) return;
		children.forEach((child, index) => this.#flatten(child, `${key}-${index}`, level + 1, key));
	}

	#sortNodes(nodes: TreeNode[]): TreeNode[] {
		if (!this.sortField || this.sortOrder === 0) {
			return nodes.map(node => ({ ...node, children: this.#sortNodes(asTreeNodes(node.children)) }));
		}

		const sorted = [...nodes].sort((a, b) => {
			const dataA = (a.data ?? a) as Record<string, unknown>;
			const dataB = (b.data ?? b) as Record<string, unknown>;
			const vA = dataA[this.sortField];
			const vB = dataB[this.sortField];
			if (vA == null && vB == null) return 0;
			if (vA == null) return -1 * this.sortOrder;
			if (vB == null) return 1 * this.sortOrder;
			if (vA === vB) return 0;
			return (String(vA).localeCompare(String(vB), undefined, { numeric: true }) || 0) * this.sortOrder;
		});

		return sorted.map(node => ({
			...node,
			children: this.#sortNodes(asTreeNodes(node.children)),
		}));
	}

	#onClick(event: Event): void {
		const target = event.target as HTMLElement;
		const actionTarget = target.closest<HTMLElement>('[data-action]');
		if (!actionTarget) return;
		const action = actionTarget.getAttribute('data-action');
		if (!action) return;

		switch (action) {
			case 'toggle': {
				const key = actionTarget.getAttribute('data-key');
				if (!key) return;
				const expanded = { ...this.expandedKeys };
				if (expanded[key]) {
					delete expanded[key];
					this.emit('mb-node-collapse', { key, node: this.#nodeByKey(key) });
				} else {
					expanded[key] = true;
					this.emit('mb-node-expand', { key, node: this.#nodeByKey(key) });
				}
				this.expandedKeys = expanded;
				this._scheduleRender();
				break;
			}
			case 'sort': {
				const field = actionTarget.getAttribute('data-field');
				if (!field) return;
				const nextOrder: SortOrder = this.sortField === field ? (this.sortOrder === 1 ? -1 : this.sortOrder === -1 ? 0 : 1) : 1;
				this.setAttribute('sort-field', field);
				this.setAttribute('sort-order', String(nextOrder));
				this.emit('mb-sort', { sortField: field, sortOrder: nextOrder });
				this._scheduleRender();
				break;
			}
			case 'page-prev':
			case 'page-next': {
				const delta = action === 'page-prev' ? -this.rows : this.rows;
				const nextFirst = Math.max(0, this.first + delta);
				this.first = nextFirst;
				this.emit('mb-page', { first: this.first, rows: this.rows });
				this._scheduleRender();
				break;
			}
			case 'select-row':
			case 'select-checkbox': {
				const key = actionTarget.getAttribute('data-key') ?? actionTarget.closest<HTMLElement>('[data-key]')?.getAttribute('data-key');
				if (!key) return;
				this.#toggleSelection(key, (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey, action === 'select-checkbox');
				break;
			}
			default:
				break;
		}
	}

	#toggleSelection(key: string, withMeta: boolean, checkboxMode: boolean): void {
		const mode = this.selectionMode;
		if (!mode) return;

		if (mode === 'single' && !checkboxMode) {
			const current = this.selectionKeys[key] === true;
			const next = current ? {} : { [key]: true };
			this.selectionKeys = next;
			this.emit('mb-selection-change', { keys: next });
			this._scheduleRender();
			return;
		}

		const next = { ...this.selectionKeys };
		if (mode === 'multiple' && !withMeta && !checkboxMode) {
			const selected = next[key] === true;
			this.selectionKeys = selected ? {} : { [key]: true };
			this.emit('mb-selection-change', { keys: this.selectionKeys });
			this._scheduleRender();
			return;
		}

		if (next[key] === true) {
			delete next[key];
		} else {
			next[key] = true;
		}
		if (mode === 'checkbox') {
			this.#syncCheckboxAncestors(key, next);
		}

		this.selectionKeys = next;
		this.emit('mb-selection-change', { keys: next });
		this._scheduleRender();
	}

	#syncCheckboxAncestors(fromKey: string, state: SelectionKeys): void {
		let parent = this.#metaMap.get(fromKey)?.parentKey ?? null;
		while (parent) {
			const childKeys = this.#metaMap.get(parent)?.childrenKeys ?? [];
			const allSelected = childKeys.length > 0 && childKeys.every(key => state[key] === true);
			const anySelected = childKeys.some(key => state[key] === true || state[key] === 'partial');
			if (allSelected) state[parent] = true;
			else if (anySelected) state[parent] = 'partial';
			else delete state[parent];
			parent = this.#metaMap.get(parent)?.parentKey ?? null;
		}
	}

	#nodeByKey(key: string): TreeNode | null {
		return this.#flatRows.find(row => row.key === key)?.node ?? null;
	}

	#captureTemplates(): void {
		this.#templateCache.clear();
		const templates = this._qsaLight<HTMLTemplateElement>('template[data-slot]');
		templates.forEach(template => {
			const slot = template.getAttribute('data-slot');
			if (!slot) return;
			this.#templateCache.set(slot, template.innerHTML);
		});
	}

	#interpolateTemplate(template: string, node: TreeNode, key: string, fallback: unknown): string {
		const data = (node.data ?? node) as Record<string, unknown>;
		return template
			.replace(/{{\s*key\s*}}/g, this._escape(key))
			.replace(/{{\s*label\s*}}/g, this._escape(node.label ?? ''))
			.replace(/{{\s*value\s*}}/g, this._escape(fallback))
			.replace(/{{\s*([\w-]+)\s*}}/g, (_, field: string) => this._escape(data[field] ?? ''));
	}

	#toMarkup(value: unknown): string {
		if (value == null) return '';
		return typeof value === 'string' ? value : this._escape(value);
	}
}

export const defineTreeTable = createDefine('mb-treetable', MbTreeTable);

export {};
