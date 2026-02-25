import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { CHIP_STYLES } from './Chip.styles.js';

export class MbChip extends MbBaseComponent {
  protected static readonly _componentName = 'mb-chip';
  protected static readonly _componentStyles = CHIP_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['label', 'string'],
      ['icon', 'string'],
      ['image', 'string'],
      ['image-alt', 'string'],
      ['removable', 'boolean'],
      ['remove-icon', 'string'],
    ] as const);
  }

  label?: string | null = null;
  icon?: string | null = null;
  image?: string | null = null;
  imageAlt?: string | null = null;
  removable = false;
  removeIcon?: string | null = null;

  static get observedAttributes() {
    return Array.from((this as any).attributeConverters.keys());
  }

  protected _render(): string {
    const img = this.image ? `<img part="image" src="${this._escape(this.image)}" alt="${this._escape(this.imageAlt)}" />` : '';
    const ic = !this.image && this.icon ? `<span part="icon" class="mb-chip-icon ${this._escape(this.icon)}"></span>` : '';
    const lbl = `<span part="label" class="mb-chip-label"><slot>${this._escape(this.label)}</slot></span>`;
    const removeBtn = this.removable ? `<button part="remove-button" class="mb-chip-remove">${this._escape(this.removeIcon ?? '×')}</button>` : '';

    return this._html`
      <span part="root" class="mb-chip mb-component">
        ${img}${ic}${lbl}${removeBtn}
      </span>
    `;
  }

  protected _afterRender(): void {
    if (!this.removable) return;

    const btn = this._qs<HTMLButtonElement>('.mb-chip-remove');
    if (!btn) return;

    const handler = (e: Event) => {
      e.preventDefault();
      this.emit('mb-remove');
    };

    btn.addEventListener('click', handler);
    this._addCleanup(() => btn.removeEventListener('click', handler));
  }
}
