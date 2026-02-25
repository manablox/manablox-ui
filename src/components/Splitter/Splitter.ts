import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { SPLITTER_STYLES } from './Splitter.styles.js';

type SplitterLayout = 'horizontal' | 'vertical';
type SplitterStorage = 'local' | 'session';

type SplitterPanelConfig = {
  size: number | null;
  minSize: number;
  panel: MbSplitterPanel;
};

const HIDDEN_CONFIG_STYLES = ':host { display: none; }';

export class MbSplitterPanel extends MbBaseComponent {
  static readonly _componentName = 'mb-splitterpanel';
  static readonly _componentStyles = HIDDEN_CONFIG_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['size', 'number'],
      ['min-size', 'number'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  protected _render(): string {
    return '';
  }
}

export class MbSplitter extends MbBaseComponent {
  static readonly _componentName = 'mb-splitter';
  static readonly _componentStyles = SPLITTER_STYLES;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map([
      ['layout', 'string'],
      ['gutter-size', 'number'],
      ['state-key', 'string'],
      ['state-storage', 'string'],
      ['step', 'number'],
    ]);
  }

  static get observedAttributes(): string[] {
    return Array.from(this.attributeConverters.keys());
  }

  layout: SplitterLayout = 'horizontal';
  gutterSize = 4;
  stateKey: string | null = null;
  stateStorage: SplitterStorage = 'local';
  step = 5;

  #panels: SplitterPanelConfig[] = [];
  #sizes: number[] = [];
  #seeded = false;
  #dragCleanup: (() => void) | null = null;

  connectedCallback(): void {
    this.#seedPanels();
    this.#restoreState();
    super.connectedCallback();
    this._addCleanup(() => this.#stopDrag());
  }

  protected _render(): string {
    this.#ensureSizes();
    const isHorizontal = this.#layout === 'horizontal';
    const axisStyle = isHorizontal ? 'width' : 'height';
    const orientation = isHorizontal ? 'vertical' : 'horizontal';

    const children = this.#panels
      .map((panel, index) => {
        const basis = this.#sizes[index] ?? 0;
        const min = panel.minSize;
        const panelStyle = isHorizontal
          ? `flex: 0 0 ${basis}%;min-width:${min}%;`
          : `flex: 0 0 ${basis}%;min-height:${min}%;`;

        const panelHtml = `<div class="mb-splitterpanel" data-index="${index}" style="${panelStyle}">${panel.panel.innerHTML}</div>`;
        if (index === this.#panels.length - 1) {
          return panelHtml;
        }

        const gutter = `
          <div
            class="mb-splitter-gutter ${isHorizontal ? 'mb-splitter-gutter-horizontal' : 'mb-splitter-gutter-vertical'}"
            data-gutter-index="${index}"
            role="separator"
            aria-orientation="${orientation}"
            tabindex="0"
            style="${axisStyle}:${this.#gutterSize}px;"
          >
            <span class="mb-splitter-gutter-handle" aria-hidden="true"></span>
          </div>
        `;

        return `${panelHtml}${gutter}`;
      })
      .join('');

    return `<div class="mb-splitter mb-splitter-${this.#layout}">${children}</div>`;
  }

  protected _afterRender(): void {
    const root = this._qs<HTMLElement>('.mb-splitter');
    if (!root) return;

    const gutters = Array.from(root.querySelectorAll<HTMLElement>('.mb-splitter-gutter'));
    gutters.forEach(gutter => {
      const onPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        const index = Number(gutter.dataset.gutterIndex ?? '-1');
        if (index < 0) return;
        this.#startDrag(index, event);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        const index = Number(gutter.dataset.gutterIndex ?? '-1');
        if (index < 0) return;

        const key = event.key;
        const isHorizontal = this.#layout === 'horizontal';
        const dec = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
        const inc = isHorizontal ? 'ArrowRight' : 'ArrowDown';

        if (key !== dec && key !== inc) return;
        event.preventDefault();
        const delta = key === inc ? this.#step : -this.#step;
        this.#resizeByStep(index, delta);
      };

      gutter.addEventListener('pointerdown', onPointerDown);
      gutter.addEventListener('keydown', onKeyDown);
      this._addCleanup(() => gutter.removeEventListener('pointerdown', onPointerDown));
      this._addCleanup(() => gutter.removeEventListener('keydown', onKeyDown));
    });
  }

