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
      <div part="root" class="mb-panel ${collapsedClass}">
        <div part="header" class="mb-panel-header">
          <div part="header-content" class="mb-panel-header-content">
            <slot name="icons" part="icons"></slot>
            <slot name="header" part="header-slot">${headerAttr}</slot>
          </div>
          ${toggleable ? `<button part="toggle-button" type="button" class="mb-panel-toggle-button" aria-expanded="${this.#collapsed ? 'false' : 'true'}">${this.#collapsed ? '+' : '−'}</button>` : ''}
        </div>
        <div part="content" class="mb-panel-content"><slot part="content-slot"></slot></div>
        <div part="footer" class="mb-panel-footer"><slot name="footer" part="footer-slot"></slot></div>
      </div>
    `;
  }
}
