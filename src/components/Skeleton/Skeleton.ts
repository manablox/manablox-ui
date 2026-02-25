import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { SKELETON_STYLES } from './Skeleton.styles.js';

export class MbSkeleton extends MbBaseComponent {
  protected static readonly _componentName = 'mb-skeleton';
  protected static readonly _componentStyles = SKELETON_STYLES;

  protected static get attributeConverters() {
    return new Map([
      ['shape', 'string'],
      ['width', 'string'],
      ['height', 'string'],
      ['border-radius', 'string'],
      ['animation', 'string'],
    ] as const);
  }

  shape: 'rectangle' | 'circle' | string = 'rectangle';
  width = '100%';
  height = '1rem';
  borderRadius: string | null = null;
  animation: 'wave' | 'none' | string = 'wave';

  protected _render(): string {
    const circleClass = this.shape === 'circle' ? ' mb-skeleton-circle' : '';
    const noAnimClass = this.animation === 'none' ? ' no-animation' : '';
    const br = this.borderRadius ? this._escape(this.borderRadius) : '';

    return this._html`
      <div class="mb-skeleton mb-component${circleClass}${noAnimClass}" style="width:${this._escape(this.width)};height:${this._escape(this.height)};${br ? `border-radius:${br};` : ''}"></div>
    `;
  }
}
