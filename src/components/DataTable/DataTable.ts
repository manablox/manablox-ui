import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { DATATABLE_STYLES } from './DataTable.styles.js';

type SortOrder = 1 | -1;
type SelectionMode = 'single' | 'multiple' | null;

interface ColumnDef {
	field: string;
	header?: string;
	sortable?: boolean;
	filterable?: boolean;
	width?: string;
	style?: string;
	headerStyle?: string;
	bodyStyle?: string;
	frozen?: boolean;
	frozenAlign?: 'left' | 'right';
	resizable?: boolean;
	reorderable?: boolean;
	exportable?: boolean;
}

type RowData = Record<string, unknown>;

interface SortMeta {
	field: string;
	order: SortOrder;
}

interface FilterMetaValue {
	value: unknown;
}

type FilterMeta = Record<string, FilterMetaValue | unknown>;

function asColumns(value: unknown): ColumnDef[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is ColumnDef => typeof entry === 'object' && entry !== null && typeof (entry as ColumnDef).field === 'string');
}

function asRows(value: unknown): RowData[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is RowData => typeof entry === 'object' && entry !== null);
}

function asSortMeta(value: unknown): SortMeta[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is SortMeta => {
		return typeof entry === 'object' && entry !== null && typeof (entry as SortMeta).field === 'string' && ((entry as SortMeta).order === 1 || (entry as SortMeta).order === -1);
	});
}

function normalizeSelection(mode: SelectionMode, value: unknown): RowData | RowData[] | null {
	if (mode === 'single') {
		if (value && typeof value === 'object' && !Array.isArray(value)) return value as RowData;
		return null;
	}
	if (mode === 'multiple') {
		if (Array.isArray(value)) return asRows(value);
		return [];
	}
	return null;
}

