import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { DEFERREDCONTENT_STYLES } from './DeferredContent.styles.js';

export class MbDeferredContent extends MbBaseComponent {
  protected static readonly _componentName = 'mb-deferredcontent';
  protected static readonly _componentStyles = DEFERREDCONTENT_STYLES;

  protected _loaded = false;
  #observer: IntersectionObserver | null = null;

  protected _render(): string {
    const loadedClass = this._loaded ? ' mb-deferredcontent-loaded' : '';
    const content = this._loaded ? '<slot></slot>' : '';

    return this._html`
      <div class="mb-deferredcontent${loadedClass}">
        <div class="mb-deferredcontent-wrapper">${content}</div>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected _afterRender(): void {
    if (this._loaded) return;

    if (!this.#observer) {
      this.#observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this._loaded = true;
            this.emit('mb-load');
            this.#observer?.disconnect();
            this.#observer = null;
            this._scheduleRender();
            break;
          }
        }
      });

      this.#observer.observe(this);
      this._addCleanup(() => {
        this.#observer?.disconnect();
        this.#observer = null;
      });
    }
  }
}
