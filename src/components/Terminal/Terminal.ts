import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { AttributeConverter } from '../../core/types.js';
import styles from './Terminal.styles.js';

type Entry = { type: 'cmd' | 'res'; text: string };

export class MbTerminal extends MbBaseComponent {
  static _componentName = 'mb-terminal';
  static _componentStyles = styles;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map<string, AttributeConverter>([
      ['welcome-message', 'string'],
      ['prompt', 'string'],
    ]);
  }

  static get observedAttributes() {
    return Array.from(this.attributeConverters.keys());
  }

  #history: Entry[] = [];

  constructor() {
    super();
  }

  protected _render(): string {
    const welcome = this._str('welcome-message', '');
    const prompt = this._str('prompt', '$');

    const outHtml = this.#history.map(e => `<div class="mb-terminal-entry">${this._escape(e.type==='cmd'?`${prompt} ${e.text}`:e.text)}</div>`).join('');

    return this._html`
      <div class="mb-terminal">
        ${welcome?`<div class="mb-terminal-welcome">${this._escape(welcome)}</div>`:''}
        <div class="mb-terminal-output">${outHtml}</div>
        <div class="mb-terminal-prompt-container">
          <span class="mb-terminal-prompt">${this._escape(prompt)}</span>
          <input class="mb-terminal-input" type="text" data-mb-input />
        </div>
      </div>`;
  }

  protected _afterRender(): void {
    const input = this._qs<HTMLInputElement>('[data-mb-input]');
    if (!input) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const v = input.value;
        if (!v) return;
        this.#history.push({ type: 'cmd', text: v });
        this.emit('mb-command', { value: v });
        input.value = '';
        this._scheduleRender();
      }
    };
    input.addEventListener('keydown', onKey);
    this._addCleanup(() => input.removeEventListener('keydown', onKey));
  }

  setResponse(response: string): void {
    this.#history.push({ type: 'res', text: response });
    this._scheduleRender();
  }
}

export function defineTerminal(): void {
  if (!customElements.get('mb-terminal')) {
    customElements.define('mb-terminal', MbTerminal);
  }
}

export default MbTerminal;
