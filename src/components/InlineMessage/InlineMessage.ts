import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { INLINEMESSAGE_STYLES } from './InlineMessage.styles.js';
import { createDefine } from '../../core/define.js';

export class MbInlineMessage extends MbBaseComponent {
  static get attributeConverters() {
    return new Map([
      ['severity', 'string'],
      ['icon', 'string'],
    ] as const);
  }

  severity: 'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast' = 'info';
  icon = '';

  protected static override readonly _componentName = 'mb-inlinemessage';
  protected static override readonly _componentStyles = INLINEMESSAGE_STYLES;

  protected _render(): string {
    const severityClass = `mb-inlinemessage-${this._escape(this.severity)}`;
    const iconClass = this.icon ? this._escape(this.icon) : '';

    return this._html`
      <span class="mb-inlinemessage mb-component ${severityClass}">
        <span class="mb-inlinemessage-icon ${iconClass}"></span>
        <slot></slot>
      </span>`;
  }
}

export const defineInlineMessage = createDefine('mb-inlinemessage', MbInlineMessage);
