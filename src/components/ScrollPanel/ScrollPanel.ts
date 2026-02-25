import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { SCROLLPANEL_STYLES } from './ScrollPanel.styles.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

export class MbScrollPanel extends MbBaseComponent {
  static readonly _componentName = 'mb-scrollpanel';
  static readonly _componentStyles = SCROLLPANEL_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['style', 'string'],
      ['step', 'number'],
      ['dt', 'object'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(MbScrollPanel.attributeConverters.keys());
  }

  #listenersBound = false;
  #dragAxis: 'x' | 'y' | null = null;
  #dragStartClient = 0;
  #dragStartScroll = 0;
  #removeDragListeners: (() => void) | null = null;

  get step(): number {
    const n = this._num('step', 5);
    return n ?? 5;
  }

  get dt(): Record<string, unknown> {
    return this._obj<Record<string, unknown>>('dt') ?? {};
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.#listenersBound) return;
    this.#listenersBound = true;

    const onMouseDown = (event: MouseEvent) => this.#onMouseDown(event);
    const onClick = (event: MouseEvent) => this.#onTrackClick(event);

    this.addEventListener('mousedown', onMouseDown);
    this.addEventListener('click', onClick);

    this._addCleanup(() => this.removeEventListener('mousedown', onMouseDown));
    this._addCleanup(() => this.removeEventListener('click', onClick));
    this._addCleanup(() => this.#removeDragListeners?.());
  }

  protected _render(): string {
    const inline = this._str('style');
    const tokenVars = this.#dtToCssVars(this.dt);
    const rootStyle = [inline, tokenVars].filter(Boolean).join(';');

    return this._html`
      <div class="mb-scrollpanel" style="${this._escape(rootStyle)}">
        <div class="mb-scrollpanel-wrapper">
          <div class="mb-scrollpanel-content"><slot></slot></div>
        </div>
        <div class="mb-scrollpanel-track mb-scrollpanel-track-x" data-track="x"></div>
        <div class="mb-scrollpanel-track mb-scrollpanel-track-y" data-track="y"></div>
        <div class="mb-scrollpanel-bar mb-scrollpanel-bar-x" role="presentation"></div>
        <div class="mb-scrollpanel-bar mb-scrollpanel-bar-y" role="presentation"></div>
      </div>
    `.trim();
  }

  protected _afterRender(): void {
    const content = this._qs<HTMLElement>('.mb-scrollpanel-content');
    const barX = this._qs<HTMLElement>('.mb-scrollpanel-bar-x');
    const barY = this._qs<HTMLElement>('.mb-scrollpanel-bar-y');
    const trackX = this._qs<HTMLElement>('.mb-scrollpanel-track-x');
    const trackY = this._qs<HTMLElement>('.mb-scrollpanel-track-y');
    if (!content || !barX || !barY) return;

    const sync = () => {
      const maxH = content.scrollHeight - content.clientHeight;
      const maxW = content.scrollWidth - content.clientWidth;

      if (maxH > 0) {
        const yPct = content.scrollTop / maxH;
        const trackHeight = content.clientHeight;
        const thumbHeight = Math.max(24, (content.clientHeight / content.scrollHeight) * trackHeight);
        const top = yPct * (trackHeight - thumbHeight);
        barY.style.top = `${top}px`;
        barY.style.height = `${thumbHeight}px`;
        barY.style.display = '';
        if (trackY) trackY.style.display = '';
      } else {
        barY.style.display = 'none';
        if (trackY) trackY.style.display = 'none';
      }

      if (maxW > 0) {
        const xPct = content.scrollLeft / maxW;
        const trackWidth = content.clientWidth;
        const thumbWidth = Math.max(24, (content.clientWidth / content.scrollWidth) * trackWidth);
        const left = xPct * (trackWidth - thumbWidth);
        barX.style.left = `${left}px`;
        barX.style.width = `${thumbWidth}px`;
        barX.style.display = '';
        if (trackX) trackX.style.display = '';
      } else {
        barX.style.display = 'none';
        if (trackX) trackX.style.display = 'none';
      }
    };

    const onScroll = () => sync();
    content.addEventListener('scroll', onScroll);
    this._addCleanup(() => content.removeEventListener('scroll', onScroll));

    // initial sync
    sync();

    // resize observer to keep bars in sync
    const ro = new ResizeObserver(() => sync());
    ro.observe(content);
    this._addCleanup(() => ro.disconnect());
  }

  #onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const content = this._qs<HTMLElement>('.mb-scrollpanel-content');
    const barX = target.closest<HTMLElement>('.mb-scrollpanel-bar-x');
    const barY = target.closest<HTMLElement>('.mb-scrollpanel-bar-y');
    if (!content || (!barX && !barY)) return;

    event.preventDefault();
    this.#dragAxis = barX ? 'x' : 'y';
    this.#dragStartClient = barX ? event.clientX : event.clientY;
    this.#dragStartScroll = barX ? content.scrollLeft : content.scrollTop;

    const onMove = (moveEvent: MouseEvent) => {
      if (!this.#dragAxis) return;
      const delta = (this.#dragAxis === 'x' ? moveEvent.clientX : moveEvent.clientY) - this.#dragStartClient;
      if (this.#dragAxis === 'x') {
        const maxScroll = content.scrollWidth - content.clientWidth;
        const track = content.clientWidth - (barX?.offsetWidth ?? 0);
        if (track > 0) content.scrollLeft = this.#dragStartScroll + (delta / track) * maxScroll;
      } else {
        const maxScroll = content.scrollHeight - content.clientHeight;
        const track = content.clientHeight - (barY?.offsetHeight ?? 0);
        if (track > 0) content.scrollTop = this.#dragStartScroll + (delta / track) * maxScroll;
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      this.#dragAxis = null;
      this.#removeDragListeners = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    this.#removeDragListeners = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }

  #onTrackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const trackX = target.closest<HTMLElement>('.mb-scrollpanel-track-x');
    const trackY = target.closest<HTMLElement>('.mb-scrollpanel-track-y');
    if (!trackX && !trackY) return;

    const content = this._qs<HTMLElement>('.mb-scrollpanel-content');
    const barX = this._qs<HTMLElement>('.mb-scrollpanel-bar-x');
    const barY = this._qs<HTMLElement>('.mb-scrollpanel-bar-y');
    if (!content || !barX || !barY) return;

    if (trackX) {
      const rect = trackX.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / Math.max(1, rect.width);
      content.scrollLeft = ratio * (content.scrollWidth - content.clientWidth);
    }

    if (trackY) {
      const rect = trackY.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / Math.max(1, rect.height);
      content.scrollTop = ratio * (content.scrollHeight - content.clientHeight);
    }
  }

  #dtToCssVars(dt: Record<string, unknown>): string {
    const vars: string[] = [];
    const walk = (value: unknown, path: string[]): void => {
      if (value == null) return;
      if (typeof value === 'string' || typeof value === 'number') {
        vars.push(`--mb-scrollpanel-${path.join('-')}:${String(value)}`);
        return;
      }
      if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
          walk(child, [...path, key]);
        });
      }
    };

    walk(dt, []);
    return vars.join(';');
  }
}

export const defineScrollPanel = createDefine('mb-scrollpanel', MbScrollPanel);
export {};