export class MbDataTable extends MbBaseComponent {
	static readonly _componentName = 'mb-datatable';
	static readonly _componentStyles = DATATABLE_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['columns', 'object'],
			['data-key', 'string'],
			['selection-mode', 'string'],
			['selection', 'object'],
			['sort-field', 'string'],
			['sort-order', 'number'],
			['multi-sort', 'boolean'],
			['multi-sort-meta', 'object'],
			['filters', 'object'],
			['global-filter-fields', 'object'],
			['paginator', 'boolean'],
			['rows', 'number'],
			['first', 'number'],
			['total-records', 'number'],
			['lazy', 'boolean'],
			['loading', 'boolean'],
			['scrollable', 'boolean'],
			['scroll-height', 'string'],
			['show-gridlines', 'boolean'],
			['striped-rows', 'boolean'],
			['resizable-columns', 'boolean'],
			['reorderable-columns', 'boolean'],
			['row-hover', 'boolean'],
			['size', 'string'],
			['empty-message', 'string'],
			['expandable-row-groups', 'boolean'],
			['row-expandable', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbDataTable.attributeConverters.keys());
	}

	renderColumn: ((field: string, rowData: RowData, rowIndex: number) => string) | null = null;

	#columnWidths = new Map<string, number>();
	#runtimeColumns: ColumnDef[] | null = null;
	#templateBySlot = new Map<string, string>();
	#templateByColumn = new Map<string, string>();
	#childColumns: ColumnDef[] = [];
	#expandedKeys = new Set<string>();
	#lastSelectedVisibleIndex: number | null = null;
	#dragColumnIndex: number | null = null;

	connectedCallback(): void {
		this.#cacheTemplatesAndColumns();
		super.connectedCallback();
	}

	get value(): RowData[] {
		return asRows(this._obj<unknown>('value'));
	}

	get columns(): ColumnDef[] {
		if (this.#runtimeColumns) return this.#runtimeColumns;
		const fromAttr = asColumns(this._obj<unknown>('columns'));
		if (fromAttr.length) return fromAttr;
		return this.#columnsFromChildren();
	}

	get dataKey(): string {
		const explicit = this._str('data-key');
		if (explicit) return explicit;
		return this.columns[0]?.field ?? '';
	}

	get selectionMode(): SelectionMode {
		const mode = this._str('selection-mode');
		if (mode === 'single' || mode === 'multiple') return mode;
		return null;
	}

	get selection(): RowData | RowData[] | null {
		return normalizeSelection(this.selectionMode, this._obj<unknown>('selection'));
	}

	get sortField(): string {
		return this._str('sort-field');
	}

	get sortOrder(): SortOrder {
		return this._num('sort-order', 1) === -1 ? -1 : 1;
	}

	get multiSort(): boolean {
		return this._bool('multi-sort');
	}

	get multiSortMeta(): SortMeta[] {
		return asSortMeta(this._obj<unknown>('multi-sort-meta'));
	}

	get filters(): FilterMeta {
		return (this._obj<FilterMeta>('filters') ?? {}) as FilterMeta;
	}

	get globalFilterFields(): string[] {
		const raw = this._obj<unknown>('global-filter-fields');
		if (!Array.isArray(raw)) return [];
		return raw.filter((entry): entry is string => typeof entry === 'string');
	}

	get paginator(): boolean {
		return this._bool('paginator');
	}

	get rows(): number {
		return Math.max(0, this._num('rows', 0) ?? 0);
	}

	get first(): number {
		return Math.max(0, this._num('first', 0) ?? 0);
	}

	get totalRecords(): number {
		const provided = this._num('total-records', null);
		if (provided != null && provided >= 0) return provided;
		return this.value.length;
	}

	get lazy(): boolean {
		return this._bool('lazy');
	}

	get loading(): boolean {
		return this._bool('loading');
	}

	get scrollable(): boolean {
		return this._bool('scrollable');
	}

	get scrollHeightValue(): string {
		return this._str('scroll-height', '400px');
	}

	get showGridlines(): boolean {
		return this._bool('show-gridlines');
	}

	get stripedRows(): boolean {
		return this._bool('striped-rows');
	}

	get resizableColumns(): boolean {
		return this._bool('resizable-columns');
	}

	get reorderableColumns(): boolean {
		return this._bool('reorderable-columns');
	}

	get rowHover(): boolean {
		return this.getAttribute('row-hover') === null ? true : this._bool('row-hover');
	}

	get size(): 'small' | 'normal' | 'large' {
		const value = this._str('size', 'normal');
		return value === 'small' || value === 'large' ? value : 'normal';
	}

	get emptyMessage(): string {
		return this._str('empty-message', 'No records found.');
	}

	get rowExpandable(): boolean {
		return this._bool('row-expandable');
	}

	protected _render(): string {
		const classes = [
			'mb-datatable',
			this.scrollable ? 'mb-datatable-scrollable' : '',
			this.showGridlines ? 'mb-datatable-show-gridlines' : '',
			this.stripedRows ? 'mb-datatable-striped-rows' : '',
			this.rowHover ? 'mb-datatable-row-hover' : '',
			this.size === 'small' ? 'mb-datatable-size-small' : '',
			this.size === 'large' ? 'mb-datatable-size-large' : '',
		]
			.filter(Boolean)
			.join(' ');

		const columns = this.columns;
		const allRows = this.#sortedAndFilteredValue();
		const pageRows = this.#pageRows(allRows);
		const totalRecords = this.lazy ? this.totalRecords : allRows.length;

		return this._html`
			<div class="${classes}" part="root">
				<slot part="templates" hidden></slot>
				${this.#renderHeader()}
				${this.#renderPaginator(totalRecords)}
				<div class="mb-datatable-table-container" part="container" style="${this.scrollable ? `--mb-datatable-scroll-height:${this._escape(this.scrollHeightValue)};max-height:${this._escape(this.scrollHeightValue)};` : ''}">
					<table class="mb-datatable-table" part="table">
						<thead class="mb-datatable-thead" part="header">${this.#renderHeaderRow(columns)}${this.#renderFilterRow(columns)}</thead>
						<tbody class="mb-datatable-tbody" part="body">${this.#renderBody(pageRows, columns)}</tbody>
						<tfoot class="mb-datatable-tfoot" part="footer-row"></tfoot>
					</table>
					${this.loading ? '<div class="mb-datatable-loading-overlay" part="loading">Loading...</div>' : ''}
				</div>
				${this.#renderBottomPaginator(totalRecords)}
				${this.#renderFooter()}
			</div>
		`;
	}

	protected _afterRender(): void {
		this.#bindHeaderInteractions();
		this.#bindFilterInputs();
		this.#bindRowInteractions();
		this.#bindExpansionInteractions();
		this.#bindPaginator();
		this.#bindColumnResize();
		this.#bindColumnReorder();
	}

	#renderHeader(): string {
		const markup = this.#templateBySlot.get('header');
		if (!markup) return '';
		return `<div class="mb-datatable-header" part="header-section">${markup}</div>`;
	}

	#renderFooter(): string {
		const markup = this.#templateBySlot.get('footer');
		if (!markup) return '';
		return `<div class="mb-datatable-footer" part="footer-section">${markup}</div>`;
	}

	#renderPaginator(totalRecords: number): string {
		if (!this.paginator) return '';
		if (this._str('paginator-position', 'bottom') === 'bottom') return '';
		return `<mb-paginator part="paginator" first="${this.first}" rows="${this.rows || totalRecords || 1}" total-records="${totalRecords}"></mb-paginator>`;
	}

	#renderBottomPaginator(totalRecords: number): string {
		if (!this.paginator) return '';
		const position = this._str('paginator-position', 'bottom');
		if (position === 'top') return '';
		return `<mb-paginator part="paginator" first="${this.first}" rows="${this.rows || totalRecords || 1}" total-records="${totalRecords}"></mb-paginator>`;
	}

	#renderHeaderRow(columns: ColumnDef[]): string {
		const cells = columns
			.map((column, index) => {
				const sortable = Boolean(column.sortable);
				const sorted = this.#isColumnSorted(column.field);
				const sortIcon = this.#sortIcon(column.field);
				const width = this.#columnWidths.get(column.field);
				const headerStyle = `${column.headerStyle ?? ''}${column.width ? `;width:${column.width};` : ''}${width ? `;width:${width}px;min-width:${width}px;max-width:${width}px;` : ''}`;
				return this._html`
					<th
						class="mb-datatable-column-header ${sortable ? 'mb-datatable-column-header-sortable' : ''} ${sorted ? 'mb-datatable-column-header-sorted' : ''}"
						part="column-header"
						data-field="${this._escape(column.field)}"
						data-index="${index}"
						style="${this._escape(headerStyle)}"
					>
						<span class="mb-datatable-column-header-content" part="column-header-content">
							${this._escape(column.header ?? column.field)}
							${sortable ? `<span class="mb-datatable-sort-icon" part="sort-icon">${sortIcon}</span>` : ''}
						</span>
						${this.#isColumnResizable(column) ? '<span class="mb-datatable-column-resizer" part="resizer" data-role="resizer"></span>' : ''}
					</th>
				`;
			})
			.join('');

		return `<tr part="header-row">${cells}</tr>`;
	}

	#renderFilterRow(columns: ColumnDef[]): string {
		if (!columns.some(column => column.filterable)) return '';
		const cells = columns
			.map(column => {
				if (!column.filterable) return '<th part="filter-cell"></th>';
				const filter = this.#filterValue(column.field);
				return `<th part="filter-cell"><input part="filter-input" type="text" data-filter-field="${this._escape(column.field)}" value="${this._escape(filter)}" /></th>`;
			})
			.join('');
		return `<tr class="mb-datatable-filter-row" part="filter-row">${cells}</tr>`;
	}

	#renderBody(rows: RowData[], columns: ColumnDef[]): string {
		if (!rows.length) {
			return `<tr part="row"><td class="mb-datatable-empty-message" part="empty" colspan="${Math.max(columns.length, 1)}">${this._escape(this.emptyMessage)}</td></tr>`;
		}

		return rows
			.map((row, visibleIndex) => {
				const rowKey = this.#rowKey(row, visibleIndex);
				const selectedClass = this.#isSelected(row) ? 'mb-datatable-row-selected' : '';
				const cells = columns
					.map((column, columnIndex) => {
						const content = this.#renderCell(column.field, row, this.first + visibleIndex);
						const expansionToggle = this.rowExpandable && columnIndex === 0 ? this.#renderExpansionToggle(rowKey) : '';
						return `<td class="mb-datatable-column" part="cell" data-field="${this._escape(column.field)}" style="${this._escape(column.bodyStyle ?? column.style ?? '')}">${expansionToggle}${content}</td>`;
					})
					.join('');

				const expansion = this.rowExpandable && this.#expandedKeys.has(rowKey) ? this.#renderExpansionRow(row, columns.length, this.first + visibleIndex) : '';

				return `
					<tr class="mb-datatable-row ${selectedClass}" part="row" data-row-index="${visibleIndex}" data-row-key="${this._escape(rowKey)}">${cells}</tr>
					${expansion}
				`;
			})
			.join('');
	}

	#renderExpansionToggle(rowKey: string): string {
		const expanded = this.#expandedKeys.has(rowKey);
		return `<button type="button" part="expander" data-expand-key="${this._escape(rowKey)}" aria-label="Toggle row" style="margin-right:0.5rem">${expanded ? '▾' : '▸'}</button>`;
	}

	#renderExpansionRow(row: RowData, colspan: number, rowIndex: number): string {
		const template = this.#templateBySlot.get('expansion');
		let content = '';
		if (template != null) {
			const wrapper = document.createElement('div');
			wrapper.innerHTML = template;
			wrapper.querySelectorAll<HTMLElement>('*').forEach(element => {
				element.setAttribute('data-row', JSON.stringify(row));
				element.setAttribute('data-index', String(rowIndex));
			});
			content = wrapper.innerHTML;
		} else {
			content = `<pre>${this._escape(JSON.stringify(row, null, 2))}</pre>`;
		}
		return `<tr class="mb-datatable-row-expansion" part="expansion-row"><td part="expansion" colspan="${Math.max(colspan, 1)}">${content}</td></tr>`;
	}

	#renderCell(field: string, row: RowData, rowIndex: number): string {
		if (typeof this.renderColumn === 'function') {
			return this.renderColumn(field, row, rowIndex) ?? '';
		}

		const template = this.#templateByColumn.get(field);
		if (template != null) {
			const wrapper = document.createElement('div');
			wrapper.innerHTML = template;
			wrapper.querySelectorAll<HTMLElement>('*').forEach(element => {
				element.setAttribute('data-row', JSON.stringify(row));
				element.setAttribute('data-field', field);
				element.setAttribute('data-index', String(rowIndex));
			});
			return wrapper.innerHTML;
		}

		const raw = row[field];
		return this._escape(raw == null ? '' : raw);
	}

	#sortedAndFilteredValue(): RowData[] {
		const source = this.value;
		if (this.lazy) return source;

		let working = [...source];

		working = this.#applyFilters(working);
		working = this.#applySort(working);

		return working;
	}

	#applySort(rows: RowData[]): RowData[] {
		if (this.multiSort && this.multiSortMeta.length > 0) {
			const meta = [...this.multiSortMeta];
			return [...rows].sort((a, b) => {
				for (const sort of meta) {
					const result = this.#compareValues(a[sort.field], b[sort.field], sort.order);
					if (result !== 0) return result;
				}
				return 0;
			});
		}

		if (!this.sortField) return rows;
		return [...rows].sort((a, b) => this.#compareValues(a[this.sortField], b[this.sortField], this.sortOrder));
	}

	#applyFilters(rows: RowData[]): RowData[] {
		const globalFilter = this.#filterValue('global');
		const globalNeedle = globalFilter.toLowerCase();

		return rows.filter(row => {
			if (globalNeedle) {
				const fields = this.globalFilterFields.length ? this.globalFilterFields : this.columns.map(column => column.field);
				const globalMatch = fields.some(field => String(row[field] ?? '').toLowerCase().includes(globalNeedle));
				if (!globalMatch) return false;
			}

			for (const column of this.columns) {
				const needle = this.#filterValue(column.field);
				if (!needle) continue;
				const haystack = String(row[column.field] ?? '').toLowerCase();
				if (!haystack.includes(needle.toLowerCase())) return false;
			}

			return true;
		});
	}

	#pageRows(rows: RowData[]): RowData[] {
		if (!this.paginator || this.rows <= 0) return rows;
		const start = Math.min(this.first, rows.length);
		return rows.slice(start, start + this.rows);
	}

	#compareValues(a: unknown, b: unknown, order: SortOrder): number {
		if (a == null && b == null) return 0;
		if (a == null) return -1 * order;
		if (b == null) return 1 * order;

		if (typeof a === 'number' && typeof b === 'number') {
			return (a - b) * order;
		}

		const left = String(a).toLowerCase();
		const right = String(b).toLowerCase();
		if (left < right) return -1 * order;
		if (left > right) return 1 * order;
		return 0;
	}

	#bindHeaderInteractions(): void {
		this._qsa<HTMLElement>('th.mb-datatable-column-header[data-field]').forEach(header => {
			const onClick = (event: MouseEvent) => {
				const field = header.dataset.field;
				if (!field) return;
				const column = this.columns.find(entry => entry.field === field);
				if (!column?.sortable) return;
				this.#toggleSort(field, event.ctrlKey || event.metaKey);
			};
			header.addEventListener('click', onClick);
			this._addCleanup(() => header.removeEventListener('click', onClick));
		});
	}

	#bindFilterInputs(): void {
		this._qsa<HTMLInputElement>('input[data-filter-field]').forEach(input => {
			const onInput = () => {
				const field = input.dataset.filterField;
				if (!field) return;
				const nextFilters: FilterMeta = { ...this.filters, [field]: { value: input.value } };
				this.setAttribute('filters', JSON.stringify(nextFilters));
				this.emit('mb-filter', { filters: nextFilters });
				this.#saveState();
				this._scheduleRender();
			};
			input.addEventListener('input', onInput);
			this._addCleanup(() => input.removeEventListener('input', onInput));
		});
	}

	#bindRowInteractions(): void {
		this._qsa<HTMLTableRowElement>('tr.mb-datatable-row[data-row-index]').forEach(row => {
			const onClick = (event: MouseEvent) => {
				if ((event.target as HTMLElement).closest('[data-expand-key]')) return;
				const visibleIndex = Number(row.dataset.rowIndex ?? '-1');
				if (visibleIndex < 0) return;
				const data = this.#pageRows(this.#sortedAndFilteredValue())[visibleIndex];
				if (!data) return;

				this.emit('mb-row-click', { originalEvent: event, data, index: visibleIndex });
				this.#handleSelection(event, data, visibleIndex);
			};

			const onDblClick = () => {
				const visibleIndex = Number(row.dataset.rowIndex ?? '-1');
				if (visibleIndex < 0) return;
				const data = this.#pageRows(this.#sortedAndFilteredValue())[visibleIndex];
				if (!data) return;
				this.emit('mb-row-dblclick', { data, index: visibleIndex });
			};

			row.addEventListener('click', onClick);
			row.addEventListener('dblclick', onDblClick);
			this._addCleanup(() => row.removeEventListener('click', onClick));
			this._addCleanup(() => row.removeEventListener('dblclick', onDblClick));
		});
	}

	#bindExpansionInteractions(): void {
		this._qsa<HTMLButtonElement>('button[data-expand-key]').forEach(button => {
			const onClick = () => {
				const key = button.dataset.expandKey;
				if (!key) return;
				const row = this.#findRowByKey(key);
				if (!row) return;

				if (this.#expandedKeys.has(key)) {
					this.#expandedKeys.delete(key);
					this.emit('mb-row-collapse', { data: row });
				} else {
					this.#expandedKeys.add(key);
					this.emit('mb-row-expand', { data: row });
				}
				this._scheduleRender();
			};
			button.addEventListener('click', onClick);
			this._addCleanup(() => button.removeEventListener('click', onClick));
		});
	}

	#bindPaginator(): void {
		this._qsa('mb-paginator').forEach(paginator => {
			const onPage = (event: Event) => {
				const custom = event as CustomEvent<{ first: number; rows: number; page: number; pageCount: number }>;
				const detail = custom.detail;
				if (!detail) return;

				this.setAttribute('first', String(Math.max(0, detail.first ?? 0)));
				if ((detail.rows ?? 0) > 0) this.setAttribute('rows', String(detail.rows));

				this.emit('mb-page', {
					first: Math.max(0, detail.first ?? 0),
					rows: Math.max(0, detail.rows ?? this.rows),
					page: detail.page,
					pageCount: detail.pageCount,
				});
				this.#saveState();
				this._scheduleRender();
			};

			paginator.addEventListener('mb-page', onPage as EventListener);
			this._addCleanup(() => paginator.removeEventListener('mb-page', onPage as EventListener));
		});
	}

	#bindColumnResize(): void {
		if (!this.resizableColumns && !this.columns.some(column => column.resizable)) return;
		this._qsa<HTMLElement>('span.mb-datatable-column-resizer').forEach(resizer => {
			const onPointerDown = (event: PointerEvent) => {
				event.preventDefault();
				const th = resizer.closest<HTMLTableCellElement>('th.mb-datatable-column-header');
				if (!th) return;
				const field = th.dataset.field;
				if (!field) return;

				const startX = event.clientX;
				const startWidth = th.getBoundingClientRect().width;

				const onMove = (moveEvent: PointerEvent) => {
					const delta = moveEvent.clientX - startX;
					const nextWidth = Math.max(40, Math.round(startWidth + delta));
					this.#columnWidths.set(field, nextWidth);
					this._scheduleRender();
				};

				const onUp = (upEvent: PointerEvent) => {
					const delta = upEvent.clientX - startX;
					this.emit('mb-column-resize-end', { element: field, delta });
					window.removeEventListener('pointermove', onMove);
					window.removeEventListener('pointerup', onUp);
				};

				window.addEventListener('pointermove', onMove);
				window.addEventListener('pointerup', onUp);
			};

			resizer.addEventListener('pointerdown', onPointerDown);
			this._addCleanup(() => resizer.removeEventListener('pointerdown', onPointerDown));
		});
	}

	#bindColumnReorder(): void {
		if (!this.reorderableColumns && !this.columns.some(column => column.reorderable)) return;

		this._qsa<HTMLElement>('th.mb-datatable-column-header[data-index]').forEach(header => {
			header.draggable = true;

			const onDragStart = () => {
				this.#dragColumnIndex = Number(header.dataset.index ?? '-1');
			};

			const onDragOver = (event: DragEvent) => {
				event.preventDefault();
			};

			const onDrop = () => {
				const from = this.#dragColumnIndex;
				const to = Number(header.dataset.index ?? '-1');
				this.#dragColumnIndex = null;
				if (from == null || from < 0 || to < 0 || from === to) return;

				const next = [...this.columns];
				const [moved] = next.splice(from, 1);
				if (!moved) return;
				next.splice(to, 0, moved);
				this.#runtimeColumns = next;
				this.setAttribute('columns', JSON.stringify(next));
				this.emit('mb-column-reorder', { dragIndex: from, dropIndex: to });
				this._scheduleRender();
			};

			header.addEventListener('dragstart', onDragStart);
			header.addEventListener('dragover', onDragOver);
			header.addEventListener('drop', onDrop);
			this._addCleanup(() => header.removeEventListener('dragstart', onDragStart));
			this._addCleanup(() => header.removeEventListener('dragover', onDragOver));
			this._addCleanup(() => header.removeEventListener('drop', onDrop));
		});
	}

	#toggleSort(field: string, additive: boolean): void {
		if (this.multiSort && additive) {
			const meta = [...this.multiSortMeta];
			const index = meta.findIndex(entry => entry.field === field);
			if (index >= 0) {
				const current = meta[index];
				if (current) {
					meta[index] = { field, order: current.order === 1 ? -1 : 1 };
				}
			} else {
				meta.push({ field, order: 1 });
			}
			this.setAttribute('multi-sort-meta', JSON.stringify(meta));
			this.emit('mb-sort', { sortField: field, sortOrder: meta.find(entry => entry.field === field)?.order ?? 1, multiSortMeta: meta });
		} else {
			const nextOrder: SortOrder = this.sortField === field ? (this.sortOrder === 1 ? -1 : 1) : 1;
			this.setAttribute('sort-field', field);
			this.setAttribute('sort-order', String(nextOrder));
			if (this.multiSort) this.setAttribute('multi-sort-meta', JSON.stringify([{ field, order: nextOrder }]));
			this.emit('mb-sort', { sortField: field, sortOrder: nextOrder, multiSortMeta: this.multiSort ? [{ field, order: nextOrder }] : [] });
		}

		this.#saveState();
		this._scheduleRender();
	}

	#handleSelection(event: MouseEvent, row: RowData, visibleIndex: number): void {
		const mode = this.selectionMode;
		if (!mode) return;

		if (mode === 'single') {
			const currentlySelected = this.selection as RowData | null;
			const selected = currentlySelected && this.#sameRow(currentlySelected, row);
			if (selected) {
				this.removeAttribute('selection');
				this.emit('mb-row-unselect', { data: row, type: 'row', originalEvent: event });
				this.emit('mb-selection-change', { value: null });
			} else {
				this.setAttribute('selection', JSON.stringify(row));
				this.emit('mb-row-select', { data: row, type: 'row', originalEvent: event });
				this.emit('mb-selection-change', { value: row });
			}
			this.#saveState();
			this._scheduleRender();
			return;
		}

		const current = normalizeSelection('multiple', this.selection) as RowData[];
		let next = [...current];
		const exists = next.some(entry => this.#sameRow(entry, row));

		if (event.shiftKey && this.#lastSelectedVisibleIndex != null) {
			const view = this.#pageRows(this.#sortedAndFilteredValue());
			const start = Math.min(this.#lastSelectedVisibleIndex, visibleIndex);
			const end = Math.max(this.#lastSelectedVisibleIndex, visibleIndex);
			const range = view.slice(start, end + 1);
			next = Array.from(new Map([...next, ...range].map(item => [this.#rowKey(item, 0), item])).values());
		} else if (event.ctrlKey || event.metaKey) {
			next = exists ? next.filter(entry => !this.#sameRow(entry, row)) : [...next, row];
		} else {
			next = exists ? [] : [row];
		}

		const becameSelected = !exists || event.shiftKey;
		this.setAttribute('selection', JSON.stringify(next));
		if (becameSelected) {
			this.emit('mb-row-select', { data: row, type: 'row', originalEvent: event });
		} else {
			this.emit('mb-row-unselect', { data: row, type: 'row', originalEvent: event });
		}
		this.emit('mb-selection-change', { value: next });
		this.#lastSelectedVisibleIndex = visibleIndex;
		this.#saveState();
		this._scheduleRender();
	}

	#isSelected(row: RowData): boolean {
		const mode = this.selectionMode;
		if (!mode) return false;
		if (mode === 'single') {
			const selected = this.selection as RowData | null;
			return !!selected && this.#sameRow(selected, row);
		}
		const selected = normalizeSelection('multiple', this.selection) as RowData[];
		return selected.some(entry => this.#sameRow(entry, row));
	}

	#sameRow(a: RowData, b: RowData): boolean {
		const key = this.dataKey;
		if (key) return String(a[key]) === String(b[key]);
		try {
			return JSON.stringify(a) === JSON.stringify(b);
		} catch {
			return false;
		}
	}

	#rowKey(row: RowData, index: number): string {
		const keyField = this.dataKey;
		if (keyField && row[keyField] != null) return String(row[keyField]);
		return String(index);
	}

	#findRowByKey(key: string): RowData | null {
		for (const row of this.value) {
			if (this.#rowKey(row, 0) === key) return row;
		}
		return null;
	}

	#columnsFromChildren(): ColumnDef[] {
		return this.#childColumns;
	}

	#cacheTemplatesAndColumns(): void {
		const slotTemplates = Array.from(this._qsaLight<HTMLTemplateElement>(':scope > template[data-slot]'));
		slotTemplates.forEach(template => {
			const slot = template.dataset.slot;
			if (!slot) return;
			this.#templateBySlot.set(slot, template.innerHTML);
		});

		const colTemplates = Array.from(this._qsaLight<HTMLTemplateElement>(':scope > template[data-col]'));
		colTemplates.forEach(template => {
			const dataCol = template.dataset.col;
			if (!dataCol) return;
			const normalized = dataCol.startsWith('{') && dataCol.endsWith('}') ? dataCol.slice(1, -1) : dataCol;
			this.#templateByColumn.set(normalized, template.innerHTML);
		});

		const nodes = Array.from(this._qsaLight<HTMLElement>(':scope > mb-column'));
		const childColumns: ColumnDef[] = [];
		nodes.forEach(node => {
				const field = node.getAttribute('field') ?? '';
				if (!field) return;
				childColumns.push({
					field,
					header: node.getAttribute('header') ?? field,
					sortable: node.hasAttribute('sortable'),
					filterable: node.hasAttribute('filterable'),
					width: node.getAttribute('width') ?? undefined,
					style: node.getAttribute('style') ?? undefined,
					headerStyle: node.getAttribute('header-style') ?? undefined,
					bodyStyle: node.getAttribute('body-style') ?? undefined,
					resizable: node.hasAttribute('resizable'),
					reorderable: node.hasAttribute('reorderable'),
				});
			});
		this.#childColumns = childColumns;
	}

	#isColumnSorted(field: string): boolean {
		if (this.multiSort) return this.multiSortMeta.some(meta => meta.field === field);
		return this.sortField === field;
	}

	#sortIcon(field: string): string {
		if (this.multiSort) {
			const meta = this.multiSortMeta.find(entry => entry.field === field);
			if (!meta) return '↕';
			return meta.order === 1 ? '↑' : '↓';
		}
		if (this.sortField !== field) return '↕';
		return this.sortOrder === 1 ? '↑' : '↓';
	}

	#filterValue(field: string): string {
		const entry = this.filters[field];
		if (entry == null) return '';
		if (typeof entry === 'object' && entry !== null && 'value' in (entry as Record<string, unknown>)) {
			const value = (entry as FilterMetaValue).value;
			return value == null ? '' : String(value);
		}
		return String(entry);
	}

	#isColumnResizable(column: ColumnDef): boolean {
		if (typeof column.resizable === 'boolean') return column.resizable;
		return this.resizableColumns;
	}

	saveState(): void {
		this.#saveState();
	}

	restoreState(state: {
		first?: number;
		rows?: number;
		sortField?: string;
		sortOrder?: SortOrder;
		multiSortMeta?: SortMeta[];
		filters?: FilterMeta;
		selection?: unknown;
	}): void {
		if (typeof state.first === 'number') this.setAttribute('first', String(Math.max(0, state.first)));
		if (typeof state.rows === 'number') this.setAttribute('rows', String(Math.max(0, state.rows)));
		if (typeof state.sortField === 'string') this.setAttribute('sort-field', state.sortField);
		if (state.sortOrder === 1 || state.sortOrder === -1) this.setAttribute('sort-order', String(state.sortOrder));
		if (Array.isArray(state.multiSortMeta)) this.setAttribute('multi-sort-meta', JSON.stringify(state.multiSortMeta));
		if (state.filters && typeof state.filters === 'object') this.setAttribute('filters', JSON.stringify(state.filters));
		if (state.selection !== undefined) this.setAttribute('selection', JSON.stringify(state.selection));

		this.emit('mb-state-restore', { state });
		this._scheduleRender();
	}

	#saveState(): void {
		this.emit('mb-state-save', {
			state: {
				first: this.first,
				rows: this.rows,
				sortField: this.sortField,
				sortOrder: this.sortOrder,
				multiSortMeta: this.multiSortMeta,
				filters: this.filters,
				selection: this.selection,
			},
		});
	}
}

export const defineDataTable = createDefine('mb-datatable', MbDataTable);
export default MbDataTable;
export {};
