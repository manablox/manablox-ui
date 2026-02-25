import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { ACCORDION_STYLES } from './Accordion.styles.js';

type AccordionItem = {
  value: string;
  header: string;
  contentHtml: string;
  disabled: boolean;
};

const HIDDEN_CONFIG_STYLES = ':host { display: contents; }';

export class MbAccordionPanel extends MbBaseComponent {
  static readonly _componentName = 'mb-accordionpanel';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected _render(): string {
    return '<slot part="content"></slot>';
  }
}

export class MbAccordionHeader extends MbBaseComponent {
  static readonly _componentName = 'mb-accordionheader';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected _render(): string {
    return '<slot part="content"></slot>';
  }
}

export class MbAccordionContent extends MbBaseComponent {
  static readonly _componentName = 'mb-accordioncontent';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected _render(): string {
    return '<slot part="content"></slot>';
  }
}

export class MbAccordion extends MbBaseComponent {
  static readonly _componentName = 'mb-accordion';
  static readonly _componentStyles = ACCORDION_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'string'],
      ['multiple', 'boolean'],
      ['lazy', 'boolean'],
      ['panels', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value: string | null = null;
  multiple = false;
  lazy = false;
  panels: Array<{ value: string; header?: string; content?: string; disabled?: boolean }> | null = null;

  #items: AccordionItem[] = [];
  #seededFromChildren = false;

  connectedCallback(): void {
    this.#seedFromSource();
    super.connectedCallback();
  }

  protected _render(): string {
    const openSet = this.#activeValues();

    const panels = this.#items
      .map((item, index) => {
        const isOpen = openSet.has(item.value);
        const panelId = this.#panelId(index);
        const headerId = this.#headerId(index);
        const panelClass = `mb-accordionpanel${isOpen ? ' mb-accordionpanel-active' : ''}`;
        const header = this._escape(item.header);
        const content = !this.lazy || isOpen ? item.contentHtml : '';

        return `
          <div part="panel" class="${panelClass}" data-index="${index}" data-value="${this._escape(item.value)}">
            <button
              type="button"
              id="${headerId}"
              part="header"
              class="mb-accordionheader"
              data-index="${index}"
              data-value="${this._escape(item.value)}"
              aria-expanded="${isOpen ? 'true' : 'false'}"
              aria-controls="${panelId}"
              role="button"
              ${item.disabled ? 'disabled aria-disabled="true"' : ''}
            >
              <span part="label" class="mb-accordionheader-label">${header}</span>
              <span part="icon" class="mb-accordionheader-toggle-icon" aria-hidden="true">▶</span>
            </button>
            <div
              id="${panelId}"
              part="content"
              class="mb-accordioncontent"
              role="region"
              aria-labelledby="${headerId}"
              ${isOpen ? '' : 'hidden'}
            >
              <div part="content-inner" class="mb-accordioncontent-inner">
                ${content}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `<div part="root" class="mb-accordion">${panels}</div>`;
  }

  protected _afterRender(): void {
    const root = this._qs<HTMLElement>('.mb-accordion');
    if (!root) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const header = target?.closest<HTMLButtonElement>('.mb-accordionheader');
      if (!header || header.disabled) return;

      const index = Number(header.dataset.index ?? '-1');
      if (index < 0) return;
      this.#toggleByIndex(index, true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const header = target?.closest<HTMLButtonElement>('.mb-accordionheader');
      if (!header) return;

      const currentIndex = Number(header.dataset.index ?? '-1');
      if (currentIndex < 0) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!header.disabled) this.#toggleByIndex(currentIndex, true);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
      }

      if (event.key === 'ArrowDown') {
        const next = this.#findEnabledByDirection(currentIndex, 1);
        this.#focusHeader(next);
      } else if (event.key === 'ArrowUp') {
        const prev = this.#findEnabledByDirection(currentIndex, -1);
        this.#focusHeader(prev);
      } else if (event.key === 'Home') {
        const first = this.#findEnabledByDirection(-1, 1);
        this.#focusHeader(first);
      } else if (event.key === 'End') {
        const last = this.#findEnabledByDirection(this.#items.length, -1);
        this.#focusHeader(last);
      }
    };

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);
    this._addCleanup(() => root.removeEventListener('click', onClick));
    this._addCleanup(() => root.removeEventListener('keydown', onKeyDown));
  }

  #seedFromSource(): void {
    const panelsFromAttr = this._obj<Array<{ value: string; header?: string; content?: string; disabled?: boolean }>>('panels');
    if (Array.isArray(panelsFromAttr) && panelsFromAttr.length > 0) {
      this.#items = panelsFromAttr.map((panel, index) => ({
        value: String(panel.value ?? index),
        header: String(panel.header ?? `Panel ${index + 1}`),
        contentHtml: panel.content == null ? '' : String(panel.content),
        disabled: Boolean(panel.disabled),
      }));
      this.#seededFromChildren = false;
      return;
    }

    if (this.#seededFromChildren) return;

    const childPanels = Array.from(this._qsaLight<MbAccordionPanel>('mb-accordionpanel'));
    if (!childPanels.length) return;

    this.#items = childPanels.map((panel, index) => {
      const value = panel.getAttribute('value') ?? String(index);
      const disabled = panel.hasAttribute('disabled');
      const headerEl = panel.querySelector<MbAccordionHeader>('mb-accordionheader');
      const contentEl = panel.querySelector<MbAccordionContent>('mb-accordioncontent');
      const header = headerEl?.textContent?.trim() || `Panel ${index + 1}`;
      const contentHtml = contentEl?.innerHTML ?? '';
      return { value, header, contentHtml, disabled };
    });

    this.#seededFromChildren = true;
  }

  #parseActiveValues(): string[] {
    const raw = this.getAttribute('value');
    if (!raw) return [];

    const trimmed = raw.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item));
        }
      } catch {
        return [];
      }
    }

    return [trimmed];
  }

  #activeValues(): Set<string> {
    const requested = this.#parseActiveValues();
    const enabledValues = new Set(this.#items.filter(item => !item.disabled).map(item => item.value));

    const filtered = requested.filter(v => enabledValues.has(v));
    if (this.multiple) {
      return new Set(filtered);
    }

    const first = filtered[0];
    if (first) {
      return new Set([first]);
    }

    return new Set();
  }

  #toggleByIndex(index: number, focus = false): void {
    const item = this.#items[index];
    if (!item || item.disabled) return;

    const active = this.#activeValues();
    const wasOpen = active.has(item.value);

    if (this.multiple) {
      if (wasOpen) {
        active.delete(item.value);
      } else {
        active.add(item.value);
      }
      const nextValues = Array.from(active);
      this._reflectToAttr('value', JSON.stringify(nextValues), 'string');
    } else {
      if (wasOpen) {
        active.clear();
        this.removeAttribute('value');
      } else {
        active.clear();
        active.add(item.value);
        this._reflectToAttr('value', item.value, 'string');
      }
    }

    if (wasOpen) {
      this.emit('mb-tab-close', { index, value: item.value });
    } else {
      this.emit('mb-tab-open', { index, value: item.value });
    }

    this._scheduleRender();

    if (focus) {
      requestAnimationFrame(() => this.#focusHeader(index));
    }
  }

  #findEnabledByDirection(start: number, direction: 1 | -1): number {
    const total = this.#items.length;
    if (!total) return -1;

    let cursor = start;
    for (let step = 0; step < total; step += 1) {
      cursor = (cursor + direction + total) % total;
      if (!this.#items[cursor]?.disabled) return cursor;
    }
    return -1;
  }

  #focusHeader(index: number): void {
    if (index < 0) return;
    const header = this._qs<HTMLButtonElement>(`.mb-accordionheader[data-index="${index}"]`);
    header?.focus();
  }

  #headerId(index: number): string {
    return `${this.id || 'mb-accordion'}-header-${index}`;
  }

  #panelId(index: number): string {
    return `${this.id || 'mb-accordion'}-panel-${index}`;
  }
}
