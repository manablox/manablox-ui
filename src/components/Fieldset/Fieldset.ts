import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { FIELDSET_STYLES } from './Fieldset.styles.js';

export class MbFieldset extends MbBaseComponent {
  protected static readonly _componentName = 'mb-fieldset';
  protected static readonly _componentStyles = FIELDSET_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['legend', 'string'],
      ['toggleable', 'boolean'],
      ['collapsed', 'boolean'],
    ] as const);
  }

  legend?: string | null = null;
  toggleable = false;
  collapsed = false;

  static get observedAttributes() {
    return Array.from((this as any).attributeConverters.keys());
  }

  protected _render(): string {
    const legendText = this._escape(this.legend);
    const toggleClass = this.toggleable ? ' mb-fieldset-toggleable' : '';
    const collapsedClass = this.collapsed ? ' collapsed' : '';

    return this._html`
      <fieldset part="root" class="mb-fieldset mb-component${toggleClass}${collapsedClass}">
        <legend part="legend" class="mb-fieldset-legend${this.toggleable ? ' mb-fieldset-toggle' : ''}"><slot name="legend">${legendText}</slot></legend>
        <div part="content" class="mb-fieldset-content"><slot></slot></div>
      </fieldset>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected _afterRender(): void {
    if (!this.toggleable) return;

    const legendEl = this._qs<HTMLElement>('.mb-fieldset-legend');
    if (!legendEl) return;

    const handler = () => {
      this.collapsed = !this.collapsed;
      this._reflectToAttr('collapsed', this.collapsed, 'boolean');
      this.emit('mb-toggle', { collapsed: this.collapsed });
      this._scheduleRender();
    };

    legendEl.addEventListener('click', handler);
    this._addCleanup(() => legendEl.removeEventListener('click', handler));
  }
}
