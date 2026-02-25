import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { PANEL_STYLES } from './Panel.styles.js';

export class MbPanel extends MbBaseComponent {
  protected static readonly _componentName = 'mb-panel';
  protected static readonly _componentStyles = PANEL_STYLES;

  // internal private collapsed state
  #collapsed = false;

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();

    // initialize collapsed from attribute
    this.#collapsed = this._bool('collapsed');

    // attach event once to host for toggle buttons
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('.mb-panel-toggle-button') as HTMLElement | null;
      if (!btn) return;
      e.stopPropagation();
      this.#collapsed = !this.#collapsed;
      this.emit('mb-toggle', { collapsed: this.#collapsed });
      this._scheduleRender();
    };

    this.addEventListener('click', handler);
    this._addCleanup(() => this.removeEventListener('click', handler));
  }

  protected _render(): string {
    const headerAttr = this._escape(this.getAttribute('header'));
    const toggleable = this._bool('toggleable');
    const collapsedClass = this.#collapsed ? 'mb-panel-collapsed' : '';

    return this._html`
      <div class="mb-panel ${collapsedClass}">
        <div class="mb-panel-header">
          <div class="mb-panel-header-content">
            <slot name="icons"></slot>
            <slot name="header">${headerAttr}</slot>
          </div>
          ${toggleable ? `<button type="button" class="mb-panel-toggle-button" aria-expanded="${this.#collapsed ? 'false' : 'true'}">${this.#collapsed ? '+' : '−'}</button>` : ''}
        </div>
        <div class="mb-panel-content"><slot></slot></div>
        <div class="mb-panel-footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}
