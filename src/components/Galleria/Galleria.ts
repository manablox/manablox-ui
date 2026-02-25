import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { FocusTrap } from '../../utils/FocusTrap.js';
import { GALLERIA_STYLES } from './Galleria.styles.js';

type RenderTemplateFn = (item: unknown, index: number) => string;

export class MbGalleria extends MbBaseComponent {
  static readonly _componentName = 'mb-galleria';
  static readonly _componentStyles = GALLERIA_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'object'],
      ['active-index', 'number'],
      ['num-visible', 'number'],
      ['show-thumbnails', 'boolean'],
      ['show-thumbnail-navigators', 'boolean'],
      ['show-item-navigators', 'boolean'],
      ['show-item-navigators-on-hover', 'boolean'],
      ['show-indicators', 'boolean'],
      ['show-indicators-on-item', 'boolean'],
      ['show-caption-on-item', 'boolean'],
      ['change-item-on-indicator-hover', 'boolean'],
      ['circular', 'boolean'],
      ['auto-play-interval', 'number'],
      ['full-screen', 'boolean'],
      ['visible', 'boolean'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value: unknown[] = [];
  activeIndex = 0;
  numVisible = 3;
  showThumbnails = true;
  showThumbnailNavigators = true;
  showItemNavigators = false;
  showItemNavigatorsOnHover = false;
  showIndicators = false;
  showIndicatorsOnItem = false;
  showCaptionOnItem = false;
  changeItemOnIndicatorHover = false;
  circular = false;
  autoPlayInterval = 0;
  fullScreen = false;
  visible = false;

  renderItem: RenderTemplateFn | null = null;
  renderThumbnail: RenderTemplateFn | null = null;
  renderCaption: RenderTemplateFn | null = null;

  #portalKey = `mb-galleria-${Math.random().toString(36).slice(2)}`;
  #portalHost: HTMLElement | null = null;
  #focusTrap: FocusTrap | null = null;
  #fullscreenCleanupFns: Array<() => void> = [];
  #itemTemplate = '';
  #thumbnailTemplate = '';
  #captionTemplate = '';
  #autoplayTimer: number | null = null;
  #paused = false;
  #touchStartX = 0;
  #listenersBound = false;

  connectedCallback(): void {
    this.#captureTemplates();
    super.connectedCallback();
    this.setAttribute('tabindex', this.getAttribute('tabindex') ?? '0');
    this.#bindInlineListeners();
    this._addCleanup(() => this.#clearAutoplay());
    this._addCleanup(() => this.#teardownFullscreen(true));
  }

  disconnectedCallback(): void {
    this.#clearAutoplay();
    this.#teardownFullscreen(true);
    super.disconnectedCallback();
  }

  protected _render(): string {
    if (this.fullScreen) {
      return '';
    }

    return this.#buildMarkup(false);
  }

  protected _afterRender(): void {
    if (this.fullScreen) {
      if (this.visible) {
        this.#renderFullscreen();
      } else {
        this.#teardownFullscreen(false);
      }
    } else {
      this.#teardownFullscreen(true);
    }

    this.#restartAutoplay();
  }

  get #items(): unknown[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  get #hasItems(): boolean {
    return this.#items.length > 0;
  }

  get #safeVisibleThumbs(): number {
    return Math.max(1, Math.trunc(this.numVisible || 3));
  }

  get #boundedActiveIndex(): number {
    if (!this.#hasItems) return 0;
    const index = Number.isFinite(this.activeIndex) ? Math.trunc(this.activeIndex) : 0;
    return Math.min(Math.max(index, 0), this.#items.length - 1);
  }

  #captureTemplates(): void {
    this.#itemTemplate = this.querySelector<HTMLTemplateElement>('template[data-slot="item"]')?.innerHTML ?? '';
    this.#thumbnailTemplate = this.querySelector<HTMLTemplateElement>('template[data-slot="thumbnail"]')?.innerHTML ?? '';
    this.#captionTemplate = this.querySelector<HTMLTemplateElement>('template[data-slot="caption"]')?.innerHTML ?? '';
  }

  #bindInlineListeners(): void {
    if (this.#listenersBound) return;
    this.#listenersBound = true;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const action = actionEl?.dataset.action;
      if (!action) return;

      if (action === 'prev') {
        this.#navigate(-1, true);
      } else if (action === 'next') {
        this.#navigate(1, true);
      } else if (action === 'thumb' || action === 'indicator') {
        const index = Number(actionEl?.dataset.index ?? '-1');
        if (index >= 0) {
          this.#setActiveIndex(index, true);
        }
      } else if (action === 'close') {
        this.#setVisible(false, true);
      } else if (action === 'mask') {
        this.#setVisible(false, true);
      }
    };

    const onMouseOver = (event: Event) => {
      if (!this.changeItemOnIndicatorHover) return;
      const target = event.target as HTMLElement | null;
      const indicator = target?.closest<HTMLElement>('[data-action="indicator"]');
      if (!indicator) return;
      const index = Number(indicator.dataset.index ?? '-1');
      if (index >= 0) {
        this.#setActiveIndex(index, true);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.#navigate(-1, true);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.#navigate(1, true);
      } else if (event.key === 'Escape' && this.fullScreen && this.visible) {
        event.preventDefault();
        this.#setVisible(false, true);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      this.#touchStartX = touch.clientX;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const delta = touch.clientX - this.#touchStartX;
      if (Math.abs(delta) < 24) return;
      this.#navigate(delta < 0 ? 1 : -1, true);
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
    this.addEventListener('mouseover', onMouseOver);
    this.addEventListener('keydown', onKeyDown);
    this.addEventListener('touchstart', onTouchStart, { passive: true });
    this.addEventListener('touchend', onTouchEnd, { passive: true });
    this.addEventListener('mouseenter', onMouseEnter);
    this.addEventListener('mouseleave', onMouseLeave);

    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('mouseover', onMouseOver));
    this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
    this._addCleanup(() => this.removeEventListener('touchstart', onTouchStart));
    this._addCleanup(() => this.removeEventListener('touchend', onTouchEnd));
    this._addCleanup(() => this.removeEventListener('mouseenter', onMouseEnter));
    this._addCleanup(() => this.removeEventListener('mouseleave', onMouseLeave));
  }

  #buildMarkup(isFullscreen: boolean): string {
    const active = this.#boundedActiveIndex;
    const item = this.#items[active] ?? null;

    const currentItemMarkup = this.#renderPrimaryItem(item, active);
    const captionMarkup = this.showCaptionOnItem ? this.#renderCaptionMarkup(item, active) : '';
    const indicatorsInItem = this.showIndicators && this.showIndicatorsOnItem ? this.#renderIndicators(active) : '';
    const indicatorsOutside = this.showIndicators && !this.showIndicatorsOnItem ? this.#renderIndicators(active) : '';
    const navigators = this.showItemNavigators
      ? `
          <button type="button" class="mb-galleria-item-nav mb-galleria-item-nav-prev" data-action="prev" aria-label="Previous item">‹</button>
          <button type="button" class="mb-galleria-item-nav mb-galleria-item-nav-next" data-action="next" aria-label="Next item">›</button>
        `
      : '';

    const thumbnails = this.showThumbnails
      ? `
        <div class="mb-galleria-thumbnail-wrapper">
          <div class="mb-galleria-thumbnail-container">
            <div class="mb-galleria-thumbnail-items">
              ${this.#renderThumbnails(active)}
            </div>
          </div>
        </div>
      `
      : '';

    const closeButton = isFullscreen
      ? '<button type="button" class="mb-galleria-close-button" data-action="close" aria-label="Close">✕</button>'
      : '';

    const navOnHoverClass = this.showItemNavigatorsOnHover ? 'mb-galleria-item-nav-on-hover' : '';

    return `
      <div class="mb-galleria ${isFullscreen ? 'mb-galleria-fullscreen' : ''} ${navOnHoverClass}">
        ${isFullscreen ? '<div class="mb-galleria-mask" data-action="mask"></div>' : ''}
        ${closeButton}
        <div class="mb-galleria-content">
          <div class="mb-galleria-item-wrapper">
            <div class="mb-galleria-item">${currentItemMarkup}</div>
            ${navigators}
            ${captionMarkup}
            ${indicatorsInItem}
          </div>
          ${thumbnails}
          ${indicatorsOutside}
        </div>
      </div>
    `;
  }

  #renderPrimaryItem(item: unknown, index: number): string {
    if (this.renderItem) {
      return this.renderItem(item, index);
    }
    if (this.#itemTemplate) {
      return this.#interpolateTemplate(this.#itemTemplate, item);
    }

    const image = this.#readField(item, 'image');
    const alt = this.#readField(item, 'alt') || `Item ${index + 1}`;
    if (image) {
      return `<img src="${this._escape(image)}" alt="${this._escape(alt)}" />`;
    }

    return `<span>${this._escape(String(item ?? ''))}</span>`;
  }

  #renderThumbnails(active: number): string {
    const start = Math.max(0, active - Math.floor(this.#safeVisibleThumbs / 2));
    const end = Math.min(this.#items.length, start + this.#safeVisibleThumbs);

    return this.#items
      .slice(start, end)
      .map((item, localIndex) => {
        const index = start + localIndex;
        const activeClass = index === active ? 'mb-galleria-thumbnail-item-active' : '';
        const content = this.#renderThumbnailMarkup(item, index);
        return `<button type="button" class="mb-galleria-thumbnail-item ${activeClass}" data-action="thumb" data-index="${index}" aria-label="Show item ${index + 1}">${content}</button>`;
      })
      .join('');
  }

  #renderThumbnailMarkup(item: unknown, index: number): string {
    if (this.renderThumbnail) {
      return this.renderThumbnail(item, index);
    }
    if (this.#thumbnailTemplate) {
      return this.#interpolateTemplate(this.#thumbnailTemplate, item);
    }

    const image = this.#readField(item, 'image');
    const alt = this.#readField(item, 'alt') || `Thumbnail ${index + 1}`;
    if (image) {
      return `<img src="${this._escape(image)}" alt="${this._escape(alt)}" />`;
    }

    return `<span>${this._escape(String(item ?? ''))}</span>`;
  }

  #renderCaptionMarkup(item: unknown, index: number): string {
    if (this.renderCaption) {
      const output = this.renderCaption(item, index);
      return output ? `<div class="mb-galleria-caption">${output}</div>` : '';
    }

    if (this.#captionTemplate) {
      return `<div class="mb-galleria-caption">${this.#interpolateTemplate(this.#captionTemplate, item)}</div>`;
    }

    const caption = this.#readField(item, 'caption') || this.#readField(item, 'alt');
    if (!caption) return '';
    return `<div class="mb-galleria-caption">${this._escape(caption)}</div>`;
  }

  #renderIndicators(active: number): string {
    const dots = this.#items
      .map((_, index) => {
        const activeClass = index === active ? 'mb-galleria-thumbnail-item-active' : '';
        return `<button type="button" class="mb-galleria-indicator ${activeClass}" data-action="indicator" data-index="${index}" aria-label="Go to item ${index + 1}"></button>`;
      })
      .join('');
    return `<div class="mb-galleria-indicators">${dots}</div>`;
  }

  #setActiveIndex(nextIndex: number, emitEvent: boolean): void {
    if (!this.#hasItems) return;
    const bounded = this.circular
      ? (nextIndex + this.#items.length) % this.#items.length
      : Math.min(Math.max(nextIndex, 0), this.#items.length - 1);

    if (bounded === this.#boundedActiveIndex) return;
    this.activeIndex = bounded;
    this._reflectToAttr('active-index', bounded, 'number');
    this._scheduleRender();

    if (emitEvent) {
      this.emit('mb-item-change', { index: bounded });
    }
  }

  #navigate(delta: -1 | 1 | number, emitEvent: boolean): void {
    this.#setActiveIndex(this.#boundedActiveIndex + delta, emitEvent);
  }

  #setVisible(next: boolean, emitEvent: boolean): void {
    if (this.visible === next) return;
    this.visible = next;
    this._reflectToAttr('visible', next, 'boolean');
    this._scheduleRender();
    if (emitEvent) {
      this.emit('mb-visible-change', { value: next });
    }
  }

  #renderFullscreen(): void {
    if (!this.#portalHost) {
      this.#portalHost = createPortal(this.#portalKey, this, 'modal');
    }

    this.#portalHost.innerHTML = this.#buildMarkup(true);
    this.#bindFullscreenListeners();

    const root = this.#portalHost.querySelector<HTMLElement>('.mb-galleria-fullscreen');
    if (!root) return;

    this.#focusTrap?.deactivate();
    this.#focusTrap = new FocusTrap(root);
    this.#focusTrap.activate();
  }

  #bindFullscreenListeners(): void {
    if (!this.#portalHost) return;
    this.#clearFullscreenListeners();

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const action = actionEl?.dataset.action;
      if (action === 'close' || action === 'mask') {
        this.#setVisible(false, true);
      } else if (action === 'prev') {
        this.#navigate(-1, true);
      } else if (action === 'next') {
        this.#navigate(1, true);
      } else if (action === 'thumb' || action === 'indicator') {
        const index = Number(actionEl?.dataset.index ?? '-1');
        if (index >= 0) this.#setActiveIndex(index, true);
      }
    };

    const onMouseOver = (event: Event) => {
      if (!this.changeItemOnIndicatorHover) return;
      const target = event.target as HTMLElement | null;
      const indicator = target?.closest<HTMLElement>('[data-action="indicator"]');
      if (!indicator) return;
      const index = Number(indicator.dataset.index ?? '-1');
      if (index >= 0) this.#setActiveIndex(index, true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.#navigate(-1, true);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.#navigate(1, true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.#setVisible(false, true);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      this.#touchStartX = touch.clientX;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const delta = touch.clientX - this.#touchStartX;
      if (Math.abs(delta) < 24) return;
      this.#navigate(delta < 0 ? 1 : -1, true);
    };

    const onMouseEnter = () => {
      this.#paused = true;
      this.#restartAutoplay();
    };

    const onMouseLeave = () => {
      this.#paused = false;
      this.#restartAutoplay();
    };

    this.#portalHost.addEventListener('click', onClick);
    this.#portalHost.addEventListener('mouseover', onMouseOver);
    this.#portalHost.addEventListener('keydown', onKeyDown);
    this.#portalHost.addEventListener('touchstart', onTouchStart, { passive: true });
    this.#portalHost.addEventListener('touchend', onTouchEnd, { passive: true });
    this.#portalHost.addEventListener('mouseenter', onMouseEnter);
    this.#portalHost.addEventListener('mouseleave', onMouseLeave);

    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('click', onClick));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('mouseover', onMouseOver));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('keydown', onKeyDown));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('touchstart', onTouchStart));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('touchend', onTouchEnd));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('mouseenter', onMouseEnter));
    this.#fullscreenCleanupFns.push(() => this.#portalHost?.removeEventListener('mouseleave', onMouseLeave));
  }

  #clearFullscreenListeners(): void {
    this.#fullscreenCleanupFns.forEach(fn => fn());
    this.#fullscreenCleanupFns = [];
  }

  #teardownFullscreen(immediate: boolean): void {
    if (!this.#portalHost && !this.#focusTrap) return;

    this.#focusTrap?.deactivate();
    this.#focusTrap = null;
    this.#clearFullscreenListeners();

    if (immediate) {
      removePortal(this.#portalKey);
      this.#portalHost = null;
      return;
    }

    removePortal(this.#portalKey);
    this.#portalHost = null;
  }

  #restartAutoplay(): void {
    this.#clearAutoplay();
    const interval = Number.isFinite(this.autoPlayInterval) ? Math.max(0, this.autoPlayInterval) : 0;
    if (!interval || this.#paused || this.#items.length <= 1) return;

    this.#autoplayTimer = window.setInterval(() => {
      this.#navigate(1, true);
    }, interval);
  }

  #clearAutoplay(): void {
    if (this.#autoplayTimer == null) return;
    window.clearInterval(this.#autoplayTimer);
    this.#autoplayTimer = null;
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
}
