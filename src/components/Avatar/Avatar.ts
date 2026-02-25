import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { AVATAR_STYLES } from './Avatar.styles.js';

export class MbAvatar extends MbBaseComponent {
  protected static readonly _componentName = 'mb-avatar';
  protected static readonly _componentStyles = AVATAR_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['label', 'string'],
      ['icon', 'string'],
      ['image', 'string'],
      ['image-alt', 'string'],
      ['shape', 'string'],
      ['size', 'string'],
    ] as const);
  }

  // public properties are set via MbBaseComponent attribute conversion
  label?: string | null = null;
  icon?: string | null = null;
  image?: string | null = null;
  imageAlt?: string | null = null;
  shape: 'square' | 'circle' = 'square';
  size: 'normal' | 'large' | 'xlarge' | string = 'normal';

  protected _render(): string {
    const hasImage = !!this.image;
    const hasIcon = !hasImage && !!this.icon;
    const hasLabel = !hasImage && !hasIcon && !!this.label;

    const shapeClass = this.shape === 'circle' ? ' mb-avatar-circle' : '';
    const sizeClass = this.size === 'large' ? ' mb-avatar-lg' : this.size === 'xlarge' ? ' mb-avatar-xl' : '';

    return this._html`
      <div class="mb-avatar${shapeClass}${sizeClass}">
        ${hasImage
          ? `<img src="${this._escape(this.image)}" alt="${this._escape(this.imageAlt)}" />`
          : hasIcon
          ? `<i class="mb-avatar-icon ${this._escape(this.icon)}"></i>`
          : hasLabel
          ? `<span class="mb-avatar-text">${this._escape(this.label)}</span>`
          : `<slot></slot>`}
      </div>
    `;
  }
}
