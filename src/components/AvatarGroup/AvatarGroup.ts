import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { AVATARGROUP_STYLES } from './AvatarGroup.styles.js';

export class MbAvatarGroup extends MbBaseComponent {
  protected static readonly _componentName = 'mb-avatargroup';
  protected static readonly _componentStyles = AVATARGROUP_STYLES;

  protected _render(): string {
    return this._html`
      <div part="root" class="mb-avatargroup mb-component"><slot part="items"></slot></div>
    `;
  }
}
