import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { TOGGLEBUTTON_STYLES } from './ToggleButton.styles.js';
import { createDefine } from '../../core/define.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbToggleButton extends MbBaseComponent {
  static readonly _componentName = 'mb-togglebutton';
  static readonly _componentStyles = TOGGLEBUTTON_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model-value', 'object'],
      ['checked', 'boolean'],
      ['on-label', 'string'],
      ['off-label', 'string'],
      ['on-icon', 'string'],
      ['off-icon', 'string'],
      ['disabled', 'boolean'],
      ['invalid', 'boolean'],
      ['tabindex', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  modelValue: unknown = null;
  checked = false;
  onLabel = '';
  offLabel = '';
  onIcon = '';
  offIcon = '';
  disabled = false;
  invalid = false;
  tabindex: string | null = null;

  constructor() {
    super();
  }

  protected _render(): string {
    const active = this._isActive();
    const disabledCls = this.disabled ? ' disabled' : '';
    const checkedCls = active ? ' mb-togglebutton-checked' : '';
    const ariaChecked = active ? 'true' : 'false';

    const label = active ? this.onLabel : this.offLabel;

    return this._html`
      <button part="root" type="button" class="mb-togglebutton${disabledCls}${checkedCls}" role="switch" aria-checked="${ariaChecked}" aria-disabled="${this.disabled ? 'true' : 'false'}" tabindex="${this.tabindex ?? '0'}">
        <span part="content" class="mb-togglebutton-content">
          <slot name="icon"></slot>
          <span part="label" class="mb-togglebutton-label"><slot name="label">${this._escape(label)}</slot></span>
        </span>
      </button>
    `;
  }

  protected _afterRender(): void {
    const iconClass = this._isActive() ? this.onIcon : this.offIcon;
    this.#syncGeneratedIcon(iconClass);

    const btn = this._qs<HTMLButtonElement>('.mb-togglebutton');
    if (!btn) return;

    const onClick = (e: MouseEvent) => {
      if (this.disabled) return;
      e.preventDefault();
      this._toggle();
    };

    const onKey = (e: KeyboardEvent) => {
      if (this.disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this._toggle();
      }
    };

    btn.addEventListener('click', onClick);
    btn.addEventListener('keydown', onKey);

    this._addCleanup(() => btn.removeEventListener('click', onClick));
    this._addCleanup(() => btn.removeEventListener('keydown', onKey));
  }

  protected _isActive(): boolean {
    if (this.modelValue !== null) return !!this.modelValue;
    return !!this.checked;
  }

  protected _toggle(): void {
    const newVal = !this._isActive();
    this.modelValue = newVal;
    this.checked = newVal;
    this.emit('mb-change', { value: newVal });
    this._scheduleRender();
  }

  #syncGeneratedIcon(iconClass: string): void {
    const normalized = iconClass.trim();
    const manual = this._qsaLight<HTMLElement>('[slot="icon"]:not([data-mb-generated="true"])');
    const generated = this._qsaLight<HTMLElement>('[slot="icon"][data-mb-generated="true"]');

    if (!normalized || manual.length > 0) {
      generated.forEach(node => node.remove());
      return;
    }

    let iconNode = generated[0] as HTMLElement | undefined;
    if (!iconNode) {
      iconNode = document.createElement('i');
      iconNode.setAttribute('slot', 'icon');
      iconNode.setAttribute('data-mb-generated', 'true');
      this.appendChild(iconNode);
    }

    iconNode.className = normalized;
    for (let i = 1; i < generated.length; i += 1) {
      generated[i]?.remove();
    }
  }
}

export const defineToggleButton = createDefine('mb-togglebutton', MbToggleButton);
export {};
