import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { TOOLBAR_STYLES } from './Toolbar.styles.js';

export class MbToolbar extends MbBaseComponent {
  protected static readonly _componentName = 'mb-toolbar';
  protected static readonly _componentStyles = TOOLBAR_STYLES;

  constructor() {
    super();
  }

  protected _render(): string {
    return this._html`
      <div class="mb-toolbar mb-component" role="toolbar">
        <div class="mb-toolbar-start"><slot name="start"></slot></div>
        <div class="mb-toolbar-center"><slot name="center"></slot></div>
        <div class="mb-toolbar-end"><slot name="end"></slot></div>
      </div>
    `;
  }
}
