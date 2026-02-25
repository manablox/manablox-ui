import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { BADGE_STYLES } from './Badge.styles.js';
import { createDefine } from '../../core/define.js';

export class MbBadge extends MbBaseComponent {
  static get attributeConverters() {
    return new Map([
      ['value', 'string'],
      ['severity', 'string'],
      ['size', 'string'],
    ] as const);
  }

  value: string | null = null;
  severity: string | null = null;
  size: 'large' | 'xlarge' | null = null;

  protected static override readonly _componentName = 'mb-badge';
  protected static override readonly _componentStyles = BADGE_STYLES;

  protected _render(): string {
    const classes = ['mb-badge', 'mb-component'];
    if (!this.value) classes.push('mb-badge-dot');
    if (this.severity) classes.push(`mb-badge-${this._escape(this.severity)}`);
    if (this.size === 'large') classes.push('mb-badge-lg');
    if (this.size === 'xlarge') classes.push('mb-badge-xl');

    const aria = this.value ? this._escape(this.value) : 'badge';

    return this._html`<span class="${classes.join(' ')}" aria-label="${aria}">${this.value ?? ''}</span>`;
  }
}

export const defineBadge = createDefine('mb-badge', MbBadge);
