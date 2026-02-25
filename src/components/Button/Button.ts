import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { BUTTON_STYLES } from './Button.styles.js';

export class MbButton extends MbBaseComponent {
  static readonly _componentName = 'mb-button';
  static readonly _componentStyles = BUTTON_STYLES;

  static get observedAttributes(): string[] {
    return [
      'label',
      'icon',
      'icon-pos',
      'severity',
      'raised',
      'rounded',
      'text',
      'outlined',
      'link',
      'size',
      'disabled',
      'loading',
      'loading-icon',
      'type',
      'badge',
      'badge-class',
      'badge-severity',
    ];
  }

  get label(): string { return this._str('label'); }
  get icon(): string { return this._str('icon'); }
  get iconPos(): string { return this._str('icon-pos', 'left'); }
  get severity(): string { return this._str('severity'); }
  get raised(): boolean { return this._bool('raised'); }
  get rounded(): boolean { return this._bool('rounded'); }
  get text(): boolean { return this._bool('text'); }
  get outlined(): boolean { return this._bool('outlined'); }
  get link(): boolean { return this._bool('link'); }
  get disabled(): boolean { return this._bool('disabled'); }
  get loading(): boolean { return this._bool('loading'); }
  get loadingIcon(): string { return this._str('loading-icon'); }
  get buttonType(): string { return this._str('type', 'button') as 'button' | 'submit' | 'reset'; }
  get badge(): string { return this._str('badge'); }
  get badgeClass(): string { return this._str('badge-class'); }
  get badgeSeverity(): string { return this._str('badge-severity'); }
  get size(): string { return this._str('size'); }

  protected _render(): string {
    const classes = this._buildClasses();
    const iconLeft = this.icon && this.iconPos !== 'right';
    const iconRight = this.icon && this.iconPos === 'right';
    const showBadge = this.badge !== '' && this.badge !== null;

    return `
      <button
        type="${this._escape(this.buttonType)}"
        class="${classes}"
        ${this.disabled || this.loading ? 'disabled' : ''}
        aria-label="${this._escape(this.label || this.icon)}"
        aria-disabled="${this.disabled || this.loading}"
        ${this.loading ? 'aria-busy="true"' : ''}
      >
        ${this.loading ? `<span class="mb-button-loading-icon mb-icon${this.loadingIcon ? ' ' + this._escape(this.loadingIcon) : ''}"></span>` : ''}
        ${iconLeft && !this.loading ? `<span class="mb-button-icon mb-button-icon-left mb-icon ${this._escape(this.icon)}"></span>` : ''}
        ${this.label ? `<span class="mb-button-label">${this._escape(this.label)}</span>` : '<slot></slot>'}
        ${iconRight && !this.loading ? `<span class="mb-button-icon mb-button-icon-right mb-icon ${this._escape(this.icon)}"></span>` : ''}
        ${showBadge ? `<span class="mb-badge${this.badgeClass ? ' ' + this._escape(this.badgeClass) : ''}${this.badgeSeverity ? ' mb-badge-' + this._escape(this.badgeSeverity) : ''}">${this._escape(this.badge)}</span>` : ''}
      </button>
    `.trim();
  }

  protected _afterRender(): void {
    const btn = this._qs<HTMLButtonElement>('button');
    if (btn) {
      this._attachRipple(btn);
    }
  }

  private _buildClasses(): string {
    const classes = ['mb-button', 'mb-component'];
    if (this.severity) classes.push(`mb-button-${this.severity}`);
    if (this.raised) classes.push('mb-button-raised');
    if (this.rounded) classes.push('mb-button-rounded');
    if (this.text) classes.push('mb-button-text');
    if (this.outlined) classes.push('mb-button-outlined');
    if (this.link) classes.push('mb-button-link');
    if (this.loading) classes.push('mb-button-loading');
    if (this.size === 'small') classes.push('mb-button-sm');
    if (this.size === 'large') classes.push('mb-button-lg');
    if (this.disabled) classes.push('mb-disabled');
    const hasTextContent = (this.textContent ?? '').trim().length > 0;
    if (!this.label && !hasTextContent && this.icon) classes.push('mb-button-icon-only');
    return classes.join(' ');
  }
}
export {};
