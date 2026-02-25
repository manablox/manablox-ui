import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { TIEREDMENU_STYLES } from './TieredMenu.styles.js';
import { createPortal, removePortal, removePortalsByOwner } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { uniqueId } from '../../utils/UniqueId.js';

export class MbTieredMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-tieredmenu';
  static readonly _componentStyles = TIEREDMENU_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['popup', 'boolean'],
      ['base-z-index', 'number'],
      ['append-to', 'string'],
      ['aria-label', 'string'],
      ['aria-labelledby', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  popup = false;
  baseZIndex: number | null = null;
  appendTo = 'body';
  ariaLabel: string | null = null;
  ariaLabelledby: string | null = null;

  #isVisible = false;
  #portalKey = uniqueId('mb-tieredmenu');
  #portalHost: HTMLElement | null = null;
  #targetEl: HTMLElement | null = null;
  #positionCleanup: (() => void) | null = null;
  #docDown: ((event: MouseEvent) => void) | null = null;
  #docKey: ((event: KeyboardEvent) => void) | null = null;

  connectedCallback(): void {
    super.connectedCallback();
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
    this.hide();
    removePortalsByOwner(this);
    super.disconnectedCallback();
  }

  toggle(event: Event): void {
    if (this.#isVisible) {
      this.hide();
    } else {
      const target = (event.currentTarget as HTMLElement | null) ?? (event.target as HTMLElement | null) ?? this;
      this.show(event, target);
    }
  }

  show(event?: Event, target?: HTMLElement | null): void {
    if (!this.popup || this.#isVisible) return;
    this.#isVisible = true;
    this.#targetEl = target ?? this;
    this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
    if (this.baseZIndex != null && this.#portalHost) {
      this.#portalHost.style.zIndex = String(this.baseZIndex + 1);
    }
    this.#renderPopup();
    this.#bindDocumentHandlers();
    this.emit('mb-show', { originalEvent: event ?? null, target: this.#targetEl });
  }

  hide(): void {
    if (!this.popup || !this.#isVisible) return;
    this.#isVisible = false;
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
    this.emit('mb-hide');
  }

  protected _render(): string {
    if (this.popup) return '';
    return this.#renderMarkup(false);
  }

  #renderPopup(): void {
    if (!this.#portalHost) return;
    this.#portalHost.innerHTML = this.#renderMarkup(true);

    const overlay = this.#portalHost.querySelector<HTMLElement>('.mb-tieredmenu-overlay');
    if (!overlay || !this.#targetEl) return;

    this.#positionCleanup?.();
    this.#positionCleanup = startAutoPosition(this.#targetEl, overlay, {
      placement: 'bottom-start',
      offsetDistance: 4,
      autoUpdate: true,
    });
  }

  #renderMarkup(isPopup: boolean): string {
    const items = this.#visibleItems(this.model ?? []);
    const ariaLabel = this.ariaLabel ? ` aria-label="${this._escape(this.ariaLabel)}"` : '';
    const ariaLabelledby = this.ariaLabelledby ? ` aria-labelledby="${this._escape(this.ariaLabelledby)}"` : '';

    return `
      <div class="${isPopup ? 'mb-tieredmenu-overlay' : ''}">
        <nav class="mb-tieredmenu mb-component" role="menubar" aria-orientation="vertical"${ariaLabel}${ariaLabelledby}>
          <ul class="mb-tieredmenu-root-list" role="menu">
            ${items.map((item, index) => this.#renderItem(item, String(index))).join('')}
          </ul>
        </nav>
      </div>
    `;
  }

  #renderItem(item: MenuItem, key: string): string {
    const children = this.#visibleItems(item.items ?? []);
    const hasChildren = children.length > 0;

    return `
      <li class="mb-tieredmenu-item" role="none" data-item-container="${this._escape(key)}">
        <div class="mb-tieredmenu-item-content" role="menuitem" tabindex="-1" aria-haspopup="${hasChildren ? 'menu' : 'false'}" aria-expanded="false" aria-disabled="${item.disabled ? 'true' : 'false'}" data-item-key="${this._escape(key)}">
          ${item.icon ? `<span class="mb-tieredmenu-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
          <span class="mb-tieredmenu-item-label">${this._escape(item.label)}</span>
          ${hasChildren ? '<span class="mb-tieredmenu-icon" aria-hidden="true">▸</span>' : ''}
        </div>
        ${hasChildren ? `<ul class="mb-tieredmenu-submenu" role="menu">${children.map((child, childIndex) => this.#renderItem(child, `${key}-${childIndex}`)).join('')}</ul>` : ''}
      </li>
    `;
  }

  #onMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const content = target?.closest<HTMLElement>('[data-item-key]');
    if (!content) return;
    const container = content.closest<HTMLElement>('[data-item-container]');
    const hasSub = !!container?.querySelector(':scope > .mb-tieredmenu-submenu');
    if (!hasSub) return;
    this.#openContainer(container ?? null);
  }

  #onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const content = target?.closest<HTMLElement>('[data-item-key]');
    if (!content) return;
    const key = content.dataset.itemKey;
    if (!key) return;
    const item = this.#resolveItemByKey(key);
    if (!item || item.disabled) return;

    if (item.items?.some(entry => entry.visible !== false)) {
      const container = content.closest<HTMLElement>('[data-item-container]');
      this.#openContainer(container ?? null);
      return;
    }

    this.#execute(item, event);
    if (this.popup) this.hide();
  }

  #onKeydown(event: KeyboardEvent): void {
    const root = this.popup ? this.#portalHost : this;
    if (!root) return;
    const entries = Array.from(root.querySelectorAll<HTMLElement>('[data-item-key]'));
    if (!entries.length) return;

    const active = document.activeElement as HTMLElement | null;
    let index = entries.findIndex(entry => entry === active);
    if (index < 0) index = 0;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = (index + direction + entries.length) % entries.length;
      entries[next]?.focus();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const container = entries[index]?.closest<HTMLElement>('[data-item-container]');
      this.#openContainer(container ?? null);
      const firstChild = container?.querySelector<HTMLElement>(':scope > .mb-tieredmenu-submenu [data-item-key]');
      firstChild?.focus();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const parent = entries[index]?.closest<HTMLElement>('.mb-tieredmenu-submenu')?.closest<HTMLElement>('[data-item-container]');
      if (parent) {
        parent.classList.remove('mb-open');
        const parentItem = parent.querySelector<HTMLElement>(':scope > [data-item-key]');
        parentItem?.setAttribute('aria-expanded', 'false');
        parentItem?.focus();
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      entries[index]?.click();
      return;
    }

    if (event.key === 'Escape' && this.popup) {
      event.preventDefault();
      this.hide();
    }
  }

  #openContainer(container: HTMLElement | null): void {
    if (!container) return;
    const siblings = Array.from(container.parentElement?.children ?? []);
    siblings.forEach(el => {
      if (el instanceof HTMLElement && el !== container) {
        el.classList.remove('mb-open');
        const content = el.querySelector<HTMLElement>(':scope > [data-item-key]');
        content?.setAttribute('aria-expanded', 'false');
      }
    });
    container.classList.add('mb-open');
    const ownContent = container.querySelector<HTMLElement>(':scope > [data-item-key]');
    ownContent?.setAttribute('aria-expanded', 'true');
  }

  #bindDocumentHandlers(): void {
    this.#docDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (this.contains(target)) return;
      if (this.#portalHost?.contains(target)) return;
      this.hide();
    };
    this.#docKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.hide();
    };

    document.addEventListener('mousedown', this.#docDown, true);
    document.addEventListener('keydown', this.#docKey);
  }

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }

  #resolveItemByKey(key: string): MenuItem | null {
    const chunks = key.split('-').map(part => Number(part));
    let list = this.#visibleItems(this.model ?? []);
    let current: MenuItem | null = null;
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

export const defineTieredMenu = createDefine('mb-tieredmenu', MbTieredMenu);
