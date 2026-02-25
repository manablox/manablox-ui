import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { MenuItem } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { BREADCRUMB_STYLES } from './Breadcrumb.styles.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbBreadcrumb extends MbBaseComponent {
  static readonly _componentName = 'mb-breadcrumb';
  static readonly _componentStyles = BREADCRUMB_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['home', 'object'],
      ['aria-label', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  home: MenuItem | null = null;
  ariaLabel: string | null = 'Breadcrumb';

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
    const separator = '<li class="mb-breadcrumb-separator" part="separator" aria-hidden="true">/</li>';

    return this._html`
      <nav class="mb-breadcrumb mb-component" part="root" aria-label="${this._escape(this.ariaLabel ?? 'Breadcrumb')}">
        <ol class="mb-breadcrumb-list" part="list">
          ${items.map((item, index) => this.#renderItem(item, index, index === items.length - 1)).join(separator)}
        </ol>
      </nav>
    `;
  }

  protected _afterRender(): void {
    this.#syncFocusable();
  }

  #items(): MenuItem[] {
    const modelItems = (this.model ?? []).filter(item => item.visible !== false);
    if (this.home && this.home.visible !== false) {
      return [this.home, ...modelItems];
    }
    return modelItems;
  }

  #renderItem(item: MenuItem, index: number, isLast: boolean): string {
    const disabled = !!item.disabled || isLast;
    const isFocused = index === this.#focusedIndex;
    const tabindex = disabled ? '-1' : isFocused ? '0' : '-1';
    const attrs = isLast ? ' aria-current="page"' : '';
    const classes = `mb-breadcrumb-item-link${disabled ? ' mb-disabled' : ''}`;
    const icon = item.icon ? `<span class="mb-breadcrumb-item-icon ${this._escape(item.icon)}" part="item-icon" aria-hidden="true"></span>` : '';
    const content = `${icon}<span class="mb-breadcrumb-item-label" part="item-label">${this._escape(item.label)}</span>`;

    const link = item.url && !disabled
      ? `<a class="${classes}" part="item-link" href="${this._escape(item.url)}" data-index="${index}" tabindex="${tabindex}">${content}</a>`
      : `<button type="button" class="${classes}" part="item-link" data-index="${index}" tabindex="${tabindex}"${attrs}>${content}</button>`;

    return `<li class="mb-breadcrumb-item" part="item">${link}</li>`;
  }

  #syncFocusable(): void {
    const links = Array.from(this._qsa<HTMLElement>('.mb-breadcrumb-item-link:not(.mb-disabled)'));
    if (links.length === 0) return;

    if (this.#focusedIndex >= links.length) {
      this.#focusedIndex = links.length - 1;
    }

    links.forEach((link, idx) => {
      link.setAttribute('tabindex', idx === this.#focusedIndex ? '0' : '-1');
    });
  }

  #handleClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.mb-breadcrumb-item-link[data-index]');
    if (!target || target.classList.contains('mb-disabled')) return;

    const index = Number(target.getAttribute('data-index'));
    if (Number.isNaN(index)) return;

    this.#focusedIndex = index;
    const item = this.#items()[index];
    if (!item || item.disabled || index === this.#items().length - 1) {
      event.preventDefault();
      return;
    }

    if (typeof item.command === 'function') {
      item.command({ originalEvent: event, item });
    }

    this.emit('mb-item-click', { originalEvent: event, item });
    this.#syncFocusable();
  }

  #handleKeyDown(event: KeyboardEvent): void {
    const links = Array.from(this._qsa<HTMLElement>('.mb-breadcrumb-item-link:not(.mb-disabled)'));
    if (links.length === 0) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      this.#focusedIndex = (this.#focusedIndex + delta + links.length) % links.length;
      this.#syncFocusable();
      links[this.#focusedIndex]?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      links[this.#focusedIndex]?.click();
    }
  }
}

export const defineBreadcrumb = createDefine('mb-breadcrumb', MbBreadcrumb);
