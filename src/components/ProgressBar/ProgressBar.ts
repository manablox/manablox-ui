import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { PROGRESSBAR_STYLES } from './ProgressBar.styles.js';

export class MbProgressBar extends MbBaseComponent {
  protected static readonly _componentName = 'mb-progressbar';
  protected static readonly _componentStyles = PROGRESSBAR_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['value', 'number'],
      ['show-value', 'boolean'],
      ['mode', 'string'],
    ] as const);
  }

  value: number | null = null;
  showValue = true;
  mode: 'determinate' | 'indeterminate' = 'determinate';

  protected _render(): string {
    const determinate = this.mode === 'determinate' && this.value != null;
    const ariaNow = determinate && this.value != null ? String(this.value) : '';
    const valueWidth = determinate && this.value != null ? `${this.value}%` : '0%';
    const indClass = this.mode === 'indeterminate' || this.value == null ? ' mb-progressbar-indeterminate' : '';

    return this._html`
      <div class="mb-progressbar${indClass} mb-component" role="progressbar" aria-valuemin="0" aria-valuemax="100" ${ariaNow ? `aria-valuenow="${ariaNow}"` : ''}>
        <div class="mb-progressbar-value" style="width:${this._escape(valueWidth)}">
          ${this.showValue && determinate ? `<span class="mb-progressbar-label">${this._escape(this.value)}%</span>` : ''}
        </div>
      </div>
    `;
  }
}
