import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { AttributeConverter } from '../../core/types.js';
import styles from './Inplace.styles.js';

export class MbInplace extends MbBaseComponent {
  static _componentName = 'mb-inplace';
  static _componentStyles = styles;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map<string, AttributeConverter>([
      ['active', 'boolean'],
      ['closable', 'boolean'],
      ['disabled', 'boolean'],
    ]);
  }

  static get observedAttributes() {
    return Array.from(this.attributeConverters.keys());
  }

  #active = false;

  constructor() {
    super();
    this.#active = this._bool('active');
  }

  get active() {
    return this.#active;
  }

  set active(v: boolean) {
    this.#active = Boolean(v);
    const ctor = this.constructor as typeof MbInplace;
    this._reflectToAttr('active', this.#active, ctor.attributeConverters.get('active') as any);
    this._scheduleRender();
  }

  protected _render(): string {
    return this._html`
      <div class="mb-inplace">
        ${this.#active
          ? `<div class="mb-inplace-content"><slot name="content"></slot>${this._bool('closable') && !this._bool('disabled') ? '<button class="mb-inplace-close" data-mb-close>×</button>' : ''}</div>`
          : `<div class="mb-inplace-display" data-mb-display><slot name="display"></slot></div>`}
      </div>`;
  }

  protected _afterRender(): void {
    // display click -> open
    const display = this._qs<HTMLElement>('[data-mb-display]');
    if (display) {
      const onDisplayClick = () => {
        if (this._bool('disabled')) return;
        this.active = true;
        this.emit('mb-open');
      };
      display.addEventListener('click', onDisplayClick);
      this._addCleanup(() => display.removeEventListener('click', onDisplayClick));
    }

    const closeBtn = this._qs<HTMLButtonElement>('[data-mb-close]');
    if (closeBtn) {
      const onClose = (e: Event) => {
        e.stopPropagation();
        this.active = false;
        this.emit('mb-close');
      };
      closeBtn.addEventListener('click', onClose);
      this._addCleanup(() => closeBtn.removeEventListener('click', onClose));
    }
  }
}

export function defineInplace(): void {
  if (!customElements.get('mb-inplace')) {
    customElements.define('mb-inplace', MbInplace);
  }
}

export default MbInplace;