  get #layout(): SplitterLayout {
    return this.layout === 'vertical' ? 'vertical' : 'horizontal';
  }

  get #gutterSize(): number {
    return Number.isFinite(this.gutterSize) ? Math.max(1, this.gutterSize) : 4;
  }

  get #step(): number {
    return Number.isFinite(this.step) ? Math.max(1, this.step) : 5;
  }

  #seedPanels(): void {
    if (this.#seeded) return;
    const panels = Array.from(this._qsaLight<MbSplitterPanel>('mb-splitterpanel'));
    if (!panels.length) return;

    this.#panels = panels.map(panel => {
      const sizeAttr = panel.getAttribute('size');
      const minAttr = panel.getAttribute('min-size');
      const size = sizeAttr == null ? null : Number(sizeAttr);
      const minSizeRaw = minAttr == null ? 0 : Number(minAttr);
      const minSize = Number.isFinite(minSizeRaw) ? Math.max(0, minSizeRaw) : 0;

      return {
        size: Number.isFinite(size) ? Number(size) : null,
        minSize,
        panel,
      };
    });

    this.#seeded = true;
  }

  #ensureSizes(): void {
    if (!this.#panels.length) return;
    if (this.#sizes.length === this.#panels.length) return;

    const provided = this.#panels.map(panel => panel.size ?? 0);
    const hasProvided = provided.some(value => value > 0);
    const totalPanels = this.#panels.length;

    if (!hasProvided) {
      this.#sizes = Array.from({ length: totalPanels }, () => 100 / totalPanels);
      return;
    }

    const total = provided.reduce((sum, value) => sum + value, 0);
    if (total <= 0) {
      this.#sizes = Array.from({ length: totalPanels }, () => 100 / totalPanels);
      return;
    }

    this.#sizes = provided.map(value => (value / total) * 100);
  }

  #startDrag(gutterIndex: number, event: PointerEvent): void {
    const root = this._qs<HTMLElement>('.mb-splitter');
    if (!root) return;

    this.#stopDrag();

    const rect = root.getBoundingClientRect();
    const totalPixels = this.#layout === 'horizontal' ? rect.width : rect.height;
    if (totalPixels <= 0) return;

    const startPoint = this.#layout === 'horizontal' ? event.clientX : event.clientY;
    const leftStart = this.#sizes[gutterIndex] ?? 0;
    const rightStart = this.#sizes[gutterIndex + 1] ?? 0;

    const onMove = (moveEvent: PointerEvent) => {
      const point = this.#layout === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
      const deltaPx = point - startPoint;
      const deltaPct = (deltaPx / totalPixels) * 100;
      this.#resizePair(gutterIndex, leftStart + deltaPct, rightStart - deltaPct, true);
    };

    const onUp = () => {
      this.#stopDrag();
      this.#persistState();
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);

    this.#dragCleanup = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this.#dragCleanup = null;
    };
  }

  #stopDrag(): void {
    this.#dragCleanup?.();
    this.#dragCleanup = null;
  }

  #resizeByStep(gutterIndex: number, delta: number): void {
    const left = this.#sizes[gutterIndex] ?? 0;
    const right = this.#sizes[gutterIndex + 1] ?? 0;
    this.#resizePair(gutterIndex, left + delta, right - delta, true);
    this.#persistState();
  }

  #resizePair(gutterIndex: number, requestedLeft: number, _requestedRight: number, emitEvent: boolean): void {
    const leftPanel = this.#panels[gutterIndex];
    const rightPanel = this.#panels[gutterIndex + 1];
    if (!leftPanel || !rightPanel) return;

    const currentLeft = this.#sizes[gutterIndex] ?? 0;
    const currentRight = this.#sizes[gutterIndex + 1] ?? 0;
    const total = currentLeft + currentRight;

    const minLeft = Math.max(0, leftPanel.minSize);
    const minRight = Math.max(0, rightPanel.minSize);
    const maxLeft = total - minRight;
    const nextLeft = Math.min(Math.max(requestedLeft, minLeft), maxLeft);
    const nextRight = total - nextLeft;

    if (Math.abs(nextLeft - currentLeft) < 0.001 && Math.abs(nextRight - currentRight) < 0.001) {
      return;
    }

    this.#sizes[gutterIndex] = nextLeft;
    this.#sizes[gutterIndex + 1] = nextRight;
    this._scheduleRender();

    if (emitEvent) {
      this.emit('mb-resize', { sizes: [...this.#sizes] });
    }
  }

  #storage(): Storage | null {
    if (!this.stateKey) return null;
    if (this.stateStorage === 'session') return window.sessionStorage;
    return window.localStorage;
  }

  #persistState(): void {
    if (!this.stateKey || !this.#sizes.length) return;
    try {
      this.#storage()?.setItem(this.stateKey, JSON.stringify(this.#sizes));
    } catch {
      // ignore storage errors
    }
  }

  #restoreState(): void {
    if (!this.stateKey || !this.#panels.length) return;
    try {
      const raw = this.#storage()?.getItem(this.stateKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed) || parsed.length !== this.#panels.length) return;

      const candidate = parsed
        .map(item => Number(item))
        .filter(value => Number.isFinite(value));
      if (candidate.length !== this.#panels.length) return;

      const sum = candidate.reduce((acc, value) => acc + value, 0);
      if (sum <= 0) return;

      this.#sizes = candidate.map(value => (value / sum) * 100);
    } catch {
      // ignore restore errors
    }
  }
}
