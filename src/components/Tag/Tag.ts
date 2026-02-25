import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { TAG_STYLES } from './Tag.styles.js';
import { createDefine } from '../../core/define.js';

export class MbTag extends MbBaseComponent {
  static get attributeConverters() {
    return new Map([
      ['value', 'string'],
      ['severity', 'string'],
      ['rounded', 'boolean'],
      ['icon', 'string'],
    ] as const);
  }

  value: string | null = null;
  severity: string | null = null;
  rounded = false;
  icon = '';

  protected static override readonly _componentName = 'mb-tag';
  protected static override readonly _componentStyles = TAG_STYLES;

  protected _render(): string {
    const classes = ['mb-tag', 'mb-component'];
    if (this.severity) classes.push(`mb-tag-${this._escape(this.severity)}`);
    if (this.rounded) classes.push('mb-tag-rounded');
    const iconClass = this.icon ? this._escape(this.icon) : '';

    const content = this.value ? this._escape(this.value) : '<slot></slot>';

    return this._html`
      <span class="${classes.join(' ')}" role="status">
        ${this.icon ? `<span class="mb-tag-icon ${iconClass}"></span>` : ''}
        <span class="mb-tag-value">${content}</span>
      </span>`;
  }
}

export const defineTag = createDefine('mb-tag', MbTag);
