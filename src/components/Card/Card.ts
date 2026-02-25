import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { CARD_STYLES } from './Card.styles.js';

export class MbCard extends MbBaseComponent {
  protected static readonly _componentName = 'mb-card';
  protected static readonly _componentStyles = CARD_STYLES;

  constructor() {
    super();
  }

  protected _render(): string {
    const header = this._escape(this.getAttribute('header'));
    const title = this._escape(this.getAttribute('title'));
    const subtitle = this._escape(this.getAttribute('subtitle'));
    const footer = this._escape(this.getAttribute('footer'));

    return this._html`
      <div class="mb-card mb-component">
        <div class="mb-card-header"><slot name="header">${header}</slot></div>
        <div class="mb-card-body">
          <div class="mb-card-title"><slot name="title">${title}</slot></div>
          <div class="mb-card-subtitle"><slot name="subtitle">${subtitle}</slot></div>
          <div class="mb-card-content"><slot></slot></div>
        </div>
        <div class="mb-card-footer"><slot name="footer">${footer}</slot></div>
      </div>
    `;
  }
}
