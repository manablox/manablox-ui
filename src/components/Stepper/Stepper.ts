import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { STEPPER_STYLES } from './Stepper.styles.js';

type StepperOrientation = 'horizontal' | 'vertical';

type StepPanel = {
  value: number;
  header: string;
  panel: MbStepperPanel;
};

const HIDDEN_CONFIG_STYLES = ':host { display: none; }';

export class MbStepperPanel extends MbBaseComponent {
  static readonly _componentName = 'mb-stepperpanel';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'number'],
      ['header', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  protected _render(): string {
    return '';
  }
}

export class MbStepper extends MbBaseComponent {
  static readonly _componentName = 'mb-stepper';
  static readonly _componentStyles = STEPPER_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['value', 'number'],
      ['linear', 'boolean'],
      ['orientation', 'string'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  value = 0;
  linear = false;
  orientation: StepperOrientation = 'horizontal';

  #panels: StepPanel[] = [];
  #seeded = false;

  connectedCallback(): void {
    this.#seedPanels();
    super.connectedCallback();
  }

  next(): void {
    this.#goTo(this.#activeIndex + 1, true, true);
  }

  prev(): void {
    this.#goTo(this.#activeIndex - 1, true, true);
  }

  protected _render(): string {
    const orientation = this.#orientation;
    const active = this.#activeIndex;

    const nav = this.#panels
      .map((panel, index) => {
        const isActive = index === active;
        const isDone = index < active;
        const isDisabled = this.linear && !isActive && Math.abs(index - active) > 1;

        const classes = [
          'mb-stepperitem',
          isActive ? 'mb-stepperitem-active' : '',
          isDone ? 'mb-stepperitem-done' : '',
          isDisabled ? 'mb-stepperitem-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const indicator = isDone ? '✓' : String(index + 1);
        const button = `
          <button
            type="button"
            class="mb-stepperitem-header"
            data-step-index="${index}"
            aria-current="${isActive ? 'step' : 'false'}"
            ${isDisabled ? 'disabled aria-disabled="true"' : ''}
          >
            <span class="mb-stepperitem-number">${this._escape(indicator)}</span>
            <span class="mb-stepperitem-title">${this._escape(panel.header)}</span>
          </button>
        `;

        if (index >= this.#panels.length - 1) {
          return `<div class="${classes}">${button}</div>`;
        }

        return `
          <div class="${classes}">${button}</div>
          <div class="mb-stepper-separator" aria-hidden="true"></div>
        `;
      })
      .join('');

    const activePanel = this.#panels[active];
    const panelContent = activePanel?.panel?.innerHTML ?? '';

    return `
      <div class="mb-stepper mb-stepper-${orientation}">
        <div class="mb-stepper-nav" role="tablist" aria-orientation="${orientation}">
          ${nav}
        </div>
        <div class="mb-stepper-panels">
          <div class="mb-stepperpanel" data-active-step="${active}">
            <div class="mb-stepperpanel-content">${panelContent}</div>
          </div>
        </div>
      </div>
    `;
  }

  protected _afterRender(): void {
    const root = this._qs<HTMLElement>('.mb-stepper');
    if (!root) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const stepHeader = target?.closest<HTMLButtonElement>('.mb-stepperitem-header');
      if (stepHeader) {
        const index = Number(stepHeader.dataset.stepIndex ?? '-1');
        if (index >= 0) {
          this.#goTo(index, true, false);
        }
        return;
      }

      const actionButton = target?.closest<HTMLElement>('mb-button[data-step-action]');
      const action = actionButton?.dataset.stepAction;
      if (!action) return;

      if (action === 'next') {
        this.next();
      } else if (action === 'prev') {
        this.prev();
      }
    };

    root.addEventListener('click', onClick);
    this._addCleanup(() => root.removeEventListener('click', onClick));
  }

  get #orientation(): StepperOrientation {
    return this.orientation === 'vertical' ? 'vertical' : 'horizontal';
  }

  get #activeIndex(): number {
    if (!this.#panels.length) return 0;
    const index = Number.isFinite(this.value) ? Math.trunc(this.value) : 0;
    return Math.min(Math.max(index, 0), this.#panels.length - 1);
  }

  #seedPanels(): void {
    if (this.#seeded) return;

    const children = Array.from(this._qsaLight<MbStepperPanel>('mb-stepperpanel'));
    if (!children.length) return;

    this.#panels = children.map((panel, index) => {
      const valueAttr = panel.getAttribute('value');
      const value = valueAttr == null ? index : Number(valueAttr);
      const normalizedValue = Number.isFinite(value) ? Math.trunc(value) : index;

      return {
        value: normalizedValue,
        header: panel.getAttribute('header') ?? `Step ${index + 1}`,
        panel,
      };
    });

    this.#panels.sort((a, b) => a.value - b.value);
    this.#panels = this.#panels.map((panel, index) => ({ ...panel, value: index }));
    this.#seeded = true;
  }

  #goTo(nextIndex: number, emitEvent: boolean, forceLinearMove: boolean): void {
    if (!this.#panels.length) return;

    const current = this.#activeIndex;
    const bounded = Math.min(Math.max(nextIndex, 0), this.#panels.length - 1);
    if (bounded === current) return;

    if (this.linear && !forceLinearMove && Math.abs(bounded - current) > 1) {
      return;
    }

    this.value = bounded;
    this._reflectToAttr('value', bounded, 'number');
    this._scheduleRender();

    if (emitEvent) {
      this.emit('mb-step-change', { value: bounded, prev: current });
    }
  }
}
