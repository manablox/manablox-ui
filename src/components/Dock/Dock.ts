import type { AttributeConverter, MenuItem } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { DOCK_STYLES } from './Dock.styles.js';

type DockPosition = 'bottom' | 'top' | 'left' | 'right';

interface DockTooltipOptions {
  position?: 'top' | 'bottom';
  event?: 'hover';
}

export class MbDock extends MbBaseComponent {
  static readonly _componentName = 'mb-dock';
  static readonly _componentStyles = DOCK_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['position', 'string'],
      ['magnification-disabled', 'boolean'],
      ['tooltip-options', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  position: DockPosition = 'bottom';
  magnificationDisabled = false;
  tooltipOptions: DockTooltipOptions | null = null;

  #focusedIndex = 0;

  connectedCallback(): void {
    super.connectedCallback();
    const onClick = (event: MouseEvent) => this.#onClick(event);
    const onMouseMove = (event: MouseEvent) => this.#onMouseMove(event);
    const onMouseLeave = () => this.#resetMagnification();
    const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);

    this.addEventListener('click', onClick);
    this.addEventListener('mousemove', onMouseMove);
    this.addEventListener('mouseleave', onMouseLeave);
    this.addEventListener('keydown', onKeydown);

    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.removeEventListener('mousemove', onMouseMove));
    this._addCleanup(() => this.removeEventListener('mouseleave', onMouseLeave));
    this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
  }

  protected _render(): string {
    const items = this.#visibleItems(this.model ?? []);
    const pos = this.#normalizePosition(this.position);

    return `
      <nav class="mb-dock mb-component mb-dock-${pos}" role="menu" aria-orientation="${pos === 'left' || pos === 'right' ? 'vertical' : 'horizontal'}">
        <ul class="mb-dock-list" role="none">
          ${items.map((item, index) => this.#renderItem(item, index)).join('')}
        </ul>
      </nav>
    `;
  }

  protected _afterRender(): void {
    this.#syncFocusable();
  }

  #renderItem(item: MenuItem, index: number): string {
    const focused = index === this.#focusedIndex;
    const tooltipEvent = this.tooltipOptions?.event ?? 'hover';
    return `
      <li class="mb-dock-item" role="none" data-dock-index="${index}">
        <div class="mb-dock-item-content${focused ? ' mb-focus' : ''}" role="menuitem" tabindex="${focused ? '0' : '-1'}" aria-label="${this._escape(item.label)}" aria-disabled="${item.disabled ? 'true' : 'false'}" data-item-index="${index}">
          ${item.icon ? `<span class="mb-dock-item-icon ${this._escape(item.icon)}" aria-hidden="true"></span>` : '<span class="mb-dock-item-icon" aria-hidden="true">●</span>'}
        </div>
        <span class="mb-dock-item-tooltip" data-tooltip-event="${tooltipEvent}">${this._escape(item.label)}</span>
      </li>
    `;
  }

  #onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const content = target?.closest<HTMLElement>('[data-item-index]');
    if (!content) return;
    const index = Number(content.dataset.itemIndex ?? '-1');
    if (index < 0) return;
    const item = this.#visibleItems(this.model ?? [])[index];
    if (!item || item.disabled) return;

    this.#focusedIndex = index;
    this.#syncFocusable();

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
    this.emit('mb-dock-select', { item, originalEvent: event });
  }

  #onMouseMove(event: MouseEvent): void {
    if (this.magnificationDisabled) return;
    const list = this._qs<HTMLElement>('.mb-dock-list');
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('.mb-dock-item-content'));
    if (!items.length) return;

    const vertical = this.position === 'left' || this.position === 'right';

    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const center = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      const cursor = vertical ? event.clientY : event.clientX;
      const distance = Math.abs(center - cursor);
      const maxDistance = 120;
      const intensity = Math.max(0, 1 - distance / maxDistance);
      const scale = 1 + intensity * 0.55;
      item.style.setProperty('--mb-dock-item-scale', String(scale));
    });
  }

  #onKeydown(event: KeyboardEvent): void {
    const items = Array.from(this.querySelectorAll<HTMLElement>('[data-item-index]'));
    if (!items.length) return;

    const horizontal = this.position === 'bottom' || this.position === 'top';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === nextKey || event.key === prevKey) {
      event.preventDefault();
      const direction = event.key === nextKey ? 1 : -1;
      this.#focusedIndex = (this.#focusedIndex + direction + items.length) % items.length;
      this.#syncFocusable();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.#focusedIndex = 0;
      this.#syncFocusable();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.#focusedIndex = items.length - 1;
      this.#syncFocusable();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      items[this.#focusedIndex]?.click();
    }
  }

  #syncFocusable(): void {
    const items = Array.from(this.querySelectorAll<HTMLElement>('[data-item-index]'));
    if (!items.length) {
      this.#focusedIndex = 0;
      return;
    }

    if (this.#focusedIndex < 0 || this.#focusedIndex >= items.length) {
      this.#focusedIndex = 0;
    }

    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.#focusedIndex ? '0' : '-1');
      item.classList.toggle('mb-focus', index === this.#focusedIndex);
    });
  }

  #resetMagnification(): void {
    this.querySelectorAll<HTMLElement>('.mb-dock-item-content').forEach(item => {
      item.style.setProperty('--mb-dock-item-scale', '1');
    });
  }

  #visibleItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => item.visible !== false);
  }

  #normalizePosition(value: string): DockPosition {
    if (value === 'top' || value === 'left' || value === 'right') return value;
    return 'bottom';
  }
}

export const defineDock = createDefine('mb-dock', MbDock);
