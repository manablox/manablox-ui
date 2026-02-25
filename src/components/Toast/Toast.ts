import type { AttributeConverter, ToastMessage } from '../../core/types.js';
import type { Unsubscribe } from '../../services/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { toastService } from '../../services/ToastService.js';
import { TOAST_STYLES } from './Toast.styles.js';

type Positioned = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center';

type RenderMessage = ToastMessage & {
  id: string;
  leaving?: boolean;
};

export class MbToast extends MbBaseComponent {
  static readonly _componentName = 'mb-toast';
  static readonly _componentStyles = TOAST_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['position', 'string'],
      ['group', 'string'],
      ['base-z-index', 'number'],
      ['break-points', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  position: Positioned = 'top-right';
  group = '';
  baseZIndex = 1000;
  breakPoints: Record<string, string> | null = null;

  #messages: RenderMessage[] = [];
  #unsubscribe: Unsubscribe | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    this.#unsubscribe = toastService.subscribe(state => {
      const filtered = state.messages.filter(msg => {
        if (!this.group) return true;
        return msg.group === this.group;
      });

      const nextById = new Map(filtered.map(msg => [String(msg.id), msg]));
      const currentIds = new Set(this.#messages.map(msg => msg.id));
      const nextIds = new Set(Array.from(nextById.keys()));

      this.#messages = this.#messages
        .map(current => {
          if (!nextIds.has(current.id) && !current.leaving) {
            return { ...current, leaving: true };
          }
          if (nextIds.has(current.id)) {
            return { ...current, ...nextById.get(current.id), id: current.id, leaving: false };
          }
          return current;
        })
        .concat(
          Array.from(nextById.entries())
            .filter(([id]) => !currentIds.has(id))
            .map(([id, msg]) => ({ ...msg, id, leaving: false }))
        );

      this._scheduleRender();

      const leaveDuration = this.#transitionDurationMs();
      this.#messages
        .filter(msg => msg.leaving)
        .forEach(msg => {
          window.setTimeout(() => {
            const stillLeaving = this.#messages.find(item => item.id === msg.id && item.leaving);
            if (stillLeaving) {
              this.#messages = this.#messages.filter(item => item.id !== msg.id);
              this._scheduleRender();
            }
          }, leaveDuration);
        });
    });
  }

  disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    super.disconnectedCallback();
  }

  protected _render(): string {
    const position = this.#positionClass();
    const zIndex = Number.isFinite(this.baseZIndex) ? this.baseZIndex : 1000;

    return `
      <div class="mb-toast ${position}" style="z-index:${zIndex};" aria-live="polite" aria-atomic="true">
        ${this.#messages.map(message => this.#renderMessage(message)).join('')}
      </div>
    `;
  }

  protected _afterRender(): void {
    const root = this._qs<HTMLElement>('.mb-toast');
    if (!root) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>('.mb-toast-close-button');
      if (!button) return;

      const id = button.dataset.id;
      if (id) {
        toastService.remove(id);
      }
    };

    root.addEventListener('click', onClick);
    this._addCleanup(() => root.removeEventListener('click', onClick));
  }

  #renderMessage(message: RenderMessage): string {
    const severity = message.severity ?? 'info';
    const icon = this.#iconForSeverity(severity);
    const leaveClass = message.leaving ? ' mb-toast-leave' : '';

    return `
      <div class="mb-toast-message mb-toast-message-${this._escape(severity)}${leaveClass}" role="alert" data-id="${this._escape(message.id)}">
        <div class="mb-toast-message-content">
          <span class="mb-toast-message-icon" aria-hidden="true">${icon}</span>
          <div class="mb-toast-message-text">
            <span class="mb-toast-message-summary">${this._escape(message.summary ?? '')}</span>
            <span class="mb-toast-message-detail">${this._escape(message.detail ?? '')}</span>
          </div>
          ${message.closable === false ? '' : `<button type="button" class="mb-toast-close-button" data-id="${this._escape(message.id)}" aria-label="Close toast">✕</button>`}
        </div>
      </div>
    `;
  }

  #positionClass(): string {
    const value = this.getAttribute('position') || this.position || 'top-right';
    const allowed: Positioned[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center', 'center'];
    const normalized = allowed.includes(value as Positioned) ? (value as Positioned) : 'top-right';
    return `mb-toast-${normalized}`;
  }

  #iconForSeverity(severity: string): string {
    if (severity === 'success') return '✔';
    if (severity === 'warn') return '⚠';
    if (severity === 'error') return '⨯';
    if (severity === 'secondary') return '●';
    if (severity === 'contrast') return '◈';
    return 'ℹ';
  }

  #transitionDurationMs(): number {
    const styles = getComputedStyle(document.documentElement);
    const raw = styles.getPropertyValue('--mb-toast-transition-duration').trim();
    if (!raw) return 200;
    if (raw.endsWith('ms')) return Number(raw.replace('ms', '')) || 200;
    if (raw.endsWith('s')) return (Number(raw.replace('s', '')) || 0.2) * 1000;
    return 200;
  }
}
