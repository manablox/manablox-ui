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
      <div part="root" class="mb-card mb-component">
        <div part="header" class="mb-card-header"><slot name="header" part="header-slot">${header}</slot></div>
        <div part="body" class="mb-card-body">
          <div part="title" class="mb-card-title"><slot name="title" part="title-slot">${title}</slot></div>
          <div part="subtitle" class="mb-card-subtitle"><slot name="subtitle" part="subtitle-slot">${subtitle}</slot></div>
          <div part="content" class="mb-card-content"><slot part="content-slot"></slot></div>
        </div>
        <div part="footer" class="mb-card-footer"><slot name="footer" part="footer-slot">${footer}</slot></div>
      </div>
    `;
  }
}
