import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { MenuItem } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { MENU_STYLES } from './Menu.styles.js';
import { createPortal, removePortalsByOwner } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { uniqueId } from '../../utils/UniqueId.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

interface MenuActionItem {
  key: string;
  item: MenuItem;
}

export class MbMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-menu';
  static readonly _componentStyles = MENU_STYLES;

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

  #focusedIndex = -1;
  #isVisible = false;
  #portalKey = uniqueId('mb-menu-portal');
  #portalHost: HTMLElement | null = null;
  #targetEl: HTMLElement | null = null;
  #cleanupAutoPosition: (() => void) | null = null;
  #documentClickHandler: ((e: MouseEvent) => void) | null = null;
  #documentKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  #expandedGroups = new Set<string>();

  connectedCallback(): void {
    super.connectedCallback();

    const onHostClick = (e: MouseEvent) => this.#handleClick(e);
    const onHostKeyDown = (e: KeyboardEvent) => this.#handleKeyDown(e);

    this.addEventListener('click', onHostClick);
    this.addEventListener('keydown', onHostKeyDown);

    this._addCleanup(() => this.removeEventListener('click', onHostClick));
    this._addCleanup(() => this.removeEventListener('keydown', onHostKeyDown));
  }

  disconnectedCallback(): void {
    this.hide();
    removePortalsByOwner(this);
    super.disconnectedCallback();
  }

  toggle(event: Event): void {
    if (this.#isVisible) {
      this.hide();
      return;
    }
    const target = (event.currentTarget as HTMLElement | null) ?? (event.target as HTMLElement | null) ?? this;
    this.show(event, target);
  }

  show(event?: Event, target?: HTMLElement | null): void {
    if (!this.popup || this.#isVisible) return;

    const before = this.emit('mb-before-show', { originalEvent: event ?? null, target: target ?? null }, { cancelable: true });
    if (!before) return;

    this.#isVisible = true;
    this.#targetEl = target ?? this;
    this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
    if (this.baseZIndex != null) {
      this.#portalHost.style.zIndex = String(this.baseZIndex + 1);
    }

    this.#renderPopup();
    this.#bindGlobalOverlayHandlers();

    this.emit('mb-show', { originalEvent: event ?? null, target: this.#targetEl });
  }

  hide(): void {
    if (!this.popup || !this.#isVisible) return;

    const before = this.emit('mb-before-hide', undefined, { cancelable: true });
    if (!before) return;

    this.#isVisible = false;
    this.#focusedIndex = -1;
    this.#teardownOverlayHandlers();
    if (this.#portalHost) {
      this.#portalHost.innerHTML = '';
      this.#portalHost.remove();
      this.#portalHost = null;
    }
    this.emit('mb-hide');
  }

  protected _render(): string {
    if (this.popup) {
      return '';
    }

    return this.#renderMenuMarkup(false);
  }

  protected _afterRender(): void {
    if (!this.popup) {
      this.#syncFocusable();
    }
  }

  #renderPopup(): void {
    if (!this.#portalHost) return;

    this.#portalHost.innerHTML = `<div class="mb-menu-overlay">${this.#renderMenuMarkup(true)}</div>`;

    const overlay = this.#portalHost.querySelector<HTMLElement>('.mb-menu-overlay');
    const menu = this.#portalHost.querySelector<HTMLElement>('.mb-menu');

    if (!overlay || !menu || !this.#targetEl) return;

    this.#cleanupAutoPosition?.();
    this.#cleanupAutoPosition = startAutoPosition(this.#targetEl, overlay, {
      placement: 'bottom-start',
      offsetDistance: 4,
      autoUpdate: true,
    });

    this.#syncFocusable();
  }

  #renderMenuMarkup(isPopup: boolean): string {
    const items = this.#visibleItems(this.model ?? []);
    const ariaLabel = this.ariaLabel ? ` aria-label="${this._escape(this.ariaLabel)}"` : '';
    const ariaLabelledby = this.ariaLabelledby ? ` aria-labelledby="${this._escape(this.ariaLabelledby)}"` : '';

    return `
      <nav class="mb-menu mb-component" role="menu"${ariaLabel}${ariaLabelledby}>
        <ul class="mb-menu-list" role="none">
          ${items.map((item, index) => this.#renderItem(item, String(index), isPopup)).join('')}
        </ul>
      </nav>
    `;
  }

  #renderItem(item: MenuItem, key: string, isPopup: boolean): string {
    if (item.separator) {
      return '<li class="mb-menuitem-separator" role="separator"><hr /></li>';
    }

    if (item.items && item.items.length > 0) {
      const expanded = !this.#expandedGroups.has(key);
      const children = this.#visibleItems(item.items);

      return `
        <li class="mb-menuitem mb-menu-group ${expanded ? '' : 'mb-collapsed'}" role="none" data-group-key="${this._escape(key)}">
          <button type="button" class="mb-submenu-header" data-group-toggle="${this._escape(key)}" aria-expanded="${expanded ? 'true' : 'false'}">
            ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
            <span class="mb-menuitem-label">${this._escape(item.label)}</span>
          </button>
          <ul class="mb-menu-submenu-list" role="none">
            ${children.map((child, childIndex) => this.#renderActionItem(child, `${key}-${childIndex}`, isPopup)).join('')}
          </ul>
        </li>
      `;
    }

    return this.#renderActionItem(item, key, isPopup);
  }

  #renderActionItem(item: MenuItem, key: string, isPopup: boolean): string {
    const disabled = !!item.disabled;
    const focused = this.#getActionItems()[this.#focusedIndex]?.key === key;
    const classes = [
      'mb-menuitem-content',
      disabled ? 'mb-menuitem-disabled' : '',
      focused ? 'mb-menuitem-active' : '',
    ].filter(Boolean).join(' ');
    const badge = item.badge ? `<span class="mb-menuitem-badge">${this._escape(item.badge)}</span>` : '';
    const href = item.url && !disabled ? this._escape(item.url) : '';
    const tabIndex = focused ? '0' : '-1';

    const inner = `
      ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : ''}
      <span class="mb-menuitem-label">${this._escape(item.label)}</span>
      ${badge}
    `;

    return `
      <li class="mb-menuitem" role="none">
        <div
          class="${classes}"
          role="menuitem"
          tabindex="${tabIndex}"
          aria-disabled="${disabled ? 'true' : 'false'}"
          data-menu-key="${this._escape(key)}"
          data-popup-item="${isPopup ? 'true' : 'false'}"
        >
          ${href ? `<a class="mb-menuitem-link" href="${href}">${inner}</a>` : `<span class="mb-menuitem-link">${inner}</span>`}
        </div>
      </li>
    `;
  }

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }

  #getActionItems(): MenuActionItem[] {
    const result: MenuActionItem[] = [];
    const items = this.#visibleItems(this.model ?? []);

    items.forEach((item, index) => {
      const key = String(index);
      if (item.separator) return;
      if (item.items?.length) {
        this.#visibleItems(item.items).forEach((child, childIndex) => {
          result.push({ key: `${key}-${childIndex}`, item: child });
        });
        return;
      }
      result.push({ key, item });
    });

    return result;
  }

  #getRootNodeForEvents(): ParentNode {
    if (this.popup && this.#portalHost) {
      return this.#portalHost;
    }
    return this;
  }

  #syncFocusable(): void {
    const root = this.#getRootNodeForEvents();
    const elements = Array.from(root.querySelectorAll<HTMLElement>('.mb-menuitem-content'));
    if (elements.length === 0) {
      this.#focusedIndex = -1;
      return;
    }

    if (this.#focusedIndex < 0 || this.#focusedIndex >= elements.length) {
      this.#focusedIndex = elements.findIndex(el => el.getAttribute('aria-disabled') !== 'true');
      if (this.#focusedIndex < 0) this.#focusedIndex = 0;
    }

    elements.forEach((el, index) => {
      el.setAttribute('tabindex', index === this.#focusedIndex ? '0' : '-1');
      el.classList.toggle('mb-menuitem-active', index === this.#focusedIndex);
    });

    if (this.popup) {
      elements[this.#focusedIndex]?.focus();
    }
  }

  #handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const groupToggle = target.closest<HTMLElement>('[data-group-toggle]');
    if (groupToggle) {
      const key = groupToggle.getAttribute('data-group-toggle');
      if (!key) return;
      if (this.#expandedGroups.has(key)) {
        this.#expandedGroups.delete(key);
      } else {
        this.#expandedGroups.add(key);
      }
      if (this.popup) {
        this.#renderPopup();
      } else {
        this._scheduleRender();
      }
      return;
    }

    const content = target.closest<HTMLElement>('.mb-menuitem-content[data-menu-key]');
    if (!content) return;

    const key = content.getAttribute('data-menu-key');
    if (!key) return;

    const actionItems = this.#getActionItems();
    const actionIndex = actionItems.findIndex(entry => entry.key === key);
    if (actionIndex < 0) return;

    const item = actionItems[actionIndex]?.item;
    if (!item || item.disabled) {
      event.preventDefault();
      return;
    }

    this.#focusedIndex = actionIndex;
    this.#syncFocusable();

    if (typeof item.command === 'function') {
      item.command({ originalEvent: event, item });
    }

    if (this.popup) {
      this.hide();
    }
  }

  #handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(key)) return;

    const root = this.#getRootNodeForEvents();
    const actionEls = Array.from(root.querySelectorAll<HTMLElement>('.mb-menuitem-content'));
    if (actionEls.length === 0) return;

    if (key === 'Escape') {
      if (this.popup) {
        event.preventDefault();
        this.hide();
      }
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const direction = key === 'ArrowDown' ? 1 : -1;
      let next = this.#focusedIndex;

      for (let i = 0; i < actionEls.length; i += 1) {
        next = (next + direction + actionEls.length) % actionEls.length;
        if (actionEls[next]?.getAttribute('aria-disabled') !== 'true') {
          this.#focusedIndex = next;
          this.#syncFocusable();
          break;
        }
      }
      return;
    }

    if (key === 'Enter') {
      event.preventDefault();
      actionEls[this.#focusedIndex]?.click();
    }
  }

  #bindGlobalOverlayHandlers(): void {
    if (!this.#portalHost) return;

    const onPortalClick = (e: MouseEvent) => this.#handleClick(e);
    const onPortalKey = (e: KeyboardEvent) => this.#handleKeyDown(e);
    this.#portalHost.addEventListener('click', onPortalClick);
    this.#portalHost.addEventListener('keydown', onPortalKey);

    this.#documentClickHandler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (this.contains(target)) return;
      if (this.#portalHost?.contains(target)) return;
      this.hide();
    };

    this.#documentKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };

    document.addEventListener('mousedown', this.#documentClickHandler);
    document.addEventListener('keydown', this.#documentKeyHandler);

    this._addCleanup(() => this.#portalHost?.removeEventListener('click', onPortalClick));
    this._addCleanup(() => this.#portalHost?.removeEventListener('keydown', onPortalKey));
  }

  #teardownOverlayHandlers(): void {
    this.#cleanupAutoPosition?.();
    this.#cleanupAutoPosition = null;

    if (this.#documentClickHandler) {
      document.removeEventListener('mousedown', this.#documentClickHandler);
      this.#documentClickHandler = null;
    }
    if (this.#documentKeyHandler) {
      document.removeEventListener('keydown', this.#documentKeyHandler);
      this.#documentKeyHandler = null;
    }
  }
}

export const defineMenu = createDefine('mb-menu', MbMenu);
