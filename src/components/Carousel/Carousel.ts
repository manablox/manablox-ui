import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { CAROUSEL_STYLES } from './Carousel.styles.js';

type CarouselOrientation = 'horizontal' | 'vertical';

type ResponsiveOption = {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
};

type ButtonProps = {
  class?: string;
  ariaLabel?: string;
};

type RenderItemFn = (item: unknown, index: number) => string;

export class MbCarousel extends MbBaseComponent {
  static readonly _componentName = 'mb-carousel';
  static readonly _componentStyles = CAROUSEL_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'object'],
      ['page', 'number'],
      ['num-visible', 'number'],
      ['num-scroll', 'number'],
      ['circular', 'boolean'],
      ['auto-play-interval', 'number'],
      ['orientation', 'string'],
      ['content-class', 'string'],
      ['show-indicators', 'boolean'],
      ['show-navigators', 'boolean'],
      ['prev-button-props', 'object'],
      ['next-button-props', 'object'],
      ['responsive-options', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value: unknown[] = [];
  page = 0;
  numVisible = 1;
  numScroll = 1;
  circular = false;
  autoPlayInterval = 0;
  orientation: CarouselOrientation = 'horizontal';
  contentClass = '';
  showIndicators = true;
  showNavigators = true;
  prevButtonProps: ButtonProps | null = null;
  nextButtonProps: ButtonProps | null = null;
  responsiveOptions: ResponsiveOption[] | null = null;
  renderItem: RenderItemFn | null = null;

  #itemTemplate = '';
  #autoplayTimer: number | null = null;
  #paused = false;
  #resizeObserver: ResizeObserver | null = null;
  #effectiveNumVisible = 1;
  #effectiveNumScroll = 1;
  #touchStartX = 0;
  #touchStartY = 0;
  #listenersBound = false;

  connectedCallback(): void {
    this.#captureTemplates();
    super.connectedCallback();
    this.setAttribute('tabindex', this.getAttribute('tabindex') ?? '0');
    this.#setupResizeObserver();
    this.#bindHostListeners();
    this._addCleanup(() => this.#clearAutoplay());
    this._addCleanup(() => this.#resizeObserver?.disconnect());
  }

  disconnectedCallback(): void {
    this.#clearAutoplay();
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    super.disconnectedCallback();
  }

  protected _render(): string {
    const items = this.#items;
    this.#applyResponsiveSizing();

    const numVisible = this.#safeNumVisible;
    const axis = this.#isVertical ? 'Y' : 'X';
    const page = this.#boundedPage;
    const offsetItems = page * this.#safeNumScroll;
    const shift = (offsetItems * 100) / numVisible;

    const itemBasis = `${100 / numVisible}%`;
    const trackStyle = this.#isVertical
      ? `transform: translate3d(0, -${shift}%, 0);`
      : `transform: translate3d(-${shift}%, 0, 0);`;

    const contentClasses = ['mb-carousel-content', this.contentClass].filter(Boolean).join(' ');
    const rootClasses = ['mb-carousel', this.#isVertical ? 'mb-carousel-vertical' : ''].filter(Boolean).join(' ');

    const renderedItems = items
      .map((item, index) => {
        const html = this.#renderItem(item, index);
        return `<div part="item" class="mb-carousel-item" style="${this.#isVertical ? `height:${itemBasis};` : `width:${itemBasis};`}" data-index="${index}">${html}</div>`;
      })
      .join('');

    const indicators = this.showIndicators
      ? `<div part="indicators" class="mb-carousel-indicators"><slot name="indicators">${this.#renderIndicators(page)}</slot></div>`
      : '';

    const prevButtonProps = this.prevButtonProps ?? {};
    const nextButtonProps = this.nextButtonProps ?? {};

    return `
      <div part="root" class="${rootClasses}" data-axis="${axis}">
        <div part="header" class="mb-carousel-header"><slot name="header"></slot></div>
        <div part="content" class="${contentClasses}">
          ${this.showNavigators ? `<button part="prev-button" type="button" class="mb-carousel-prev-button ${this._escape(prevButtonProps.class ?? '')}" data-action="prev" aria-label="${this._escape(prevButtonProps.ariaLabel ?? 'Previous')}">‹</button>` : ''}
          <div part="track" class="mb-carousel-track" style="${trackStyle}">
            ${renderedItems || '<slot></slot>'}
          </div>
          ${this.showNavigators ? `<button part="next-button" type="button" class="mb-carousel-next-button ${this._escape(nextButtonProps.class ?? '')}" data-action="next" aria-label="${this._escape(nextButtonProps.ariaLabel ?? 'Next')}">›</button>` : ''}
        </div>
        ${indicators}
        <div part="footer" class="mb-carousel-footer"><slot name="footer"></slot></div>
      </div>
    `;
  }

  protected _afterRender(): void {
    this.#restartAutoplay();
  }

  get #items(): unknown[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  get #safeNumVisible(): number {
    const value = Number.isFinite(this.#effectiveNumVisible) ? this.#effectiveNumVisible : this.numVisible;
    return Math.max(1, Math.trunc(value || 1));
  }

  get #safeNumScroll(): number {
    const value = Number.isFinite(this.#effectiveNumScroll) ? this.#effectiveNumScroll : this.numScroll;
    return Math.max(1, Math.trunc(value || 1));
  }

  get #isVertical(): boolean {
    return this.orientation === 'vertical';
  }

  get #totalPages(): number {
    const length = this.#items.length;
    const visible = this.#safeNumVisible;
    if (length <= visible) return 1;
    return Math.max(1, Math.ceil((length - visible) / this.#safeNumScroll) + 1);
  }

  get #boundedPage(): number {
    if (!Number.isFinite(this.page)) return 0;
    return Math.min(Math.max(Math.trunc(this.page), 0), this.#totalPages - 1);
  }

  #captureTemplates(): void {
    const itemTemplate = this._qsLight<HTMLTemplateElement>('template[data-slot="item"]');
    this.#itemTemplate = itemTemplate?.innerHTML ?? '';
  }

  #bindHostListeners(): void {
    if (this.#listenersBound) return;
    this.#listenersBound = true;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const action = actionEl?.dataset.action;
      if (action === 'prev') {
        this.#goPrev(true);
      } else if (action === 'next') {
        this.#goNext(true);
      } else if (action === 'indicator') {
        const index = Number(actionEl?.dataset.page ?? '-1');
        if (index >= 0) {
          this.#setPage(index, true);
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.#goNext(true);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.#goPrev(true);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      this.#touchStartX = touch.clientX;
      this.#touchStartY = touch.clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - this.#touchStartX;
      const deltaY = touch.clientY - this.#touchStartY;
      const primaryDelta = this.#isVertical ? deltaY : deltaX;

      if (Math.abs(primaryDelta) < 24) return;
      if (primaryDelta < 0) {
        this.#goNext(true);
      } else {
        this.#goPrev(true);
      }
    };

    const onMouseEnter = () => {
      this.#paused = true;
      this.#restartAutoplay();
    };

    const onMouseLeave = () => {
      this.#paused = false;
      this.#restartAutoplay();
    };

    this.addEventListener('click', onClick);
    this.addEventListener('keydown', onKeyDown);
    this.addEventListener('touchstart', onTouchStart, { passive: true });
    this.addEventListener('touchend', onTouchEnd, { passive: true });
    this.addEventListener('mouseenter', onMouseEnter);
    this.addEventListener('mouseleave', onMouseLeave);

    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
    this._addCleanup(() => this.removeEventListener('touchstart', onTouchStart));
    this._addCleanup(() => this.removeEventListener('touchend', onTouchEnd));
    this._addCleanup(() => this.removeEventListener('mouseenter', onMouseEnter));
    this._addCleanup(() => this.removeEventListener('mouseleave', onMouseLeave));
  }

  #setPage(nextPage: number, emitEvent: boolean): void {
    const bounded = this.circular
      ? (nextPage + this.#totalPages) % this.#totalPages
      : Math.min(Math.max(nextPage, 0), this.#totalPages - 1);

    if (bounded === this.#boundedPage) return;

    this.page = bounded;
    this._reflectToAttr('page', bounded, 'number');
    this._scheduleRender();
    if (emitEvent) {
      this.emit('mb-page', { page: bounded, value: this.#items[bounded] ?? null });
    }
  }

  #goPrev(emitEvent: boolean): void {
    this.#setPage(this.#boundedPage - 1, emitEvent);
  }

  #goNext(emitEvent: boolean): void {
    this.#setPage(this.#boundedPage + 1, emitEvent);
  }

  #renderIndicators(activePage: number): string {
    return Array.from({ length: this.#totalPages })
      .map((_, pageIndex) => {
        const classes = ['mb-carousel-indicator', pageIndex === activePage ? 'mb-carousel-indicator-active' : '']
          .filter(Boolean)
          .join(' ');

        return `<button type="button" class="${classes}" data-action="indicator" data-page="${pageIndex}" aria-label="Go to page ${pageIndex + 1}"></button>`;
      })
      .join('');
  }

  #renderItem(item: unknown, index: number): string {
    if (this.renderItem) {
      return this.renderItem(item, index);
    }

    if (this.#itemTemplate) {
      return this.#interpolateTemplate(this.#itemTemplate, item);
    }

    if (typeof item === 'object' && item !== null) {
      const image = this.#readField(item, 'image');
      const alt = this.#readField(item, 'alt') || `Item ${index + 1}`;
      if (image) {
        return `<img src="${this._escape(image)}" alt="${this._escape(alt)}" />`;
      }
    }

    return `<span>${this._escape(String(item ?? ''))}</span>`;
  }

  #interpolateTemplate(template: string, item: unknown): string {
    return template.replace(/\{\{\s*item(?:\.([\w.$-]+))?\s*\}\}/g, (_match, path: string | undefined) => {
      if (!path) return this._escape(JSON.stringify(item ?? null));
      const value = this.#readPath(item, path);
      return this._escape(String(value ?? ''));
    });
  }

  #readPath(value: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, segment) => {
      if (typeof acc !== 'object' || acc === null) return null;
      return (acc as Record<string, unknown>)[segment];
    }, value);
  }

  #readField(value: unknown, key: string): string {
    if (typeof value !== 'object' || value === null) return '';
    const field = (value as Record<string, unknown>)[key];
    return field == null ? '' : String(field);
  }

  #setupResizeObserver(): void {
    if (this.#resizeObserver) return;
    this.#resizeObserver = new ResizeObserver(() => {
      this.#applyResponsiveSizing();
      this._scheduleRender();
    });
    this.#resizeObserver.observe(this);
  }

  #applyResponsiveSizing(): void {
    const defaultsVisible = Math.max(1, Math.trunc(this.numVisible || 1));
    const defaultsScroll = Math.max(1, Math.trunc(this.numScroll || 1));
    this.#effectiveNumVisible = defaultsVisible;
    this.#effectiveNumScroll = defaultsScroll;

    if (!Array.isArray(this.responsiveOptions) || this.responsiveOptions.length === 0) {
      return;
    }

    const width = this.getBoundingClientRect().width;
    if (!width) return;

    const candidates = this.responsiveOptions
      .map(option => ({
        option,
        breakpoint: this.#parseBreakpoint(option.breakpoint),
      }))
      .filter(item => item.breakpoint > 0)
      .sort((a, b) => a.breakpoint - b.breakpoint);

    for (const candidate of candidates) {
      if (width <= candidate.breakpoint) {
        this.#effectiveNumVisible = Math.max(1, Math.trunc(candidate.option.numVisible || defaultsVisible));
        this.#effectiveNumScroll = Math.max(1, Math.trunc(candidate.option.numScroll || defaultsScroll));
        break;
      }
    }
  }

  #parseBreakpoint(value: string): number {
    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw) return 0;

    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize || '16') || 16;
    if (raw.endsWith('rem') || raw.endsWith('em')) {
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n * rootFontSize : 0;
    }
    if (raw.endsWith('px')) {
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : 0;
    }

    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }

  #clearAutoplay(): void {
    if (this.#autoplayTimer == null) return;
    window.clearInterval(this.#autoplayTimer);
    this.#autoplayTimer = null;
  }

  #restartAutoplay(): void {
    this.#clearAutoplay();
    const interval = Number.isFinite(this.autoPlayInterval) ? Math.max(0, this.autoPlayInterval) : 0;
    if (!interval || this.#paused || this.#totalPages <= 1) return;

    this.#autoplayTimer = window.setInterval(() => {
      this.#goNext(true);
    }, interval);
  }
}
