import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { RADIOBUTTON_STYLES } from './RadioButton.styles.js';
import { createDefine } from '../../core/define.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbRadioButton extends MbBaseComponent {
  static readonly _componentName = 'mb-radiobutton';
  static readonly _componentStyles = RADIOBUTTON_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'object'],
      ['model-value', 'object'],
      ['disabled', 'boolean'],
      ['invalid', 'boolean'],
      ['variant', 'string'],
      ['name', 'string'],
      ['id', 'string'],
      ['input-id', 'string'],
      ['tabindex', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value: unknown = null;
  modelValue: unknown = null;
  disabled = false;
  invalid = false;
  variant = '';
  name = '';
  id = '';
  inputId = '';
  tabindex: string | null = null;

  constructor() {
    super();
  }

  protected _render(): string {
    const checked = this._isChecked();
    const disabledCls = this.disabled ? ' disabled' : '';
    const invalidCls = this.invalid ? ' invalid' : '';
    const checkedCls = checked ? ' mb-radiobutton-checked' : '';
    const variantCls = this.variant ? ` variant-${this._escape(this.variant)}` : '';

    const inputId = this._escape(this.inputId || `${this.id || ''}`);

    return this._html`
      <div class="mb-radiobutton${disabledCls}${invalidCls}${checkedCls}${variantCls}" role="radio" aria-checked="${checked ? 'true' : 'false'}" aria-disabled="${this.disabled ? 'true' : 'false'}" tabindex="${this.tabindex ?? '0'}">
        <input type="radio" ${checked ? 'checked' : ''} ${this.disabled ? 'disabled' : ''} ${inputId ? `id="${inputId}"` : ''} ${this.name ? `name="${this._escape(this.name)}"` : ''} />
        <div class="mb-radiobutton-box" tabindex="-1"><span class="mb-radiobutton-icon"></span></div>
      </div>
    `;
  }

  protected _afterRender(): void {
    const wrapper = this._qs<HTMLDivElement>('.mb-radiobutton');
    if (!wrapper) return;

    const input = this._qs<HTMLInputElement>('input[type="radio"]');
    if (!input) return;

    const checked = this._isChecked();
    input.checked = checked;
    input.disabled = !!this.disabled;
    input.name = this.name || '';
    if (this.inputId) input.id = this.inputId;
    input.tabIndex = -1;

    wrapper.setAttribute('aria-checked', checked ? 'true' : 'false');
    wrapper.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');

    const onInputChange = (e: Event) => {
      if (this.disabled) return;
      // select this value
      this.modelValue = this.value;
      this.emit('mb-change', { value: this.value });
      this._scheduleRender();
    };

    const onWrapperKey = (e: KeyboardEvent) => {
      if (this.disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        input.click();
      }
    };

    const onWrapperClick = () => {
      if (this.disabled) return;
      input.click();
    };

    input.addEventListener('change', onInputChange);
    wrapper.addEventListener('keydown', onWrapperKey);
    wrapper.addEventListener('click', onWrapperClick);

    this._addCleanup(() => input.removeEventListener('change', onInputChange));
    this._addCleanup(() => wrapper.removeEventListener('keydown', onWrapperKey));
    this._addCleanup(() => wrapper.removeEventListener('click', onWrapperClick));
  }

  protected _isChecked(): boolean {
    return this.modelValue !== null && this.modelValue === this.value;
  }
}

export const defineRadioButton = createDefine('mb-radiobutton', MbRadioButton);
export {};
