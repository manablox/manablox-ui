import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { DATAVIEW_STYLES } from './DataView.styles.js';

type DataViewLayout = 'list' | 'grid';
type PaginatorPosition = 'top' | 'bottom' | 'both';
type DataViewItem = Record<string, unknown>;

interface DataViewPageDetail {
	first: number;
	rows: number;
}

function normalizeItems(value: unknown): DataViewItem[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is DataViewItem => typeof entry === 'object' && entry !== null);
}

export class MbDataView extends MbBaseComponent {
	static readonly _componentName = 'mb-dataview';
	static readonly _componentStyles = DATAVIEW_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['layout', 'string'],
			['rows', 'number'],
			['first', 'number'],
			['paginator', 'boolean'],
			['paginator-position', 'string'],
			['empty-message', 'string'],
			['data-key', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbDataView.attributeConverters.keys());
	}

	renderItem: ((item: DataViewItem, index: number) => string) | null = null;
	#templateBySlot = new Map<string, string>();

	connectedCallback(): void {
		const templates = Array.from(this._qsaLight<HTMLTemplateElement>(':scope > template[data-slot]'));
		templates.forEach(template => {
			const slot = template.dataset.slot;
			if (!slot) return;
			this.#templateBySlot.set(slot, template.innerHTML);
		});
		super.connectedCallback();
	}

	get value(): DataViewItem[] {
		return normalizeItems(this._obj<unknown>('value'));
	}
	set value(next: DataViewItem[]) {
		this.setAttribute('value', JSON.stringify(next ?? []));
	}

	get layout(): DataViewLayout {
		return this._str('layout', 'list') === 'grid' ? 'grid' : 'list';
	}

	get rows(): number {
		return Math.max(0, this._num('rows', 0) ?? 0);
	}

	get first(): number {
		return Math.max(0, this._num('first', 0) ?? 0);
	}

	get paginator(): boolean {
		return this._bool('paginator');
	}

	get paginatorPosition(): PaginatorPosition {
		const value = this._str('paginator-position', 'bottom');
		return value === 'top' || value === 'bottom' || value === 'both' ? value : 'bottom';
	}

	get emptyMessage(): string {
		return this._str('empty-message', 'No records found.');
	}

	get dataKey(): string {
		return this._str('data-key');
	}

	protected _render(): string {
		const allItems = this.value;
		const pagedItems = this.#pagedItems(allItems);
		const classes = 'mb-dataview';
		const topPaginator = this.paginator && (this.paginatorPosition === 'top' || this.paginatorPosition === 'both');
		const bottomPaginator = this.paginator && (this.paginatorPosition === 'bottom' || this.paginatorPosition === 'both');

		const content = pagedItems.length
			? pagedItems
					.map(({ item, index }) => {
						const className = this.layout === 'grid' ? 'mb-dataview-grid-item' : 'mb-dataview-list-item';
						const itemContent = this.#renderItem(item, index);
						const key = this.#resolveKey(item, index);
						return `<div class="${className}" part="item" data-index="${index}" data-key="${this._escape(key)}">${itemContent}</div>`;
					})
					.join('')
			: `<div class="mb-dataview-empty-message" part="empty">${this._escape(this.emptyMessage)}</div>`;

		return this._html`
			<div class="${classes}" part="root" data-layout="${this.layout}">
				<slot part="templates" hidden></slot>
				${this.#renderHeader()}
				${topPaginator ? this.#renderPaginator(allItems.length) : ''}
				<div class="mb-dataview-content" part="content">${content}</div>
				${bottomPaginator ? this.#renderPaginator(allItems.length) : ''}
				${this.#renderFooter()}
			</div>
		`;
	}

	protected _afterRender(): void {
		this.#bindPaginatorEvents();
		this.#bindItemInteractions();
	}

	#renderHeader(): string {
		const markup = this.#templateBySlot.get('header');
		if (!markup) return '';
		return `<div class="mb-dataview-header" part="header">${markup}</div>`;
	}

	#renderFooter(): string {
		const markup = this.#templateBySlot.get('footer');
		if (!markup) return '';
		return `<div class="mb-dataview-footer" part="footer">${markup}</div>`;
	}

	#renderPaginator(totalRecords: number): string {
		if (!this.paginator) return '';
		const rows = this.rows > 0 ? this.rows : totalRecords || 1;
		return `<mb-paginator part="paginator" first="${this.first}" rows="${rows}" total-records="${totalRecords}"></mb-paginator>`;
	}

	#pagedItems(items: DataViewItem[]): Array<{ item: DataViewItem; index: number }> {
		if (!this.paginator || this.rows <= 0) {
			return items.map((item, index) => ({ item, index }));
		}

		const start = Math.min(this.first, items.length);
		const end = Math.min(start + this.rows, items.length);
		return items.slice(start, end).map((item, offset) => ({ item, index: start + offset }));
	}

	#resolveKey(item: DataViewItem, index: number): string {
		if (!this.dataKey) return String(index);
		const keyValue = item[this.dataKey];
		return keyValue == null ? String(index) : String(keyValue);
	}

	#renderItem(item: DataViewItem, index: number): string {
		if (typeof this.renderItem === 'function') {
			return this.renderItem(item, index) ?? '';
		}

		const templateMarkup = this.#templateBySlot.get('item');
		if (templateMarkup) {
			const wrapper = document.createElement('div');
			wrapper.innerHTML = templateMarkup;
			wrapper.querySelectorAll<HTMLElement>('*').forEach(el => {
				el.setAttribute('data-item', JSON.stringify(item));
				el.setAttribute('data-index', String(index));
			});
			return wrapper.innerHTML;
		}

		return `<pre>${this._escape(JSON.stringify(item, null, 2))}</pre>`;
	}

	#bindPaginatorEvents(): void {
		this._qsa('mb-paginator').forEach(paginator => {
			const onPage = (event: Event) => {
				const custom = event as CustomEvent<DataViewPageDetail & { page?: number; pageCount?: number }>;
				const detail = custom.detail;
				if (!detail) return;

				const nextFirst = Math.max(0, detail.first ?? 0);
				const nextRows = Math.max(0, detail.rows ?? this.rows);

				this._reflectToAttr('first', nextFirst, 'number');
				if (nextRows > 0) this._reflectToAttr('rows', nextRows, 'number');
				this.emit<DataViewPageDetail>('mb-page', { first: nextFirst, rows: nextRows || this.rows });
				this._scheduleRender();
			};

			paginator.addEventListener('mb-page', onPage as EventListener);
			this._addCleanup(() => paginator.removeEventListener('mb-page', onPage as EventListener));
		});
	}

	#bindItemInteractions(): void {
		this._qsa<HTMLElement>('.mb-dataview-grid-item, .mb-dataview-list-item').forEach(itemEl => {
			const onClick = (event: MouseEvent) => {
				const index = Number(itemEl.dataset.index ?? '-1');
				if (index < 0) return;
				const item = this.value[index];
				if (!item) return;
				this.emit('mb-item-action', { item, index, originalEvent: event });
			};

			itemEl.addEventListener('click', onClick);
			this._addCleanup(() => itemEl.removeEventListener('click', onClick));
		});
	}
}

export const defineDataView = createDefine('mb-dataview', MbDataView);
export default MbDataView;
export {};
