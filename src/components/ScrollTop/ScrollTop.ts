import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { AttributeConverter } from '../../core/types.js';
import styles from './ScrollTop.styles.js';

export class MbScrollTop extends MbBaseComponent {
  static _componentName = 'mb-scrolltop';
  static _componentStyles = styles;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map<string, AttributeConverter>([
      ['target', 'string'],
      ['threshold', 'number'],
      ['behavior', 'string'],
      ['icon', 'string'],
    ]);
  }

  static get observedAttributes() {
    return Array.from(this.attributeConverters.keys());
  }

  #scrollHandler?: () => void;

  constructor() {
    super();
  }

  protected _render(): string {
    const icon = this._str('icon', '↑');
    const target = this._str('target', 'window');
    const posClass = target === 'parent' ? 'mb-scrolltop-absolute' : 'mb-scrolltop-fixed';
    return this._html`<div class="mb-scrolltop ${posClass}"><button class="mb-scrolltop-button mb-scrolltop-hidden" data-mb-btn>${this._escape(icon)}</button></div>`;
  }

  protected _afterRender(): void {
    const btn = this._qs<HTMLButtonElement>('[data-mb-btn]');
    const target = this._str('target', 'window');
    const threshold = this._num('threshold', 400) ?? 400;
    const behavior = this._str('behavior', 'smooth') as ScrollBehavior;

    const getScrollTop = () => {
      if (target === 'parent' && this.parentElement) return this.parentElement.scrollTop;
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    };

    const showHide = () => {
      const st = getScrollTop();
      if (!btn) return;
      if (st > threshold) {
        btn.classList.remove('mb-scrolltop-hidden');
      } else {
        btn.classList.add('mb-scrolltop-hidden');
      }
    };

    const scrollTarget: EventTarget = target === 'parent' && this.parentElement ? this.parentElement : window;

    this.#scrollHandler = () => showHide();
    scrollTarget.addEventListener('scroll', this.#scrollHandler as EventListener);
    this._addCleanup(() => scrollTarget.removeEventListener('scroll', this.#scrollHandler as EventListener));

    if (btn) {
      const onClick = () => {
        if (target === 'parent' && this.parentElement) {
          this.parentElement.scrollTo({ top: 0, behavior });
        } else {
          window.scrollTo({ top: 0, behavior });
        }
      };
      btn.addEventListener('click', onClick);
      this._addCleanup(() => btn.removeEventListener('click', onClick));
    }

    // run initial check
    showHide();
  }
}

export function defineScrollTop(): void {
  if (!customElements.get('mb-scrolltop')) {
    customElements.define('mb-scrolltop', MbScrollTop);
  }
}

export default MbScrollTop;
