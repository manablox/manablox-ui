import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { PANELMENU_STYLES } from './PanelMenu.styles.js';

export class MbPanelMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-panelmenu';
  static readonly _componentStyles = PANELMENU_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['value', 'object'],
      ['multiple', 'boolean'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  value: string[] | null = null;
  multiple = false;

  #expandedPanels = new Set<string>();
  #expandedItems = new Set<string>();

  connectedCallback(): void {
    super.connectedCallback();
    this.#syncExpandedFromAttr();
    const onClick = (event: MouseEvent) => this.#onClick(event);
    const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);
    this.addEventListener('click', onClick);
    this.addEventListener('keydown', onKeydown);
    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'value' && oldValue !== newValue) {
      this.#syncExpandedFromAttr();
    }
  }

  protected _render(): string {
    const panels = this.#visibleItems(this.model ?? []);
    return `
      <div class="mb-panelmenu mb-component" part="root" role="tree">
        ${panels.map((item, index) => this.#renderPanel(item, index)).join('')}
      </div>
    `;
  }

  #renderPanel(item: MenuItem, index: number): string {
    const key = item.key ?? String(index);
    const open = this.#expandedPanels.has(key) || item.expanded;
    const panelClass = `mb-panelmenu-panel${open ? ' mb-open' : ''}`;
    return `
      <section class="${panelClass}" part="panel" data-panel-key="${this._escape(key)}">
        <h3 class="mb-panelmenu-header" part="panel-header">
          <button type="button" class="mb-panelmenu-header-content" part="panel-toggle" data-panel-toggle="${this._escape(key)}" aria-expanded="${open ? 'true' : 'false'}">
            <span class="mb-panelmenu-header-action" part="panel-header-action">
              <span class="mb-panelmenu-header-icon" part="panel-header-icon" aria-hidden="true">▸</span>
              ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" part="item-icon" aria-hidden="true"></span>` : ''}
              <span class="mb-panelmenu-header-label" part="panel-header-label">${this._escape(item.label)}</span>
            </span>
          </button>
        </h3>
        <div class="mb-panelmenu-content" part="panel-content" role="region">
          <ul class="mb-panelmenu-root-list" part="list" role="group">
            ${this.#visibleItems(item.items ?? []).map((child, childIndex) => this.#renderItem(child, `${key}-${childIndex}`)).join('')}
          </ul>
        </div>
      </section>
    `;
  }

  #renderItem(item: MenuItem, key: string): string {
    const children = this.#visibleItems(item.items ?? []);
    const hasChildren = children.length > 0;
    const open = this.#expandedItems.has(key);
    return `
      <li class="mb-menuitem${open ? ' mb-open' : ''}" part="item" role="treeitem" aria-expanded="${hasChildren ? String(open) : 'false'}" data-item-container="${this._escape(key)}">
        <div class="mb-menuitem-content" part="item-content" tabindex="-1" data-item-key="${this._escape(key)}" aria-disabled="${item.disabled ? 'true' : 'false'}">
          ${item.icon ? `<span class="mb-menuitem-icon ${this._escape(item.icon)}" part="item-icon" aria-hidden="true"></span>` : ''}
          ${item.url ? `<a href="${this._escape(item.url)}" target="${this._escape(item.target ?? '')}" class="mb-menuitem-link" part="item-link">${this._escape(item.label)}</a>` : `<span class="mb-menuitem-link" part="item-link">${this._escape(item.label)}</span>`}
          ${hasChildren ? '<span class="mb-menuitem-submenu-icon" part="submenu-icon" aria-hidden="true">▾</span>' : ''}
        </div>
        ${hasChildren ? `<ul class="mb-menuitem-sublist" part="sublist" role="group">${children.map((child, childIndex) => this.#renderItem(child, `${key}-${childIndex}`)).join('')}</ul>` : ''}
      </li>
    `;
  }

  #onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const panelToggle = target.closest<HTMLElement>('[data-panel-toggle]');
    if (panelToggle) {
      const key = panelToggle.dataset.panelToggle;
      if (!key) return;
      const item = this.#resolvePanel(key);
      if (!item) return;
      const isOpen = this.#expandedPanels.has(key);

      if (!this.multiple) {
        this.#expandedPanels.clear();
      }
      if (isOpen) {
        this.#expandedPanels.delete(key);
        this.emit('mb-panel-close', { item });
      } else {
        this.#expandedPanels.add(key);
        this.emit('mb-panel-open', { item });
      }

      this.#reflectExpandedPanels();
      this._scheduleRender();
      return;
    }

    const entry = target.closest<HTMLElement>('[data-item-key]');
    if (!entry) return;
    const key = entry.dataset.itemKey;
    if (!key) return;
    const item = this.#resolveItemByKey(key);
    if (!item || item.disabled) return;

    if (item.items?.some(child => child.visible !== false)) {
      if (this.#expandedItems.has(key)) {
        this.#expandedItems.delete(key);
      } else {
        this.#expandedItems.add(key);
      }
      this._scheduleRender();
      return;
    }

    if (typeof item.command === 'function') {
      item.command({ originalEvent: event, item });
    }
    this.emit('mb-item-select', { item, originalEvent: event });
  }

  #onKeydown(event: KeyboardEvent): void {
    const focusables = Array.from(this._qsa<HTMLElement>('[data-panel-toggle], [data-item-key]'));
    if (!focusables.length) return;
    const active = document.activeElement as HTMLElement | null;
    let index = focusables.findIndex(el => el === active || el.contains(active));
    if (index < 0) index = 0;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = (index + direction + focusables.length) % focusables.length;
      focusables[next]?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const current = focusables[index];
      if (!current) return;
      event.preventDefault();
      current.click();
    }
  }

  #syncExpandedFromAttr(): void {
    const value = this._obj<unknown>('value');
    if (Array.isArray(value)) {
      this.#expandedPanels = new Set(value.map(item => String(item)));
    } else {
      this.#expandedPanels.clear();
    }
  }

  #reflectExpandedPanels(): void {
    const values = Array.from(this.#expandedPanels);
    this.value = values.length ? values : null;
    if (values.length) {
      this._reflectToAttr('value', JSON.stringify(values), 'string');
    } else {
      this.removeAttribute('value');
    }
  }

  #resolvePanel(key: string): MenuItem | null {
    const items = this.#visibleItems(this.model ?? []);
    return items.find((item, index) => (item.key ?? String(index)) === key) ?? null;
  }

  #resolveItemByKey(key: string): MenuItem | null {
    const chunks = key.split('-').map(part => Number(part));
    if (!chunks.length) return null;
    const panelIndex = chunks.shift();
    if (panelIndex == null) return null;

    const panel = this.#visibleItems(this.model ?? [])[panelIndex];
    if (!panel) return null;

    let current: MenuItem | null = null;
    let list = this.#visibleItems(panel.items ?? []);
    for (const index of chunks) {
      current = list[index] ?? null;
      if (!current) return null;
      list = this.#visibleItems(current.items ?? []);
    }
    return current;
  }

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }
}

export const definePanelMenu = createDefine('mb-panelmenu', MbPanelMenu);
