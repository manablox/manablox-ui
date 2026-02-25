import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { MEGAMENU_STYLES } from './MegaMenu.styles.js';
import { createPortal, removePortal, removePortalsByOwner } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { uniqueId } from '../../utils/UniqueId.js';

type MegaOrientation = 'horizontal' | 'vertical';

export class MbMegaMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-megamenu';
  static readonly _componentStyles = MEGAMENU_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['orientation', 'string'],
      ['breakpoint', 'string'],
      ['aria-label', 'string'],
      ['aria-labelledby', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  orientation: MegaOrientation = 'horizontal';
  breakpoint = '960px';
  ariaLabel: string | null = null;
  ariaLabelledby: string | null = null;

  #openRootIndex = -1;
  #portalKey = uniqueId('mb-megamenu');
  #portalHost: HTMLElement | null = null;
  #positionCleanup: (() => void) | null = null;
  #docDown: ((event: MouseEvent) => void) | null = null;
  #docKey: ((event: KeyboardEvent) => void) | null = null;
  #mobileMode = false;
  #breakpointQuery: MediaQueryList | null = null;
  #breakpointHandler: ((event: MediaQueryListEvent) => void) | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.#bindBreakpoint();
    const onClick = (event: MouseEvent) => this.#onClick(event);
    const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);
    this.addEventListener('click', onClick);
    this.addEventListener('keydown', onKeydown);
    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
  }

  disconnectedCallback(): void {
    this.#closeOverlay();
    this.#unbindBreakpoint();
    removePortalsByOwner(this);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'breakpoint' && oldValue !== newValue) {
      this.#bindBreakpoint();
    }
  }

  protected _render(): string {
    const items = this.#visibleItems(this.model ?? []);
    const ariaLabel = this.ariaLabel ? ` aria-label="${this._escape(this.ariaLabel)}"` : '';
    const ariaLabelledby = this.ariaLabelledby ? ` aria-labelledby="${this._escape(this.ariaLabelledby)}"` : '';

    return `
      <nav class="mb-megamenu mb-component mb-megamenu-${this.orientation}${this.#mobileMode ? ' mb-megamenu-mobile-mode' : ''}" role="menubar" aria-orientation="${this.orientation}"${ariaLabel}${ariaLabelledby} style="--mb-megamenu-breakpoint:${this._escape(this.breakpoint || '960px')}">
        <ul class="mb-megamenu-root-list" role="menubar">
          ${items.map((item, index) => this.#renderRoot(item, index)).join('')}
        </ul>
      </nav>
    `;
  }

  #renderRoot(item: MenuItem, index: number): string {
    const hasSubmenu = !!item.items?.length;
    const active = this.#openRootIndex === index;
    return `
      <li class="mb-menuitem" role="none">
        <div class="mb-menuitem-content${active ? ' mb-active' : ''}" role="menuitem" tabindex="0" data-root-index="${index}" aria-haspopup="${hasSubmenu ? 'menu' : 'false'}" aria-expanded="${hasSubmenu ? String(active) : 'false'}" aria-disabled="${item.disabled ? 'true' : 'false'}">
          ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
          <span class="mb-menuitem-label">${this._escape(item.label)}</span>
          ${hasSubmenu ? '<span class="mb-menuitem-submenu-icon" aria-hidden="true">▾</span>' : ''}
        </div>
      </li>
    `;
  }

  #renderOverlay(rootItem: MenuItem): string {
    const rawColumns = rootItem.items ?? [];
    const columns = rawColumns.filter(entry => entry && typeof entry === 'object');

    return `
      <div class="mb-megamenu-overlay">
        <div class="mb-megamenu-submenu" role="menu">
          ${columns.map(column => {
            const columnItems = this.#visibleItems(Array.isArray(column.items) ? column.items : []);
            return `
              <section class="mb-megamenu-col">
                ${column.label ? `<h4 class="mb-megamenu-submenu-header">${this._escape(column.label)}</h4>` : ''}
                ${columnItems.map(item => this.#renderColumnItem(item)).join('')}
              </section>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  #renderColumnItem(item: MenuItem): string {
    return `
      <div class="mb-megamenu-item-content" role="menuitem" tabindex="-1" data-mega-item="${this._escape(item.key ?? item.label ?? '')}" aria-disabled="${item.disabled ? 'true' : 'false'}">
        ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
        <span class="mb-menuitem-label">${this._escape(item.label)}</span>
      </div>
    `;
  }

  #onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const root = target.closest<HTMLElement>('[data-root-index]');
    if (root) {
      const index = Number(root.dataset.rootIndex ?? '-1');
      if (index < 0) return;
      const item = this.#visibleItems(this.model ?? [])[index];
      if (!item || item.disabled) return;

      if (item.items?.length) {
        if (this.#openRootIndex === index) {
          this.#closeOverlay();
        } else {
          this.#openOverlay(index, root, event);
        }
      } else {
        this.#execute(item, event);
      }
      return;
    }

    if (this.#portalHost) {
      const panelItem = target.closest<HTMLElement>('[data-mega-item]');
      if (!panelItem) return;
      const key = panelItem.dataset.megaItem ?? '';
      const item = this.#resolveMegaItem(key);
      if (!item || item.disabled) return;
      this.#execute(item, event);
      this.#closeOverlay();
    }
  }

  #onKeydown(event: KeyboardEvent): void {
    const rootItems = Array.from(this.querySelectorAll<HTMLElement>('[data-root-index]'));
    if (!rootItems.length) return;
    const active = document.activeElement as HTMLElement | null;
    const current = active?.closest<HTMLElement>('[data-root-index]');

    if (current && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const currentIndex = Number(current.dataset.rootIndex ?? '0');
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = (currentIndex + direction + rootItems.length) % rootItems.length;
      rootItems[next]?.focus();
      return;
    }

    if (current && event.key === 'ArrowDown') {
      event.preventDefault();
      const index = Number(current.dataset.rootIndex ?? '-1');
      this.#openOverlay(index, current, event);
      requestAnimationFrame(() => {
        const first = this.#portalHost?.querySelector<HTMLElement>('[data-mega-item]');
        first?.focus();
      });
      return;
    }

    if (this.#portalHost && event.key === 'Escape') {
      event.preventDefault();
      this.#closeOverlay();
    }
  }

  #openOverlay(index: number, target: HTMLElement, event: Event): void {
    const item = this.#visibleItems(this.model ?? [])[index];
    if (!item?.items?.length) return;

    this.#openRootIndex = index;
    this._scheduleRender();
    if (!this.#portalHost) {
      this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
    }
    this.#portalHost.innerHTML = this.#renderOverlay(item);

    const overlay = this.#portalHost.querySelector<HTMLElement>('.mb-megamenu-overlay');
    if (!overlay) return;

    this.#positionCleanup?.();
    this.#positionCleanup = startAutoPosition(target, overlay, {
      placement: this.orientation === 'vertical' ? 'right-start' : 'bottom-start',
      offsetDistance: 4,
      autoUpdate: true,
    });

    if (!this.#docDown) {
      this.#docDown = (docEvent: MouseEvent) => {
        const source = docEvent.target as Node | null;
        if (!source) return;
        if (this.contains(source)) return;
        if (this.#portalHost?.contains(source)) return;
        this.#closeOverlay();
      };
      document.addEventListener('mousedown', this.#docDown, true);
    }

    if (!this.#docKey) {
      this.#docKey = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === 'Escape') this.#closeOverlay();
      };
      document.addEventListener('keydown', this.#docKey);
    }

    this.emit('mb-open', { item, originalEvent: event });
  }

  #closeOverlay(): void {
    this.#openRootIndex = -1;
    this.#positionCleanup?.();
    this.#positionCleanup = null;
    if (this.#docDown) {
      document.removeEventListener('mousedown', this.#docDown, true);
      this.#docDown = null;
    }
    if (this.#docKey) {
      document.removeEventListener('keydown', this.#docKey);
      this.#docKey = null;
    }
    if (this.#portalHost) {
      this.#portalHost.innerHTML = '';
      removePortal(this.#portalKey);
      this.#portalHost = null;
    }
    this._scheduleRender();
  }

  #bindBreakpoint(): void {
    this.#unbindBreakpoint();
    const value = this.breakpoint || '960px';
    this.#breakpointQuery = window.matchMedia(`(max-width: ${value})`);
    this.#mobileMode = this.#breakpointQuery.matches;
    this.#breakpointHandler = (event: MediaQueryListEvent) => {
      this.#mobileMode = event.matches;
      this._scheduleRender();
    };
    this.#breakpointQuery.addEventListener('change', this.#breakpointHandler);
  }

  #unbindBreakpoint(): void {
    if (this.#breakpointQuery && this.#breakpointHandler) {
      this.#breakpointQuery.removeEventListener('change', this.#breakpointHandler);
    }
    this.#breakpointQuery = null;
    this.#breakpointHandler = null;
  }

  #resolveMegaItem(key: string): MenuItem | null {
    const root = this.#visibleItems(this.model ?? [])[this.#openRootIndex];
    if (!root) return null;
    for (const column of root.items ?? []) {
      const items = this.#visibleItems(Array.isArray(column.items) ? column.items : []);
      const found = items.find(entry => (entry.key ?? entry.label ?? '') === key);
      if (found) return found;
    }
    return null;
  }

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }

  #execute(item: MenuItem, event: Event): void {
    if (typeof item.command === 'function') {
      item.command({ originalEvent: event, item });
    }
    if (item.url) {
      if (item.target) {
        window.open(item.url, item.target, 'noopener');
      } else {
        window.location.href = item.url;
      }
    }
    this.emit('mb-menu-select', { item, originalEvent: event });
  }
}

export const defineMegaMenu = createDefine('mb-megamenu', MbMegaMenu);
