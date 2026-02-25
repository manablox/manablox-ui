import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { CONTEXTMENU_STYLES } from './ContextMenu.styles.js';
import { createPortal, removePortal, removePortalsByOwner } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { uniqueId } from '../../utils/UniqueId.js';

export class MbContextMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-contextmenu';
  static readonly _componentStyles = CONTEXTMENU_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['global', 'boolean'],
      ['target', 'string'],
      ['base-z-index', 'number'],
      ['append-to', 'string'],
      ['aria-label', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  global = false;
  target: string | null = null;
  baseZIndex: number | null = null;
  appendTo = 'body';
  ariaLabel: string | null = null;

  #isVisible = false;
  #portalKey = uniqueId('mb-contextmenu');
  #portalHost: HTMLElement | null = null;
  #positionCleanup: (() => void) | null = null;
  #anchorEl: HTMLElement | null = null;
  #docDown: ((event: MouseEvent) => void) | null = null;
  #docKey: ((event: KeyboardEvent) => void) | null = null;
  #boundTargets = new Map<EventTarget, (event: Event) => void>();

  connectedCallback(): void {
    super.connectedCallback();
    this.#bindContextTargets();
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
    this.#unbindContextTargets();
    removePortalsByOwner(this);
    super.disconnectedCallback();
  }

  show(event: MouseEvent): void {
    event.preventDefault();
    this.hide();

    this.#isVisible = true;
    this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
    if (this.baseZIndex != null && this.#portalHost) {
      this.#portalHost.style.zIndex = String(this.baseZIndex + 1);
    }

    this.#portalHost.innerHTML = this.#renderMarkup();
    const overlay = this.#portalHost.querySelector<HTMLElement>('.mb-contextmenu-overlay');
    if (!overlay) return;

    this.#anchorEl = document.createElement('span');
    this.#anchorEl.style.cssText = `position:fixed;left:${event.clientX}px;top:${event.clientY}px;width:1px;height:1px;pointer-events:none;`;
    document.body.appendChild(this.#anchorEl);

    this.#positionCleanup = startAutoPosition(this.#anchorEl, overlay, {
      placement: 'right-start',
      offsetDistance: 0,
      autoUpdate: true,
    });

    this.#bindDocumentHandlers();
    const first = this.#portalHost.querySelector<HTMLElement>('[data-item-key]');
    first?.focus();
    this.emit('mb-show', { originalEvent: event });
  }

  hide(): void {
    if (!this.#isVisible) return;
    this.#isVisible = false;
    this.#positionCleanup?.();
    this.#positionCleanup = null;
    if (this.#anchorEl) {
      this.#anchorEl.remove();
      this.#anchorEl = null;
    }
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
    return '';
  }

  #renderMarkup(): string {
    const ariaLabel = this.ariaLabel ? ` aria-label="${this._escape(this.ariaLabel)}"` : '';
    return `
      <div class="mb-contextmenu-overlay">
        <nav class="mb-contextmenu mb-component" role="menubar" aria-orientation="vertical"${ariaLabel}>
          <ul class="mb-contextmenu-root-list" role="menu">
            ${this.#visibleItems(this.model ?? []).map((item, index) => this.#renderItem(item, String(index))).join('')}
          </ul>
        </nav>
      </div>
    `;
  }

  #renderItem(item: MenuItem, key: string): string {
    const children = this.#visibleItems(item.items ?? []);
    const hasChildren = children.length > 0;
    return `
      <li class="mb-contextmenu-item" role="none" data-item-container="${this._escape(key)}">
        <div class="mb-contextmenu-item-content" role="menuitem" tabindex="-1" aria-haspopup="${hasChildren ? 'menu' : 'false'}" aria-expanded="false" aria-disabled="${item.disabled ? 'true' : 'false'}" data-item-key="${this._escape(key)}">
          ${item.icon ? `<span class="mb-contextmenu-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
          <span class="mb-contextmenu-item-label">${this._escape(item.label)}</span>
          ${hasChildren ? '<span class="mb-contextmenu-icon" aria-hidden="true">▸</span>' : ''}
        </div>
        ${hasChildren ? `<ul class="mb-contextmenu-submenu" role="menu">${children.map((child, childIndex) => this.#renderItem(child, `${key}-${childIndex}`)).join('')}</ul>` : ''}
      </li>
    `;
  }

  #bindContextTargets(): void {
    this.#unbindContextTargets();

    const handler = (event: Event) => {
      if (event instanceof MouseEvent) {
        this.show(event);
      }
    };

    if (this.global) {
      document.addEventListener('contextmenu', handler);
      this.#boundTargets.set(document, handler);
      this._addCleanup(() => document.removeEventListener('contextmenu', handler));
    }

    const selector = this._str('target');
    if (selector) {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('contextmenu', handler);
        this.#boundTargets.set(el, handler);
        this._addCleanup(() => el.removeEventListener('contextmenu', handler));
      });
    }
  }

  #unbindContextTargets(): void {
    for (const [target, handler] of this.#boundTargets) {
      target.removeEventListener('contextmenu', handler as EventListener);
    }
    this.#boundTargets.clear();
  }

  #bindDocumentHandlers(): void {
    this.#docDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (this.#portalHost?.contains(target)) return;
      this.hide();
    };
    this.#docKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('mousedown', this.#docDown, true);
    document.addEventListener('keydown', this.#docKey);
  }

  #onMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const content = target?.closest<HTMLElement>('[data-item-key]');
    if (!content) return;
    const container = content.closest<HTMLElement>('[data-item-container]');
    const hasSub = !!container?.querySelector(':scope > .mb-contextmenu-submenu');
    if (!hasSub) return;
    this.#openContainer(container ?? null);
  }

  #onClick(event: MouseEvent): void {
    if (!this.#portalHost) return;
    const target = event.target as HTMLElement | null;
    const content = target?.closest<HTMLElement>('[data-item-key]');
    if (!content) return;
    const key = content.dataset.itemKey;
    if (!key) return;
    const item = this.#resolveItemByKey(key);
    if (!item || item.disabled) return;
    if (item.items?.some(entry => entry.visible !== false)) {
      this.#openContainer(content.closest<HTMLElement>('[data-item-container]'));
      return;
    }
    this.#execute(item, event);
    this.hide();
  }

  #onKeydown(event: KeyboardEvent): void {
    if (!this.#portalHost) return;
    const entries = Array.from(this.#portalHost.querySelectorAll<HTMLElement>('[data-item-key]'));
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
      const firstChild = container?.querySelector<HTMLElement>(':scope > .mb-contextmenu-submenu [data-item-key]');
      firstChild?.focus();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const parent = entries[index]?.closest<HTMLElement>('.mb-contextmenu-submenu')?.closest<HTMLElement>('[data-item-container]');
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

    if (event.key === 'Escape') {
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
    const own = container.querySelector<HTMLElement>(':scope > [data-item-key]');
    own?.setAttribute('aria-expanded', 'true');
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

export const defineContextMenu = createDefine('mb-contextmenu', MbContextMenu);
