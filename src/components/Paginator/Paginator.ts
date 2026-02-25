import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { PAGINATOR_STYLES } from './Paginator.styles.js';

type TemplateKey =
  | 'FirstPageLink'
  | 'PrevPageLink'
  | 'PageLinks'
  | 'NextPageLink'
  | 'LastPageLink'
  | 'CurrentPageReport'
  | 'RowsPerPageDropdown'
  | 'JumpToPageDropdown';

const DEFAULT_TEMPLATE = 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown';

export class MbPaginator extends MbBaseComponent {
  static readonly _componentName = 'mb-paginator';
  static readonly _componentStyles = PAGINATOR_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['first', 'number'],
      ['rows', 'number'],
      ['total-records', 'number'],
      ['page-link-size', 'number'],
      ['rows-per-page-options', 'object'],
      ['template', 'string'],
      ['current-page-report-template', 'string'],
      ['always-show', 'boolean'],
      ['prev-page-link-icon', 'string'],
      ['next-page-link-icon', 'string'],
      ['first-page-link-icon', 'string'],
      ['last-page-link-icon', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  first = 0;
  rows = 10;
  totalRecords = 0;
  pageLinkSize = 5;
  rowsPerPageOptions: number[] | null = null;
  template = DEFAULT_TEMPLATE;
  currentPageReportTemplate = '{currentPage} of {totalPages}';
  alwaysShow = true;
  prevPageLinkIcon = '‹';
  nextPageLinkIcon = '›';
  firstPageLinkIcon = '«';
  lastPageLinkIcon = '»';

  protected _render(): string {
    const pageCount = this.#pageCount();
    if (!this.alwaysShow && pageCount <= 1) {
      return '';
    }

    const currentPage = this.#currentPage();
    const templateKeys = this.#resolveTemplate();
    const parts = templateKeys.map(key => this.#renderTemplatePart(key, currentPage, pageCount)).join('');

    return `
      <nav class="mb-paginator" role="navigation" aria-label="Pagination">
        ${parts}
      </nav>
    `;
  }

  protected _afterRender(): void {
    const root = this._qs<HTMLElement>('.mb-paginator');
    if (!root) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>('button[data-action], button[data-page]');
      if (!button || button.disabled) return;

      const action = button.dataset.action;
      const page = Number(button.dataset.page ?? '-1');
      const pageCount = this.#pageCount();
      const currentPage = this.#currentPage();

      if (action === 'first') {
        this.#changePage(0);
      } else if (action === 'prev') {
        this.#changePage(Math.max(0, currentPage - 1));
      } else if (action === 'next') {
        this.#changePage(Math.min(pageCount - 1, currentPage + 1));
      } else if (action === 'last') {
        this.#changePage(Math.max(0, pageCount - 1));
      } else if (page >= 0) {
        this.#changePage(page);
      }
    };

    const onRowsPerPage = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      if (!target.classList.contains('mb-paginator-rpp-dropdown')) return;

      const nextRows = Number(target.value);
      if (!Number.isFinite(nextRows) || nextRows <= 0) return;

      this.rows = nextRows;
      this._reflectToAttr('rows', nextRows, 'number');
      this.#changePage(0, false);
    };

    const onJumpToPage = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      if (!target.classList.contains('mb-paginator-pages-dropdown')) return;
      const page = Number(target.value);
      if (Number.isFinite(page)) {
        this.#changePage(page);
      }
    };

    root.addEventListener('click', onClick);
    root.addEventListener('change', onRowsPerPage);
    root.addEventListener('change', onJumpToPage);

