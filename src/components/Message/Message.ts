import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { MESSAGE_STYLES } from './Message.styles.js';
import { createDefine } from '../../core/define.js';

export class MbMessage extends MbBaseComponent {
  static get attributeConverters() {
    return new Map([
      ['severity', 'string'],
      ['closable', 'boolean'],
      ['icon', 'string'],
      ['close-icon', 'string'],
    ] as const);
  }

  // defaults
  severity: 'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast' = 'info';
  closable = false;
  icon = '';
  closeIcon = '';

  protected static override readonly _componentName = 'mb-message';
  protected static override readonly _componentStyles = MESSAGE_STYLES;

  constructor() {
    super();
  }

  protected _render(): string {
    const severityClass = `mb-message-${this._escape(this.severity)}`;
    const iconClass = this.icon ? this._escape(this.icon) : '';
    const closeIconClass = this.closeIcon ? this._escape(this.closeIcon) : '';

    return this._html`
      <div class="mb-message mb-component ${severityClass}" part="root" role="alert">
        <span class="mb-message-icon ${iconClass}" part="icon"><slot name="icon"></slot></span>
        <div class="mb-message-text" part="content"><slot></slot></div>
        ${this.closable ? `<button class="mb-message-close-button" part="close-button" aria-label="close"><span class="mb-message-close-icon ${closeIconClass}" part="close-icon"></span></button>` : ''}
      </div>`;
  }

  protected _afterRender(): void {
    // attach close handler if closable
    const btn = this._qs<HTMLButtonElement>('.mb-message-close-button');
    if (btn) {
      const handler = (e: Event) => {
        e.preventDefault();
        this.emit('mb-close');
        // remove from DOM
        this.remove();
      };
      btn.addEventListener('click', handler);
      this._addCleanup(() => btn.removeEventListener('click', handler));
    }
  }
}

export const defineMessage = createDefine('mb-message', MbMessage);
