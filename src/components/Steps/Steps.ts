import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { MenuItem } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { STEPS_STYLES } from './Steps.styles.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbSteps extends MbBaseComponent {
  static readonly _componentName = 'mb-steps';
  static readonly _componentStyles = STEPS_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['model', 'object'],
      ['active-step', 'number'],
      ['readonly', 'boolean'],
      ['aria-label', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  model: MenuItem[] | null = null;
  activeStep = 0;
  readonly = true;
  ariaLabel: string | null = 'Steps';

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

    return this._html`
      <nav class="mb-steps mb-component" aria-label="${this._escape(this.ariaLabel ?? 'Steps')}">
        <ol class="mb-steps-list" role="tablist" aria-label="${this._escape(this.ariaLabel ?? 'Steps')}">
          ${items.map((item, index) => this.#renderStep(item, index, items.length)).join('')}
        </ol>
      </nav>
    `;
  }

  protected _afterRender(): void {
    this.#syncFocusable();
  }

  #items(): MenuItem[] {
    return (this.model ?? []).filter(item => item.visible !== false);
  }

  #renderStep(item: MenuItem, index: number, total: number): string {
    const disabled = !!item.disabled;
    const active = index === this.activeStep;
    const complete = index < this.activeStep;
    const classes = [
      'mb-step',
      active ? 'mb-step-active' : '',
      complete ? 'mb-step-complete' : '',
      disabled ? 'mb-step-disabled' : '',
    ].filter(Boolean).join(' ');
    const tabIndex = index === this.#focusedIndex ? '0' : '-1';
    const icon = item.icon ? `<span class="mb-step-number ${this._escape(item.icon)}" aria-hidden="true"></span>` : `<span class="mb-step-number">${index + 1}</span>`;

    return `
      <li class="${classes}" role="presentation">
        ${index < total - 1 ? '<span class="mb-steps-separator" aria-hidden="true"></span>' : ''}
        <button
          type="button"
          class="mb-step-header-action"
          role="tab"
          data-index="${index}"
          tabindex="${tabIndex}"
          aria-selected="${active ? 'true' : 'false'}"
          aria-current="${active ? 'step' : 'false'}"
          aria-disabled="${disabled ? 'true' : 'false'}"
        >
          <span class="mb-step-header">${icon}</span>
          <span class="mb-step-title">${this._escape(item.label)}</span>
          ${item.badge ? `<span class="mb-step-subtitle">${this._escape(item.badge)}</span>` : ''}
        </button>
      </li>
    `;
  }

  #syncFocusable(): void {
    const tabs = Array.from(this.querySelectorAll<HTMLElement>('.mb-step-header-action[role="tab"]'));
    if (tabs.length === 0) return;

    if (this.#focusedIndex < 0 || this.#focusedIndex >= tabs.length) {
      this.#focusedIndex = Math.min(Math.max(this.activeStep, 0), tabs.length - 1);
    }

    tabs.forEach((tab, idx) => {
      tab.setAttribute('tabindex', idx === this.#focusedIndex ? '0' : '-1');
    });
  }

  #handleClick(event: MouseEvent): void {
    const btn = (event.target as HTMLElement | null)?.closest<HTMLElement>('.mb-step-header-action[data-index]');
    if (!btn) return;

    const index = Number(btn.getAttribute('data-index'));
    if (Number.isNaN(index)) return;

    const item = this.#items()[index];
    if (!item || item.disabled) {
      event.preventDefault();
      return;
    }

    this.#focusedIndex = index;

    if (!this.readonly) {
      this.activeStep = index;
      if (typeof item.command === 'function') {
        item.command({ originalEvent: event, item });
      }
      this.emit('mb-item-click', { originalEvent: event, item, index });
      this._scheduleRender();
      return;
    }

    this.#syncFocusable();
  }

  #handleKeyDown(event: KeyboardEvent): void {
    const tabs = Array.from(this.querySelectorAll<HTMLElement>('.mb-step-header-action[role="tab"]'));
    if (tabs.length === 0) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      this.#focusedIndex = (this.#focusedIndex + delta + tabs.length) % tabs.length;
      this.#syncFocusable();
      tabs[this.#focusedIndex]?.focus();
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && !this.readonly) {
      event.preventDefault();
      tabs[this.#focusedIndex]?.click();
    }
  }
}

export const defineSteps = createDefine('mb-steps', MbSteps);
