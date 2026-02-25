import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { AttributeConverter } from '../../core/types.js';
import styles from './Image.styles.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { uniqueId } from '../../utils/UniqueId.js';

export class MbImage extends MbBaseComponent {
  static _componentName = 'mb-image';
  static _componentStyles = styles;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map<string, AttributeConverter>([
      ['src', 'string'],
      ['alt', 'string'],
      ['width', 'string'],
      ['height', 'string'],
      ['preview', 'boolean'],
      ['image-class', 'string'],
      ['image-style', 'string'],
      ['error-src', 'string'],
    ]);
  }

  static get observedAttributes() {
    return Array.from(this.attributeConverters.keys());
  }

  #portalKey: string | null = null;
  #scale = 1;

  constructor() {
    super();
  }

  protected _render(): string {
    const src = this._str('src', '');
    const alt = this._str('alt', '');
    const width = this._str('width', '');
    const height = this._str('height', '');
    const cls = this._str('image-class', '');
    const style = this._str('image-style', '');

    return this._html`<div class="mb-image"><img src="${this._escape(src)}" alt="${this._escape(alt)}" ${width?`width="${this._escape(width)}"`:''} ${height?`height="${this._escape(height)}"`:''} class="${this._escape(cls)}" style="${this._escape(style)}" data-mb-img/></div>`;
  }

  protected _afterRender(): void {
    const img = this._qs<HTMLImageElement>('[data-mb-img]');
    if (!img) return;

    const onClick = () => {
      if (!this._bool('preview')) return;
      this.openPreview();
    };
    img.addEventListener('click', onClick);
    this._addCleanup(() => img.removeEventListener('click', onClick));
  }

  openPreview(): void {
    const src = this._str('src', '');
    if (!src) return;
    this.#portalKey = uniqueId('mb-image');
    const host = createPortal(this.#portalKey, this, 'overlay');
    host.innerHTML = `
      <div class="mb-image-portal-backdrop" data-mb-backdrop>
        <div class="mb-image-portal-content">
          <img src="${this._escape(src)}" class="mb-image-portal-img" data-mb-portal-img />
          <div class="mb-image-portal-controls">
            <button class="mb-image-portal-button" data-mb-zoom-in>+</button>
            <button class="mb-image-portal-button" data-mb-zoom-out>-</button>
            <button class="mb-image-portal-button" data-mb-close>×</button>
          </div>
        </div>
      </div>`;

    const backdrop = host.querySelector<HTMLElement>('[data-mb-backdrop]');
    const portalImg = host.querySelector<HTMLImageElement>('[data-mb-portal-img]');
    const btnClose = host.querySelector<HTMLElement>('[data-mb-close]');
    const btnZoomIn = host.querySelector<HTMLElement>('[data-mb-zoom-in]');
    const btnZoomOut = host.querySelector<HTMLElement>('[data-mb-zoom-out]');

    const cleanupFns: Array<() => void> = [];

    const close = () => {
      if (this.#portalKey) removePortal(this.#portalKey);
      this.#portalKey = null;
      cleanupFns.forEach(fn => fn());
    };

    if (backdrop) {
      const onBackdrop = (e: Event) => {
        if (e.target === backdrop) close();
      };
      backdrop.addEventListener('click', onBackdrop);
      cleanupFns.push(() => backdrop.removeEventListener('click', onBackdrop));
    }

    if (btnClose) {
      const onClose = () => close();
      btnClose.addEventListener('click', onClose);
      cleanupFns.push(() => btnClose.removeEventListener('click', onClose));
    }

    if (btnZoomIn && portalImg) {
      const onZoomIn = () => {
        this.#scale = Math.min(3, this.#scale + 0.25);
        portalImg.style.transform = `scale(${this.#scale})`;
      };
      btnZoomIn.addEventListener('click', onZoomIn);
      cleanupFns.push(() => btnZoomIn.removeEventListener('click', onZoomIn));
    }

    if (btnZoomOut && portalImg) {
      const onZoomOut = () => {
        this.#scale = Math.max(0.25, this.#scale - 0.25);
        portalImg.style.transform = `scale(${this.#scale})`;
      };
      btnZoomOut.addEventListener('click', onZoomOut);
      cleanupFns.push(() => btnZoomOut.removeEventListener('click', onZoomOut));
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    cleanupFns.push(() => document.removeEventListener('keydown', onKey));

    // ensure removed when element disconnects
    this._addCleanup(() => {
      if (this.#portalKey) removePortal(this.#portalKey);
      document.removeEventListener('keydown', onKey);
    });
  }
}

export function defineImage(): void {
  if (!customElements.get('mb-image')) {
    customElements.define('mb-image', MbImage);
  }
}

export default MbImage;
