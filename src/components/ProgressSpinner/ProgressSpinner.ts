import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { PROGRESSSPINNER_STYLES } from './ProgressSpinner.styles.js';

export class MbProgressSpinner extends MbBaseComponent {
  protected static readonly _componentName = 'mb-progressspinner';
  protected static readonly _componentStyles = PROGRESSSPINNER_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['stroke-width', 'string'],
      ['fill', 'string'],
      ['animation-duration', 'string'],
      ['aria-label', 'string'],
    ] as const);
  }

  strokeWidth = '2';
  fill = 'none';
  animationDuration = '2s';
  ariaLabel: string | null = null;

  protected _render(): string {
    const stroke = this._escape(this.strokeWidth ?? '2');
    const fill = this._escape(this.fill ?? 'none');
    const duration = this._escape(this.animationDuration ?? '2s');
    const aria = this.ariaLabel ? `aria-label="${this._escape(this.ariaLabel)}"` : '';

    return this._html`
      <div class="mb-progressspinner mb-component" part="root" role="img" ${aria}>
        <svg class="mb-progressspinner-svg" part="svg" viewBox="25 25 50 50" style="--mb-progressspinner-animation-duration:${duration}">
          <circle class="mb-progressspinner-circle" part="circle" cx="50" cy="50" r="20" fill="${fill}" stroke-width="${stroke}"></circle>
        </svg>
      </div>
    `;
  }
}
