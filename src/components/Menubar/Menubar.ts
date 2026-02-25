import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { MENUBAR_STYLES } from './Menubar.styles.js';
import { createPortal, removePortal, removePortalsByOwner } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { uniqueId } from '../../utils/UniqueId.js';

export class MbMenubar extends MbBaseComponent {
  static readonly _componentName = 'mb-menubar';
  static readonly _componentStyles = MENUBAR_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['breakpoint', 'string'],
      ['aria-label', 'string'],
      ['aria-labelledby', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  breakpoint = '960px';
  ariaLabel: string | null = null;
  ariaLabelledby: string | null = null;

  #openRootIndex = -1;
  #mobileActive = false;
  #portalKey = uniqueId('mb-menubar');
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
    const onMouseOver = (event: MouseEvent) => this.#onMouseOver(event);
    const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);

    this.addEventListener('click', onClick);
    this.addEventListener('mouseover', onMouseOver);
    this.addEventListener('keydown', onKeydown);

    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('mouseover', onMouseOver));
    this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
  }

  disconnectedCallback(): void {
    this.#closeAll();
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
      <nav class="mb-menubar mb-component${this.#mobileMode ? ' mb-menubar-mobile-mode' : ''}${this.#mobileActive ? ' mb-menubar-mobile-active' : ''}" role="menubar"${ariaLabel}${ariaLabelledby}>
        <button type="button" class="mb-menubar-button" aria-label="Toggle navigation" aria-expanded="${this.#mobileActive ? 'true' : 'false'}" data-mobile-toggle="true">☰</button>
        <ul class="mb-menubar-root-list" role="menubar" aria-orientation="horizontal" style="--mb-menubar-breakpoint:${this._escape(this.breakpoint || '960px')}">
          ${items.map((item, index) => this.#renderRootItem(item, index)).join('')}
        </ul>
      </nav>
    `;
  }

  #renderRootItem(item: MenuItem, index: number): string {
    const hasChildren = !!item.items?.some(entry => entry.visible !== false);
    const expanded = this.#openRootIndex === index;
    return `
      <li class="mb-menuitem" role="none">
        <div
          class="mb-menuitem-content${expanded ? ' mb-active' : ''}"
          role="menuitem"
          tabindex="0"
          aria-haspopup="${hasChildren ? 'menu' : 'false'}"
          aria-expanded="${hasChildren ? String(expanded) : 'false'}"
          aria-disabled="${item.disabled ? 'true' : 'false'}"
          data-root-index="${index}"
        >
          ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
          <span class="mb-menuitem-label">${this._escape(item.label)}</span>
          ${hasChildren ? '<span class="mb-menuitem-submenu-icon" aria-hidden="true">▾</span>' : ''}
        </div>
      </li>
    `;
  }

  #renderOverlay(rootItem: MenuItem): string {
    const children = this.#visibleItems(rootItem.items ?? []);
    return `
      <div class="mb-menubar-submenu-overlay">
        <ul class="mb-menubar-submenu" role="menu">
          ${children.map((item, index) => this.#renderSubItem(item, `r-${index}`)).join('')}
        </ul>
      </div>
    `;
  }

  #renderSubItem(item: MenuItem, key: string): string {
    const children = this.#visibleItems(item.items ?? []);
    const hasChildren = children.length > 0;

    return `
      <li class="mb-menubar-submenu-item" role="none" data-sub-key="${this._escape(key)}">
        <div class="mb-menuitem-content" role="menuitem" tabindex="-1" aria-haspopup="${hasChildren ? 'menu' : 'false'}" aria-expanded="false" aria-disabled="${item.disabled ? 'true' : 'false'}" data-item-key="${this._escape(key)}">
          ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
          <span class="mb-menuitem-label">${this._escape(item.label)}</span>
          ${hasChildren ? '<span class="mb-menuitem-submenu-icon" aria-hidden="true">▸</span>' : ''}
        </div>
        ${hasChildren ? `<ul class="mb-menubar-submenu" role="menu">${children.map((child, index) => this.#renderSubItem(child, `${key}-${index}`)).join('')}</ul>` : ''}
      </li>
    `;
  }

  #onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('[data-mobile-toggle="true"]') && this.#mobileMode) {
      this.#mobileActive = !this.#mobileActive;
      this._scheduleRender();
      return;
    }

    const root = target.closest<HTMLElement>('[data-root-index]');
    if (root) {
      const index = Number(root.dataset.rootIndex ?? '-1');
      if (index < 0) return;
      const item = this.#visibleItems(this.model ?? [])[index];
      if (!item || item.disabled) return;

      if (item.items?.length) {
        if (this.#openRootIndex === index) {
          this.#closeAll();
        } else {
          this.#openRoot(index, root, event);
        }
      } else {
        this.#execute(item, event);
        this.#closeAll();
      }
      return;
    }

    if (this.#portalHost) {
      const menuItem = target.closest<HTMLElement>('[data-item-key]');
      if (!menuItem) return;
      const key = menuItem.dataset.itemKey;
      if (!key) return;
      const item = this.#resolveSubItemByKey(key);
      if (!item || item.disabled) return;

      if (item.items?.some(entry => entry.visible !== false)) {
        const container = menuItem.closest<HTMLElement>('[data-sub-key]');
        container?.classList.toggle('mb-open');
        const expanded = container?.classList.contains('mb-open') ? 'true' : 'false';
        menuItem.setAttribute('aria-expanded', expanded ?? 'false');
        return;
      }

      this.#execute(item, event);
      this.#closeAll();
    }
  }

  #onMouseOver(event: MouseEvent): void {
    if (this.#mobileActive || this.#mobileMode) return;
    const target = event.target as HTMLElement | null;
    const root = target?.closest<HTMLElement>('[data-root-index]');
    if (!root) return;
    const index = Number(root.dataset.rootIndex ?? '-1');
    if (index < 0 || this.#openRootIndex < 0 || this.#openRootIndex === index) return;
    const item = this.#visibleItems(this.model ?? [])[index];
    if (item?.items?.length) {
      this.#openRoot(index, root, event);
    }
  }

  #onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const rootItems = Array.from(this.querySelectorAll<HTMLElement>('[data-root-index]'));
    if (rootItems.length === 0) return;
    const currentRoot = target.closest<HTMLElement>('[data-root-index]');

    if (currentRoot && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const currentIndex = Number(currentRoot.dataset.rootIndex ?? '0');
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = (currentIndex + direction + rootItems.length) % rootItems.length;
      rootItems[next]?.focus();
      return;
    }

    if (currentRoot && event.key === 'ArrowDown') {
      event.preventDefault();
      const index = Number(currentRoot.dataset.rootIndex ?? '-1');
      const item = this.#visibleItems(this.model ?? [])[index];
      if (item?.items?.length) {
        this.#openRoot(index, currentRoot, event);
        requestAnimationFrame(() => {
          const first = this.#portalHost?.querySelector<HTMLElement>('[data-item-key]');
          first?.focus();
        });
      }
      return;
    }

    if (this.#portalHost && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      const entries = Array.from(this.#portalHost.querySelectorAll<HTMLElement>('[data-item-key]'));
      if (!entries.length) return;
      const currentIndex = entries.findIndex(entry => entry === target.closest('[data-item-key]'));
      if (currentIndex < 0) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = (currentIndex + direction + entries.length) % entries.length;
      entries[next]?.focus();
      return;
    }

    if (this.#portalHost && event.key === 'Escape') {
      event.preventDefault();
      this.#closeAll();
    }
  }

  #openRoot(index: number, target: HTMLElement, event: Event): void {
    const item = this.#visibleItems(this.model ?? [])[index];
    if (!item || !item.items?.length) return;

    this.#openRootIndex = index;
    this._scheduleRender();

    if (!this.#portalHost) {
      this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
    }

    this.#portalHost.innerHTML = this.#renderOverlay(item);
    const overlay = this.#portalHost.querySelector<HTMLElement>('.mb-menubar-submenu-overlay');
    if (!overlay) return;

    this.#positionCleanup?.();
    this.#positionCleanup = startAutoPosition(target, overlay, {
      placement: 'bottom-start',
      offsetDistance: 4,
      autoUpdate: true,
    });

    if (!this.#docDown) {
      this.#docDown = (docEvent: MouseEvent) => {
        const source = docEvent.target as Node | null;
        if (!source) return;
        if (this.contains(source)) return;
        if (this.#portalHost?.contains(source)) return;
        this.#closeAll();
      };
      document.addEventListener('mousedown', this.#docDown, true);
      this._addCleanup(() => this.#docDown && document.removeEventListener('mousedown', this.#docDown, true));
    }

    if (!this.#docKey) {
      this.#docKey = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === 'Escape') {
          this.#closeAll();
        }
      };
      document.addEventListener('keydown', this.#docKey);
      this._addCleanup(() => this.#docKey && document.removeEventListener('keydown', this.#docKey));
    }

    this.emit('mb-open', { item, originalEvent: event });
  }

  #closeAll(): void {
    this.#openRootIndex = -1;
    this.#mobileActive = false;
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
    }
    removePortal(this.#portalKey);
    this.#portalHost = null;
    this._scheduleRender();
  }

  #bindBreakpoint(): void {
    this.#unbindBreakpoint();
    const value = this.breakpoint || '960px';
    this.#breakpointQuery = window.matchMedia(`(max-width: ${value})`);
    this.#mobileMode = this.#breakpointQuery.matches;
    this.#breakpointHandler = (event: MediaQueryListEvent) => {
      this.#mobileMode = event.matches;
      if (!this.#mobileMode) {
        this.#mobileActive = false;
      }
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

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }

  #resolveSubItemByKey(key: string): MenuItem | null {
    const root = this.#visibleItems(this.model ?? [])[this.#openRootIndex];
    if (!root) return null;
    const chunks = key.split('-').slice(1).map(chunk => Number(chunk));
    let current: MenuItem | null = null;
    let list = this.#visibleItems(root.items ?? []);

    for (const index of chunks) {
      current = list[index] ?? null;
      if (!current) return null;
      list = this.#visibleItems(current.items ?? []);
    }

    return current;
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

export const defineMenubar = createDefine('mb-menubar', MbMenubar);
