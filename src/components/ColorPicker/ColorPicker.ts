import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { COLORPICKER_STYLES } from './ColorPicker.styles.js';

type ColorFormat = 'hex' | 'rgb' | 'hsb';

interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

export class MbColorPicker extends MbBaseComponent {
	static readonly _componentName = 'mb-colorpicker';
	static readonly _componentStyles = COLORPICKER_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'string'],
			['inline', 'boolean'],
			['format', 'string'],
			['disabled', 'boolean'],
			['transparent', 'boolean'],
			['append-to', 'string'],
			['panel-class', 'string'],
			['input-id', 'string'],
			['auto-z-index', 'boolean'],
			['base-z-index', 'number'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbColorPicker.attributeConverters.keys());
	}

	value = '#ff0000';
	inline = false;
	format: ColorFormat = 'hex';
	disabled = false;
	transparent = false;
	appendTo = '';
	panelClass = '';
	inputId = '';
	autoZIndex = true;
	baseZIndex = 0;

	#listenersBound = false;
	#portalKey = `mb-colorpicker-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;

	#hue = 0;
	#saturation = 100;
	#brightness = 100;
	#alpha = 1;

	#removeDragListeners: (() => void) | null = null;
	#hasSyncedFromValue = false;

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onClick(event);
		const onInput = (event: Event) => this.#onInput(event);
		const onMouseDown = (event: MouseEvent) => this.#onMouseDown(event);
		const onTouchStart = (event: TouchEvent) => this.#onTouchStart(event);
		const onKeyDown = (event: KeyboardEvent) => this.#onKeyDown(event);

		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('mousedown', onMouseDown);
		this.addEventListener('touchstart', onTouchStart, { passive: false });
		this.addEventListener('keydown', onKeyDown);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('mousedown', onMouseDown));
		this._addCleanup(() => this.removeEventListener('touchstart', onTouchStart));
		this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => this.#cleanupOverlay(false));
		this._addCleanup(() => this.#removeDragListeners?.());
	}

	disconnectedCallback(): void {
		this.#cleanupOverlay(false);
		super.disconnectedCallback();
	}

	protected _render(): string {
		if (!this.#hasSyncedFromValue) {
			this.#syncFromValue(this.value);
			this.#hasSyncedFromValue = true;
		}

		const preview = this.#formatRgba(this.#hsbToRgba(this.#hue, this.#saturation, this.#brightness, this.#alpha));
		const classes = ['mb-colorpicker', this.disabled ? 'mb-colorpicker-disabled' : ''].filter(Boolean).join(' ');

		if (this.inline) {
			return this._html`
				<div class="${classes}" ${this.inputId ? `id="${this._escape(this.inputId)}"` : ''}>
					<div class="mb-colorpicker-preview" style="background:${preview}"></div>
					${this.#panelMarkup()}
				</div>
			`;
		}

		return this._html`
			<div class="${classes}" ${this.inputId ? `id="${this._escape(this.inputId)}"` : ''} tabindex="${this._num('tab-index', 0) ?? 0}">
				<button
					type="button"
					class="mb-colorpicker-preview"
					style="background:${preview}"
					aria-label="Color picker"
					${this.disabled ? 'disabled' : ''}
				></button>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen && !this.inline) {
			this.#renderOverlay();
		}
	}

	#onClick(event: Event): void {
		const target = event.target as HTMLElement;

		if (target.closest('.mb-colorpicker-preview') && !this.inline && !this.disabled) {
			event.preventDefault();
			this.#isOpen ? this.#hidePanel(true) : this.#showPanel();
			return;
		}

		if (target.closest('[data-action="apply-input"]')) {
			this.#emitChange();
			return;
		}
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (!target) return;

		if (target.matches('.mb-colorpicker-hex-input')) {
			this.#setFromTextValue(target.value);
			return;
		}

		if (target.matches('[data-rgb]')) {
			const container = (target.closest('.mb-colorpicker-inputs') ?? this) as HTMLElement;
			const r = Number((container.querySelector('[data-rgb="r"]') as HTMLInputElement | null)?.value ?? 0);
			const g = Number((container.querySelector('[data-rgb="g"]') as HTMLInputElement | null)?.value ?? 0);
			const b = Number((container.querySelector('[data-rgb="b"]') as HTMLInputElement | null)?.value ?? 0);
			const [h, s, v] = this.#rgbToHsv(this.#clamp(r, 0, 255), this.#clamp(g, 0, 255), this.#clamp(b, 0, 255));
			this.#hue = h;
			this.#saturation = s;
			this.#brightness = v;
			this.#emitChange();
		}
	}

	#onMouseDown(event: MouseEvent): void {
		if (this.disabled) return;
		const target = event.target as HTMLElement;
		const panelRoot = this.#overlayRootOrSelf();
		if (!panelRoot) return;

		const sb = target.closest('.mb-colorpicker-hue-bg') as HTMLElement | null;
		const hue = target.closest('.mb-colorpicker-hue-slider') as HTMLElement | null;
		const alpha = target.closest('.mb-colorpicker-alpha-slider') as HTMLElement | null;

		if (sb) {
			event.preventDefault();
			this.#startDrag('sb', event.clientX, event.clientY, sb);
			return;
		}
		if (hue) {
			event.preventDefault();
			this.#startDrag('hue', event.clientX, event.clientY, hue);
			return;
		}
		if (alpha) {
			event.preventDefault();
			this.#startDrag('alpha', event.clientX, event.clientY, alpha);
		}
	}

	#onTouchStart(event: TouchEvent): void {
		if (this.disabled || event.touches.length === 0) return;
		const touch = event.touches[0];
		if (!touch) return;
		const target = event.target as HTMLElement;
		const sb = target.closest('.mb-colorpicker-hue-bg') as HTMLElement | null;
		const hue = target.closest('.mb-colorpicker-hue-slider') as HTMLElement | null;
		const alpha = target.closest('.mb-colorpicker-alpha-slider') as HTMLElement | null;

		if (sb || hue || alpha) {
			event.preventDefault();
			this.#startDrag(sb ? 'sb' : hue ? 'hue' : 'alpha', touch.clientX, touch.clientY, (sb || hue || alpha) as HTMLElement);
		}
	}

	#onKeyDown(event: KeyboardEvent): void {
		if (this.disabled || this.inline) return;
		if ((event.key === 'Enter' || event.key === ' ') && !this.#isOpen) {
			event.preventDefault();
			this.#showPanel();
			return;
		}
		if (event.key === 'Escape' && this.#isOpen) {
			event.preventDefault();
			this.#hidePanel(true);
		}
	}

	#showPanel(): void {
		if (this.#isOpen || this.inline) return;
		this.#isOpen = true;
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#renderOverlay();

		const trigger = this._qs<HTMLElement>('.mb-colorpicker-preview');
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-colorpicker-panel');
		if (trigger && panel) {
			this.#positionCleanup = startAutoPosition(trigger, panel, {
				placement: 'bottom-start',
				offsetDistance: 4,
			});
		}

		const onDocDown = (docEvent: MouseEvent) => {
			const target = docEvent.target as Node;
			if (this.contains(target)) return;
			if (this.#portalHost?.contains(target)) return;
			this.#hidePanel(true);
		};
		document.addEventListener('mousedown', onDocDown, true);
		this.#outsideCleanup = () => document.removeEventListener('mousedown', onDocDown, true);

		this.emit('mb-show');
		this._scheduleRender();
	}

	#hidePanel(emitEvent: boolean): void {
		if (!this.#isOpen && !this.#portalHost) return;
		this.#cleanupOverlay(emitEvent);
		this._scheduleRender();
	}

	#cleanupOverlay(emitEvent: boolean): void {
		this.#isOpen = false;
		this.#positionCleanup?.();
		this.#positionCleanup = null;
		this.#outsideCleanup?.();
		this.#outsideCleanup = null;
		removePortal(this.#portalKey);
		this.#portalHost = null;
		if (emitEvent) this.emit('mb-hide');
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;
		this.#portalHost.innerHTML = this.#panelMarkup();
	}

	#panelMarkup(): string {
		const hueColor = `hsl(${this.#hue}, 100%, 50%)`;
		const satX = `${this.#saturation}%`;
		const satY = `${100 - this.#brightness}%`;
		const hueX = `${(this.#hue / 360) * 100}%`;
		const alphaX = `${this.#alpha * 100}%`;
		const rgba = this.#hsbToRgba(this.#hue, this.#saturation, this.#brightness, this.#alpha);
		const hex = this.#rgbaToHex(rgba.r, rgba.g, rgba.b);

		return this._html`
			<div class="mb-colorpicker-panel ${this._escape(this.panelClass || '')}">
				<div class="mb-colorpicker-hue-bg" style="background:${hueColor}">
					<div
						class="mb-colorpicker-saturation-lightness"
						style="background:linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)"
					>
						<span class="mb-colorpicker-color-handle" style="left:${satX};top:${satY}"></span>
					</div>
				</div>

				<div class="mb-colorpicker-hue-slider">
					<span class="mb-colorpicker-hue-handle" style="left:${hueX}"></span>
				</div>

				${
					this.transparent
						? `<div class="mb-colorpicker-alpha-slider" style="background:linear-gradient(to right, rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0), rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 1))"><span class="mb-colorpicker-alpha-handle" style="left:${alphaX}"></span></div>`
						: ''
				}

				<div class="mb-colorpicker-inputs">
					${
						this.format === 'hex'
							? `<input class="mb-colorpicker-hex-input" value="${this._escape(hex)}" />`
							: `<div class="mb-colorpicker-rgb-inputs"><input data-rgb="r" type="number" min="0" max="255" value="${rgba.r}" /><input data-rgb="g" type="number" min="0" max="255" value="${rgba.g}" /><input data-rgb="b" type="number" min="0" max="255" value="${rgba.b}" /></div>`
					}
				</div>
			</div>
		`;
	}

	#startDrag(mode: 'sb' | 'hue' | 'alpha', x: number, y: number, zone: HTMLElement): void {
		this.#updateDrag(mode, x, y, zone);

		const onMove = (event: MouseEvent) => this.#updateDrag(mode, event.clientX, event.clientY, zone);
		const onUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			this.#removeDragListeners = null;
		};

		const onTouchMove = (event: TouchEvent) => {
			if (event.touches.length === 0) return;
			event.preventDefault();
			const touch = event.touches[0];
			if (!touch) return;
			this.#updateDrag(mode, touch.clientX, touch.clientY, zone);
		};
		const onTouchEnd = () => {
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			this.#removeDragListeners = null;
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd);

		this.#removeDragListeners = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
		};
	}

	#updateDrag(mode: 'sb' | 'hue' | 'alpha', clientX: number, clientY: number, zone: HTMLElement): void {
		const rect = zone.getBoundingClientRect();
		if (mode === 'sb') {
			const s = ((clientX - rect.left) / rect.width) * 100;
			const b = (1 - (clientY - rect.top) / rect.height) * 100;
			this.#saturation = this.#clamp(s, 0, 100);
			this.#brightness = this.#clamp(b, 0, 100);
		} else if (mode === 'hue') {
			const h = ((clientX - rect.left) / rect.width) * 360;
			this.#hue = this.#clamp(h, 0, 360);
		} else {
			const a = (clientX - rect.left) / rect.width;
			this.#alpha = this.#clamp(a, 0, 1);
		}

		this.#emitChange();
	}

	#setFromTextValue(input: string): void {
		const parsed = this.#parseColor(input);
		if (!parsed) return;
		const [h, s, v] = this.#rgbToHsv(parsed.r, parsed.g, parsed.b);
		this.#hue = h;
		this.#saturation = s;
		this.#brightness = v;
		this.#alpha = parsed.a;
		this.#emitChange();
	}

	#emitChange(): void {
		const rgba = this.#hsbToRgba(this.#hue, this.#saturation, this.#brightness, this.#alpha);
		const output = this.#formatValue(rgba);
		this.value = output;
		this._reflectToAttr('value', output, 'string');
		this.emit('mb-change', { value: output });

		if (this.#isOpen && !this.inline) {
			this.#renderOverlay();
		}
		this._scheduleRender();
	}

	#syncFromValue(raw: string): void {
		const parsed = this.#parseColor(raw);
		if (!parsed) return;
		const [h, s, v] = this.#rgbToHsv(parsed.r, parsed.g, parsed.b);
		this.#hue = h;
		this.#saturation = s;
		this.#brightness = v;
		this.#alpha = parsed.a;
	}

	#overlayRootOrSelf(): HTMLElement | null {
		return this.#portalHost?.querySelector('.mb-colorpicker-panel') ?? this._qs<HTMLElement>('.mb-colorpicker-panel');
	}

	#formatValue(rgba: Rgba): string {
		if (this.format === 'rgb') {
			return this.#formatRgba(rgba);
		}
		if (this.format === 'hsb') {
			return `hsb(${Math.round(this.#hue)}, ${Math.round(this.#saturation)}%, ${Math.round(this.#brightness)}%${this.transparent ? `, ${this.#alpha.toFixed(2)}` : ''})`;
		}
		if (this.transparent && rgba.a < 1) {
			return this.#formatRgba(rgba);
		}
		return this.#rgbaToHex(rgba.r, rgba.g, rgba.b);
	}

	#parseColor(input: string): Rgba | null {
		const value = (input || '').trim();
		if (!value) return null;

		const hexMatch = value.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
		if (hexMatch) {
			let hex = hexMatch[1] ?? '';
			if (hex.length === 3) {
				hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
			}
			return {
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16),
				a: 1,
			};
		}

		const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
		if (rgbMatch) {
			const rawParts = (rgbMatch[1] ?? '').split(',').map(part => Number(part.trim()));
			if (rawParts.length >= 3) {
				return {
					r: this.#clamp(rawParts[0] ?? 0, 0, 255),
					g: this.#clamp(rawParts[1] ?? 0, 0, 255),
					b: this.#clamp(rawParts[2] ?? 0, 0, 255),
					a: this.#clamp(rawParts[3] ?? 1, 0, 1),
				};
			}
		}

		return null;
	}

	#hsbToRgba(h: number, s: number, v: number, a: number): Rgba {
		const sat = s / 100;
		const val = v / 100;
		const c = val * sat;
		const hh = (h % 360) / 60;
		const x = c * (1 - Math.abs((hh % 2) - 1));
		let r = 0;
		let g = 0;
		let b = 0;

		if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0];
		else if (hh < 2) [r, g, b] = [x, c, 0];
		else if (hh < 3) [r, g, b] = [0, c, x];
		else if (hh < 4) [r, g, b] = [0, x, c];
		else if (hh < 5) [r, g, b] = [x, 0, c];
		else [r, g, b] = [c, 0, x];

		const m = val - c;
		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
			a: this.#clamp(a, 0, 1),
		};
	}

	#rgbToHsv(r: number, g: number, b: number): [number, number, number] {
		const rn = r / 255;
		const gn = g / 255;
		const bn = b / 255;
		const max = Math.max(rn, gn, bn);
		const min = Math.min(rn, gn, bn);
		const delta = max - min;
		let h = 0;

		if (delta !== 0) {
			if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
			else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
			else h = 60 * ((rn - gn) / delta + 4);
		}

		if (h < 0) h += 360;
		const s = max === 0 ? 0 : (delta / max) * 100;
		const v = max * 100;
		return [h, s, v];
	}

	#rgbaToHex(r: number, g: number, b: number): string {
		const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	#formatRgba(rgba: Rgba): string {
		if (!this.transparent || rgba.a >= 1) {
			return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
		}
		return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${Number(rgba.a.toFixed(2))})`;
	}

	#clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
}

export const defineColorPicker = createDefine('mb-colorpicker', MbColorPicker);
export {};
