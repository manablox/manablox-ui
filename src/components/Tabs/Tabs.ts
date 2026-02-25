import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { TABS_STYLES } from './Tabs.styles.js';

type TabItem = {
  value: string;
  label: string;
  disabled: boolean;
  panel: MbTabPanel | null;
};

const HIDDEN_CONFIG_STYLES = ':host { display: none; }';

export class MbTabPanel extends MbBaseComponent {
  static readonly _componentName = 'mb-tabpanel';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'string'],
      ['header', 'string'],
      ['disabled', 'boolean'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  protected _render(): string {
    return '';
  }
}

export class MbTabs extends MbBaseComponent {
  static readonly _componentName = 'mb-tabs';
  static readonly _componentStyles = TABS_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'string'],
      ['lazy', 'boolean'],
      ['scrollable', 'boolean'],
      ['tabs', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value: string | number | null = null;
  lazy = false;
  scrollable = false;
  tabs: Array<{ value: string; label?: string; disabled?: boolean }> | null = null;

  #items: TabItem[] = [];
  #seededFromChildren = false;

  connectedCallback(): void {
    this.#seedFromSource();
    super.connectedCallback();
  }

  protected _render(): string {
    const items = this.#items;
    const activeValue = this.#resolveActiveValue();
    const rootClass = `mb-tabs${this.scrollable ? ' mb-tabs-scrollable' : ''}`;

    const tabButtons = items
      .map((item, index) => {
        const selected = item.value === activeValue;
        const tabId = this.#tabId(index);
        const panelId = this.#panelId(index);
        const activeClass = selected ? ' mb-tab-active' : '';

        return `
          <button
            type="button"
            id="${tabId}"
            class="mb-tab${activeClass}"
            role="tab"
            data-index="${index}"
            data-value="${this._escape(item.value)}"
            aria-selected="${selected ? 'true' : 'false'}"
            aria-controls="${panelId}"
            tabindex="${selected ? '0' : '-1'}"
            ${item.disabled ? 'disabled aria-disabled="true"' : ''}
          >
            <span class="mb-tab-label">${this._escape(item.label)}</span>
            ${selected ? '<span class="mb-tab-active-bar" aria-hidden="true"></span>' : ''}
          </button>
        `;
      })
      .join('');

    const panelMarkup = items
      .map((item, index) => {
        const isActive = item.value === activeValue;
        const tabId = this.#tabId(index);
        const panelId = this.#panelId(index);
        const shouldRender = !this.lazy || isActive;
        const content = shouldRender ? (item.panel?.innerHTML ?? '') : '';

        return `
          <div
            id="${panelId}"
            class="mb-tabpanel"
            role="tabpanel"
            aria-labelledby="${tabId}"
            ${isActive ? '' : 'hidden'}
            tabindex="0"
          >
            ${content}
          </div>
        `;
      })
      .join('');

    return this._html`
      <div class="${rootClass}">
        <div class="mb-tablist" role="tablist" aria-orientation="horizontal">
          ${tabButtons}
        </div>
        <div class="mb-tabpanels">
          ${panelMarkup}
        </div>
      </div>
    `;
  }

  protected _afterRender(): void {
    const tabList = this._qs<HTMLElement>('.mb-tablist');
    if (!tabList) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const tab = target?.closest<HTMLButtonElement>('.mb-tab');
      if (!tab || tab.disabled) return;

      const index = Number(tab.dataset.index ?? '-1');
      if (index < 0 || index >= this.#items.length) return;
      this.#activateIndex(index, true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tab = target?.closest<HTMLButtonElement>('.mb-tab');
      if (!tab) return;

      const currentIndex = Number(tab.dataset.index ?? '-1');
      if (currentIndex < 0) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = this.#findEnabledByDirection(currentIndex, direction);
        if (next >= 0) this.#activateIndex(next, true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        const first = this.#findEnabledByDirection(-1, 1);
        if (first >= 0) this.#activateIndex(first, true);
      } else if (event.key === 'End') {
        event.preventDefault();
        const last = this.#findEnabledByDirection(this.#items.length, -1);
        if (last >= 0) this.#activateIndex(last, true);
      }
    };

    tabList.addEventListener('click', onClick);
    tabList.addEventListener('keydown', onKeyDown);
    this._addCleanup(() => tabList.removeEventListener('click', onClick));
    this._addCleanup(() => tabList.removeEventListener('keydown', onKeyDown));
  }

  #seedFromSource(): void {
    const tabsFromAttr = this._obj<Array<{ value: string; label?: string; disabled?: boolean }>>('tabs');
    if (Array.isArray(tabsFromAttr) && tabsFromAttr.length > 0) {
      this.#items = tabsFromAttr.map((tab, index) => ({
        value: String(tab.value ?? index),
        label: String(tab.label ?? `Tab ${index + 1}`),
        disabled: Boolean(tab.disabled),
        panel: null,
      }));
      this.#seededFromChildren = false;
      return;
    }

    if (this.#seededFromChildren) return;

    const childPanels = Array.from(this._qsaLight<MbTabPanel>('mb-tabpanel'));
    if (!childPanels.length) return;

    this.#items = childPanels.map((panel, index) => {
      const value = panel.getAttribute('value') ?? String(index);
      const header = panel.getAttribute('header') ?? `Tab ${index + 1}`;
      const disabled = panel.hasAttribute('disabled');
      return { value, label: header, disabled, panel };
    });

    this.#seededFromChildren = true;
  }

  #resolveActiveValue(): string {
    const requested = this.value == null ? this.getAttribute('value') : String(this.value);
    if (requested != null) {
      const hit = this.#items.find(item => item.value === String(requested) && !item.disabled);
      if (hit) return hit.value;
    }

    const firstEnabled = this.#items.find(item => !item.disabled);
    return firstEnabled?.value ?? '';
  }

  #activateIndex(index: number, focus = false): void {
    const item = this.#items[index];
    if (!item || item.disabled) return;

    const nextValue = item.value;
    const current = this.#resolveActiveValue();
    if (current === nextValue) {
      if (focus) {
        const button = this._qs<HTMLButtonElement>(`.mb-tab[data-index="${index}"]`);
        button?.focus();
      }
      return;
    }

    this.value = nextValue;
    this._reflectToAttr('value', nextValue, 'string');
    this.emit('mb-tab-change', { index, value: nextValue });
    this._scheduleRender();

    if (focus) {
      requestAnimationFrame(() => {
        const button = this._qs<HTMLButtonElement>(`.mb-tab[data-index="${index}"]`);
        button?.focus();
      });
    }
  }

  #findEnabledByDirection(start: number, direction: 1 | -1): number {
    const total = this.#items.length;
    if (total === 0) return -1;

    let cursor = start;
    for (let step = 0; step < total; step += 1) {
      cursor = (cursor + direction + total) % total;
      if (!this.#items[cursor]?.disabled) {
        return cursor;
      }
    }
    return -1;
  }

  #tabId(index: number): string {
    return `${this.id || 'mb-tabs'}-tab-${index}`;
  }

  #panelId(index: number): string {
    return `${this.id || 'mb-tabs'}-panel-${index}`;
  }
}
