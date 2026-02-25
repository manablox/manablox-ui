import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { DIVIDER_STYLES } from './Divider.styles.js';

export class MbDivider extends MbBaseComponent {
  protected static readonly _componentName = 'mb-divider';
  protected static readonly _componentStyles = DIVIDER_STYLES;

  constructor() {
    super();
  }

  protected _render(): string {
    const layout = this.getAttribute('layout') ?? 'horizontal';
    const type = this.getAttribute('type') ?? 'solid';
    const align = this.getAttribute('align') ?? 'center';

    const classes = [`mb-divider`, `mb-divider-${layout}`, `mb-divider-${type}`, `mb-divider-${align}`].join(' ');

    // Detect whether host has content nodes (light DOM children) before we overwrite innerHTML
    const hasContent = Array.from(this.childNodes).some(n => {
      if (n.nodeType === Node.COMMENT_NODE) return false;
      if (n.nodeType === Node.TEXT_NODE) return Boolean(n.textContent && n.textContent.trim());
      return true;
    });

    if (hasContent) {
      return this._html`<div class="${classes}"><div class="mb-divider-content"><slot></slot></div></div>`;
    }

    return this._html`<div class="${classes}"></div>`;
  }
}