    this._addCleanup(() => root.removeEventListener('click', onClick));
    this._addCleanup(() => root.removeEventListener('change', onRowsPerPage));
    this._addCleanup(() => root.removeEventListener('change', onJumpToPage));
  }

  #pageCount(): number {
    if (this.rows <= 0) return 0;
    return Math.max(0, Math.ceil(this.totalRecords / this.rows));
  }

  #currentPage(): number {
    if (this.rows <= 0) return 0;
    const page = Math.floor(this.first / this.rows);
    return Math.max(0, Math.min(this.#pageCount() - 1, page));
  }

  #resolveTemplate(): TemplateKey[] {
    const rawTemplate = this.getAttribute('template') || this.template || DEFAULT_TEMPLATE;
    return rawTemplate
      .split(/[\s,]+/)
      .map(token => token.trim())
      .filter(Boolean)
      .filter((token): token is TemplateKey => {
        return (
          token === 'FirstPageLink' ||
          token === 'PrevPageLink' ||
          token === 'PageLinks' ||
          token === 'NextPageLink' ||
          token === 'LastPageLink' ||
          token === 'CurrentPageReport' ||
          token === 'RowsPerPageDropdown' ||
          token === 'JumpToPageDropdown'
        );
      });
  }

  #renderTemplatePart(key: TemplateKey, currentPage: number, pageCount: number): string {
    if (key === 'FirstPageLink') {
      return `<button type="button" class="mb-paginator-first" data-action="first" aria-label="First Page" ${currentPage === 0 ? 'disabled' : ''}>${this._escape(this.firstPageLinkIcon)}</button>`;
    }
    if (key === 'PrevPageLink') {
      return `<button type="button" class="mb-paginator-prev" data-action="prev" aria-label="Previous Page" ${currentPage === 0 ? 'disabled' : ''}>${this._escape(this.prevPageLinkIcon)}</button>`;
    }
    if (key === 'NextPageLink') {
      return `<button type="button" class="mb-paginator-next" data-action="next" aria-label="Next Page" ${currentPage >= pageCount - 1 ? 'disabled' : ''}>${this._escape(this.nextPageLinkIcon)}</button>`;
    }
    if (key === 'LastPageLink') {
      return `<button type="button" class="mb-paginator-last" data-action="last" aria-label="Last Page" ${currentPage >= pageCount - 1 ? 'disabled' : ''}>${this._escape(this.lastPageLinkIcon)}</button>`;
    }
    if (key === 'CurrentPageReport') {
      const report = this.#formatReport(currentPage, pageCount);
      return `<span class="mb-paginator-current" aria-live="polite">${this._escape(report)}</span>`;
    }
    if (key === 'RowsPerPageDropdown') {
      const options = (this.rowsPerPageOptions ?? this._obj<number[]>('rows-per-page-options') ?? []).filter(n => typeof n === 'number' && n > 0);
      if (!options.length) return '';

      return `
        <select class="mb-paginator-rpp-dropdown" aria-label="Rows per page">
          ${options
            .map(option => `<option value="${option}" ${option === this.rows ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      `;
    }
    if (key === 'JumpToPageDropdown') {
      if (pageCount <= 1) return '';
      return `
        <select class="mb-paginator-pages-dropdown" aria-label="Jump to page">
          ${Array.from({ length: pageCount })
            .map((_, index) => `<option value="${index}" ${index === currentPage ? 'selected' : ''}>${index + 1}</option>`)
            .join('')}
        </select>
      `;
    }

    const half = Math.floor(this.pageLinkSize / 2);
    const start = Math.max(0, Math.min(currentPage - half, pageCount - this.pageLinkSize));
    const end = Math.min(pageCount, start + this.pageLinkSize);

    return Array.from({ length: end - start })
      .map((_, offset) => {
        const page = start + offset;
        const selectedClass = page === currentPage ? ' mb-paginator-page-selected' : '';
        return `<button type="button" class="mb-paginator-page${selectedClass}" data-page="${page}" aria-label="Page ${page + 1}" aria-current="${page === currentPage ? 'page' : 'false'}">${page + 1}</button>`;
      })
      .join('');
  }

  #formatReport(currentPage: number, pageCount: number): string {
    const first = this.totalRecords === 0 ? 0 : this.first + 1;
    const last = Math.min(this.first + this.rows, this.totalRecords);
    const current = currentPage + 1;
    const totalPages = pageCount;
    const template = this.getAttribute('current-page-report-template') || this.currentPageReportTemplate;

    return template
      .replace('{currentPage}', String(current))
      .replace('{totalPages}', String(totalPages))
      .replace('{first}', String(first))
      .replace('{last}', String(last))
      .replace('{rows}', String(this.rows))
      .replace('{totalRecords}', String(this.totalRecords));
  }

  #changePage(page: number, emitEvent = true): void {
    const pageCount = this.#pageCount();
    if (pageCount <= 0) {
      this.first = 0;
      this._reflectToAttr('first', 0, 'number');
      this._scheduleRender();
      return;
    }

    const normalized = Math.max(0, Math.min(pageCount - 1, page));
    const nextFirst = normalized * this.rows;
    if (nextFirst === this.first && emitEvent) return;

    this.first = nextFirst;
    this._reflectToAttr('first', nextFirst, 'number');

    if (emitEvent) {
      this.emit('mb-page', {
        page: normalized,
        first: nextFirst,
        rows: this.rows,
        pageCount,
      });
    }

    this._scheduleRender();
  }
}
