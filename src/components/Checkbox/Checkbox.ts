import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { CHECKBOX_STYLES } from './Checkbox.styles.js';
import { createDefine } from '../../core/define.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbCheckbox extends MbBaseComponent {
  static readonly _componentName = 'mb-checkbox';
  static readonly _componentStyles = CHECKBOX_STYLES;

  // Attribute converters for automatic attribute -> prop conversion
  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'object'],
      ['model-value', 'object'],
      ['binary', 'boolean'],
      ['disabled', 'boolean'],
      ['invalid', 'boolean'],
      ['variant', 'string'],
      ['indeterminate', 'boolean'],
      ['name', 'string'],
      ['id', 'string'],
      ['input-id', 'string'],
      ['tabindex', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  // properties
  value: unknown = null;
  modelValue: unknown = null;
  binary = false;
  disabled = false;
  invalid = false;
  variant = '';
  indeterminate = false;
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
    const checkedCls = checked ? ' mb-checkbox-checked' : '';
    const variantCls = this.variant ? ` variant-${this._escape(this.variant)}` : '';
    const sizeCls = '';

    const inputId = this._escape(this.inputId || `${this.id || ''}`);

    return this._html`
      <div class="mb-checkbox${disabledCls}${invalidCls}${checkedCls}${variantCls}${sizeCls}" role="checkbox" aria-checked="${checked ? 'true' : this.indeterminate ? 'mixed' : 'false'}" aria-disabled="${this.disabled ? 'true' : 'false'}" tabindex="${this.tabindex ?? '0'}">
        <input type="checkbox" ${checked ? 'checked' : ''} ${this.disabled ? 'disabled' : ''} ${inputId ? `id="${inputId}"` : ''} ${this.name ? `name="${this._escape(this.name)}"` : ''} />
        <div class="mb-checkbox-box" tabindex="-1"><span class="mb-checkbox-icon">✓</span></div>
      </div>
    `;
  }

  protected _afterRender(): void {
    const wrapper = this._qs<HTMLDivElement>('.mb-checkbox');
    if (!wrapper) return;

    const input = this._qs<HTMLInputElement>('input[type="checkbox"]');
    if (!input) return;

    // Ensure DOM properties reflect state
    const checked = this._isChecked();
    input.checked = checked;
    input.disabled = !!this.disabled;
    input.name = this.name || '';
    if (this.inputId) input.id = this.inputId;
    input.tabIndex = -1; // focus on wrapper
    // indeterminate must be set as property
    (input as HTMLInputElement).indeterminate = !!this.indeterminate;

    // update aria
    wrapper.setAttribute('aria-checked', this.indeterminate ? 'mixed' : checked ? 'true' : 'false');
    wrapper.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');

    // event handlers
    const onInputChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const isChecked = target.checked;
      this._applyChangeFromInput(isChecked);
    };

    const onWrapperKey = (e: KeyboardEvent) => {
      if (this.disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        input.click();
      }
    };

    const onWrapperClick = (e: MouseEvent) => {
      if (this.disabled) return;
      // clicking wrapper toggles native input (native input is visually hidden)
      input.click();
    };

    input.addEventListener('change', onInputChange);
    wrapper.addEventListener('keydown', onWrapperKey);
    wrapper.addEventListener('click', onWrapperClick);

    // cleanup
    this._addCleanup(() => input.removeEventListener('change', onInputChange));
    this._addCleanup(() => wrapper.removeEventListener('keydown', onWrapperKey));
    this._addCleanup(() => wrapper.removeEventListener('click', onWrapperClick));
  }

  protected _isChecked(): boolean {
    if (this.binary) {
      return !!this.modelValue;
    }
    if (Array.isArray(this.modelValue)) {
      try {
        return (this.modelValue as any[]).some(v => v === this.value);
      } catch {
        return false;
      }
    }
    return !!this.modelValue && this.modelValue === this.value;
  }

  protected _applyChangeFromInput(checked: boolean): void {
    // compute new modelValue
    let newModel: unknown = this.modelValue;
    if (this.binary) {
      newModel = checked;
    } else if (Array.isArray(this.modelValue)) {
      const arr = Array.from(this.modelValue as any[]);
      const idx = arr.findIndex(v => v === this.value);
      if (checked && idx === -1) arr.push(this.value);
      if (!checked && idx !== -1) arr.splice(idx, 1);
      newModel = arr;
    } else {
      // fallback: set value when checked, null when unchecked
      newModel = checked ? this.value : null;
    }

    // update internal state and re-render
    this.modelValue = newModel;
    // emit event with { value, checked }
    this.emit('mb-change', { value: this.value, checked });
    this._scheduleRender();
  }
}

export const defineCheckbox = createDefine('mb-checkbox', MbCheckbox);
export {};
