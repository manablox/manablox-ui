import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { MenuItem } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { TABMENU_STYLES } from './TabMenu.styles.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbTabMenu extends MbBaseComponent {
  static readonly _componentName = 'mb-tabmenu';
  static readonly _componentStyles = TABMENU_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['active-index', 'number'],
      ['active-item', 'object'],
      ['aria-label', 'string'],
      ['aria-labelledby', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  activeIndex = 0;
  activeItem: MenuItem | null = null;
  ariaLabel: string | null = null;
  ariaLabelledby: string | null = null;

  #focusedIndex = 0;

  connectedCallback(): void {
    super.connectedCallback();

    const onClick = (e: MouseEvent) => this.#handleClick(e);
    const onKeyDown = (e: KeyboardEvent) => this.#handleKeyDown(e);
    this.addEventListener('click', onClick);
    this.addEventListener('keydown', onKeyDown);
    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
  }

  protected _render(): string {
    const items = this.#items();
    const activeIndex = this.#currentActiveIndex(items);
    const ariaLabel = this.ariaLabel ? ` aria-label="${this._escape(this.ariaLabel)}"` : '';
    const ariaLabelledby = this.ariaLabelledby ? ` aria-labelledby="${this._escape(this.ariaLabelledby)}"` : '';

    return this._html`
      <nav class="mb-tabmenu mb-component" part="root" role="menubar"${ariaLabel}${ariaLabelledby}>
        <ul class="mb-tabmenu-nav" part="list" role="none">
          ${items.map((item, index) => this.#renderItem(item, index, activeIndex)).join('')}
        </ul>
      </nav>
    `;
  }

  protected _afterRender(): void {
    this.#syncFocusable();
  }

  #items(): MenuItem[] {
    return (this.model ?? []).filter(item => item.visible !== false);
  }

  #currentActiveIndex(items: MenuItem[]): number {
    if (this.activeItem) {
      const fromItem = items.findIndex(item => item === this.activeItem || (item.key && item.key === this.activeItem?.key));
      if (fromItem >= 0) return fromItem;
    }

    if (this.activeIndex < 0) return 0;
    if (this.activeIndex >= items.length) return Math.max(items.length - 1, 0);
    return this.activeIndex;
  }

  #renderItem(item: MenuItem, index: number, activeIndex: number): string {
    const active = index === activeIndex;
    const disabled = !!item.disabled;
    const classes = [
      'mb-tabmenu-item',
      active ? 'mb-tabmenu-item-active' : '',
      disabled ? 'mb-disabled' : '',
    ].filter(Boolean).join(' ');
    const tabindex = index === this.#focusedIndex ? '0' : '-1';
    const icon = item.icon ? `<span class="mb-tabmenu-item-icon ${this._escape(item.icon)}" part="tab-icon" aria-hidden="true"></span>` : '';

    return `
      <li class="${classes}" part="tab" role="none">
        ${item.url && !disabled
          ? `<a class="mb-tabmenu-item-link" part="tab-link" role="menuitem" href="${this._escape(item.url)}" data-index="${index}" tabindex="${tabindex}" aria-current="${active ? 'page' : 'false'}" aria-disabled="${disabled ? 'true' : 'false'}">${icon}<span class="mb-tabmenu-item-label" part="tab-label">${this._escape(item.label)}</span></a>`
          : `<button type="button" class="mb-tabmenu-item-link" part="tab-link" role="menuitem" data-index="${index}" tabindex="${tabindex}" aria-current="${active ? 'page' : 'false'}" aria-disabled="${disabled ? 'true' : 'false'}">${icon}<span class="mb-tabmenu-item-label" part="tab-label">${this._escape(item.label)}</span></button>`}
      </li>
    `;
  }

  #syncFocusable(): void {
    const items = Array.from(this._qsa<HTMLElement>('.mb-tabmenu-item-link[role="menuitem"]'));
    if (items.length === 0) return;

    if (this.#focusedIndex < 0 || this.#focusedIndex >= items.length) {
      this.#focusedIndex = Math.min(Math.max(this.activeIndex, 0), items.length - 1);
    }

    items.forEach((el, idx) => {
      const disabled = el.getAttribute('aria-disabled') === 'true';
      el.setAttribute('tabindex', disabled ? '-1' : idx === this.#focusedIndex ? '0' : '-1');
    });
  }

  #handleClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.mb-tabmenu-item-link[data-index]');
    if (!target || target.getAttribute('aria-disabled') === 'true') return;

    const index = Number(target.getAttribute('data-index'));
    if (Number.isNaN(index)) return;

    const item = this.#items()[index];
    if (!item) return;

    this.#focusedIndex = index;
    this.activeIndex = index;
    this.activeItem = item;

    if (typeof item.command === 'function') {
      item.command({ originalEvent: event, item });
    }

    this.emit('mb-tab-change', { originalEvent: event, index });
    this._scheduleRender();
  }

  #handleKeyDown(event: KeyboardEvent): void {
    const items = Array.from(this._qsa<HTMLElement>('.mb-tabmenu-item-link[role="menuitem"]'));
    if (items.length === 0) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      let next = this.#focusedIndex;

      for (let i = 0; i < items.length; i += 1) {
        next = (next + delta + items.length) % items.length;
        if (items[next]?.getAttribute('aria-disabled') !== 'true') {
          this.#focusedIndex = next;
          this.#syncFocusable();
          items[next]?.focus();
          break;
        }
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      items[this.#focusedIndex]?.click();
    }
  }
}

export const defineTabMenu = createDefine('mb-tabmenu', MbTabMenu);
