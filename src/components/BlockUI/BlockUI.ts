import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { BLOCKUI_STYLES } from './BlockUI.styles.js';

export class MbBlockUI extends MbBaseComponent {
  protected static readonly _componentName = 'mb-blockui';
  protected static readonly _componentStyles = BLOCKUI_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['blocked', 'boolean'],
      ['full-screen', 'boolean'],
      ['base-z-index', 'number'],
    ] as const);
  }

  blocked = false;
  fullScreen = false;
  baseZIndex: number | null = null;

  static get observedAttributes() {
    return Array.from((this as any).attributeConverters.keys());
  }

  protected _render(): string {
    const isBlocked = this.blocked;
    const isFull = this.fullScreen;
    const z = this.baseZIndex ?? this._num('base-z-index', 1000) ?? 1000;
    const containerClass = isFull ? 'mb-blockui mb-blockui-fullscreen mb-component' : 'mb-blockui mb-component';

    return this._html`
      <div class="${containerClass}" ${isFull ? '' : 'style="position:relative"'}>
        <div class="mb-blockui-content"><slot></slot></div>
        ${isBlocked ? `<div class="mb-blockui-mask" style="z-index:${this._escape(z)}"></div>` : ''}
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }
}
