import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { SLIDER_STYLES } from './Slider.styles.js';

type SliderValue = number | [number, number];
type Orientation = 'horizontal' | 'vertical';

export class MbSlider extends MbBaseComponent {
	static readonly _componentName = 'mb-slider';
	static readonly _componentStyles = SLIDER_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'object'],
			['min', 'number'],
			['max', 'number'],
			['step', 'number'],
			['orientation', 'string'],
			['disabled', 'boolean'],
			['range', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbSlider.attributeConverters.keys());
	}

	#value: SliderValue = 0;
	#activeThumb: 0 | 1 = 0;
	#dragging = false;
	#moveHandler: ((event: MouseEvent | TouchEvent) => void) | null = null;
	#upHandler: ((event: MouseEvent | TouchEvent) => void) | null = null;

	connectedCallback(): void {
		super.connectedCallback();
		this.#value = this.#normalizeIncoming(this._obj<SliderValue>('model-value'));
		this._addCleanup(() => this.#stopDragging());
	}

	disconnectedCallback(): void {
		this.#stopDragging();
		super.disconnectedCallback();
	}

	get modelValue(): SliderValue {
		return this.#value;
	}
	set modelValue(value: SliderValue) {
		this.#value = this.#normalizeIncoming(value);
		this._reflectModelValue();
		this._scheduleRender();
	}

	get min(): number {
		return this._num('min', 0) ?? 0;
	}

	get max(): number {
		return this._num('max', 100) ?? 100;
	}

	get step(): number {
		const step = this._num('step', 1) ?? 1;
		return step > 0 ? step : 1;
	}

	get orientation(): Orientation {
		return this._str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
	}

	get disabled(): boolean {
		return this._bool('disabled');
	}

	get range(): boolean {
		return this._bool('range');
	}

	protected _render(): string {
		const classes = [
			'mb-slider',
			this.orientation === 'vertical' ? 'mb-slider-vertical' : 'mb-slider-horizontal',
			this.disabled ? 'mb-disabled' : '',
			this.range ? 'mb-slider-range-mode' : '',
		]
			.filter(Boolean)
			.join(' ');

		const positions = this.#thumbPositions();
		const rangeStyle = this.#rangeStyle(positions);

		return this._html`
			<div part="root" class="${classes}">
				<div part="track" class="mb-slider-track" role="presentation">
					<div part="range" class="mb-slider-range" style="${rangeStyle}"></div>
					${this.#renderThumb(0, positions[0])}
					${this.range ? this.#renderThumb(1, positions[1]) : ''}
				</div>
			</div>
		`;
	}

	protected _afterRender(): void {
		const track = this._qs<HTMLElement>('.mb-slider-track');
		if (!track) return;

		const onTrackDown = (event: MouseEvent | TouchEvent) => {
			if (this.disabled) return;
			event.preventDefault();
			const pos = this.#eventCoord(event);
			if (pos == null) return;

			this.#activeThumb = this.#resolveNearestThumb(pos, track);
			this.#updateFromPointer(pos, track);
			this.#startDragging(track);
		};

		const onTrackMouseDown = (event: MouseEvent) => onTrackDown(event);
		const onTrackTouchStart = (event: TouchEvent) => onTrackDown(event);

		track.addEventListener('mousedown', onTrackMouseDown);
		track.addEventListener('touchstart', onTrackTouchStart, { passive: false });

		this._addCleanup(() => track.removeEventListener('mousedown', onTrackMouseDown));
		this._addCleanup(() => track.removeEventListener('touchstart', onTrackTouchStart));

		const thumbs = this._qsa<HTMLButtonElement>('.mb-slider-thumb');
		thumbs.forEach((thumb, index) => {
			const onThumbMouseDown = (event: MouseEvent) => {
				if (this.disabled) return;
				event.preventDefault();
				event.stopPropagation();
				this.#activeThumb = index === 1 ? 1 : 0;
				this.#startDragging(track);
			};

			const onThumbTouchStart = (event: TouchEvent) => {
				if (this.disabled) return;
				event.preventDefault();
				event.stopPropagation();
				this.#activeThumb = index === 1 ? 1 : 0;
				this.#startDragging(track);
			};

			const onThumbKeyDown = (event: KeyboardEvent) => {
				if (this.disabled) return;
				this.#onThumbKey(index === 1 ? 1 : 0, event);
			};

			thumb.addEventListener('mousedown', onThumbMouseDown);
			thumb.addEventListener('touchstart', onThumbTouchStart, { passive: false });
			thumb.addEventListener('keydown', onThumbKeyDown);

			this._addCleanup(() => thumb.removeEventListener('mousedown', onThumbMouseDown));
			this._addCleanup(() => thumb.removeEventListener('touchstart', onThumbTouchStart));
			this._addCleanup(() => thumb.removeEventListener('keydown', onThumbKeyDown));
		});
	}

	#renderThumb(index: 0 | 1, position: number): string {
		const value = this.#thumbValue(index);
		const posStyle = this.orientation === 'vertical' ? `bottom:${position}%;` : `left:${position}%;`;

		return this._html`
			<button
				part="thumb"
				type="button"
				class="mb-slider-thumb"
				data-index="${index}"
				style="${posStyle}"
				role="slider"
				aria-valuemin="${this.min}"
				aria-valuemax="${this.max}"
				aria-valuenow="${value}"
				aria-orientation="${this.orientation}"
				${this.disabled ? 'disabled' : ''}
				tabindex="${this.disabled ? '-1' : '0'}"
			></button>
		`;
	}

	#thumbPositions(): [number, number] {
		if (this.range && Array.isArray(this.#value)) {
			return [this.#percent(this.#value[0]), this.#percent(this.#value[1])];
		}
		const single = this.#valueValue();
		const percent = this.#percent(single);
		return [percent, percent];
	}

	#rangeStyle([first, second]: [number, number]): string {
		if (this.range) {
			const start = Math.min(first, second);
			const end = Math.max(first, second);
			if (this.orientation === 'vertical') {
				return `bottom:${start}%;height:${end - start}%;`;
			}
			return `left:${start}%;width:${end - start}%;`;
		}

		if (this.orientation === 'vertical') {
			return `bottom:0;height:${first}%;`;
		}
		return `left:0;width:${first}%;`;
	}

	#percent(value: number): number {
		if (this.max <= this.min) return 0;
		return ((value - this.min) / (this.max - this.min)) * 100;
	}

	#valueValue(): number {
		if (Array.isArray(this.#value)) return this.#value[0];
		return this.#value;
	}

	#thumbValue(index: 0 | 1): number {
		if (this.range && Array.isArray(this.#value)) {
			return index === 1 ? this.#value[1] : this.#value[0];
		}
		return this.#valueValue();
	}

	#eventCoord(event: MouseEvent | TouchEvent): number | null {
		if ('touches' in event) {
			const touch = event.touches.item(0);
			if (!touch) return null;
			return this.orientation === 'vertical' ? touch.clientY : touch.clientX;
		}
		return this.orientation === 'vertical' ? event.clientY : event.clientX;
	}

	#resolveNearestThumb(coord: number, track: HTMLElement): 0 | 1 {
		if (!this.range || !Array.isArray(this.#value)) return 0;

		const rect = track.getBoundingClientRect();
		const firstPos = this.orientation === 'vertical'
			? rect.bottom - (this.#thumbPositions()[0] / 100) * rect.height
			: rect.left + (this.#thumbPositions()[0] / 100) * rect.width;
		const secondPos = this.orientation === 'vertical'
			? rect.bottom - (this.#thumbPositions()[1] / 100) * rect.height
			: rect.left + (this.#thumbPositions()[1] / 100) * rect.width;

		return Math.abs(coord - firstPos) <= Math.abs(coord - secondPos) ? 0 : 1;
	}

	#startDragging(track: HTMLElement): void {
		this.#dragging = true;

		this.#moveHandler = (event: MouseEvent | TouchEvent) => {
			if (!this.#dragging) return;
			const coord = this.#eventCoord(event);
			if (coord == null) return;
			if ('touches' in event) {
				event.preventDefault();
			}
			this.#updateFromPointer(coord, track);
		};

		this.#upHandler = () => {
			if (!this.#dragging) return;
			this.#dragging = false;
			this.emit('mb-slide-end', { value: this.#value });
			this.#stopDragging();
		};

		document.addEventListener('mousemove', this.#moveHandler);
		document.addEventListener('touchmove', this.#moveHandler, { passive: false });
		document.addEventListener('mouseup', this.#upHandler);
		document.addEventListener('touchend', this.#upHandler);
	}

	#stopDragging(): void {
		if (this.#moveHandler) {
			document.removeEventListener('mousemove', this.#moveHandler);
			document.removeEventListener('touchmove', this.#moveHandler);
		}
		if (this.#upHandler) {
			document.removeEventListener('mouseup', this.#upHandler);
			document.removeEventListener('touchend', this.#upHandler);
		}
		this.#moveHandler = null;
		this.#upHandler = null;
		this.#dragging = false;
	}

	#updateFromPointer(coord: number, track: HTMLElement): void {
		const rect = track.getBoundingClientRect();
		let ratio: number;

		if (this.orientation === 'vertical') {
			ratio = (rect.bottom - coord) / rect.height;
		} else {
			ratio = (coord - rect.left) / rect.width;
		}

		ratio = Math.max(0, Math.min(1, ratio));
		const rawValue = this.min + ratio * (this.max - this.min);
		const stepped = this.#snap(rawValue);

		if (this.range && Array.isArray(this.#value)) {
			let [low, high] = this.#value;
			if (this.#activeThumb === 0) {
				low = Math.min(stepped, high);
			} else {
				high = Math.max(stepped, low);
			}
			this.#value = [low, high];
		} else {
			this.#value = stepped;
		}

		this._reflectModelValue();
		this._scheduleRender();
		this.emit('mb-change', { value: this.#value });
	}

	#onThumbKey(index: 0 | 1, event: KeyboardEvent): void {
		const delta =
			event.key === 'ArrowRight' || event.key === 'ArrowUp'
				? this.step
				: event.key === 'ArrowLeft' || event.key === 'ArrowDown'
					? -this.step
					: 0;

		if (delta !== 0) {
			event.preventDefault();
			this.#updateByKeyboard(index, delta);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			this.#setThumbTo(index, this.min);
		}

		if (event.key === 'End') {
			event.preventDefault();
			this.#setThumbTo(index, this.max);
		}
	}

	#updateByKeyboard(index: 0 | 1, delta: number): void {
		const current = this.#thumbValue(index);
		this.#setThumbTo(index, current + delta);
	}

	#setThumbTo(index: 0 | 1, nextRaw: number): void {
		const next = this.#snap(nextRaw);

		if (this.range && Array.isArray(this.#value)) {
			let [low, high] = this.#value;
			if (index === 0) {
				low = Math.min(next, high);
			} else {
				high = Math.max(next, low);
			}
			this.#value = [low, high];
		} else {
			this.#value = next;
		}

		this._reflectModelValue();
		this._scheduleRender();
		this.emit('mb-change', { value: this.#value });
		this.emit('mb-slide-end', { value: this.#value });
	}

	#snap(value: number): number {
		const bounded = Math.max(this.min, Math.min(this.max, value));
		const steps = Math.round((bounded - this.min) / this.step);
		const snapped = this.min + steps * this.step;
		const decimals = this.#stepDecimals();
		if (decimals === 0) return snapped;
		const factor = 10 ** decimals;
		return Math.round(snapped * factor) / factor;
	}

	#stepDecimals(): number {
		const stepStr = String(this.step);
		const dot = stepStr.indexOf('.');
		return dot === -1 ? 0 : stepStr.length - dot - 1;
	}

	#normalizeIncoming(value: unknown): SliderValue {
		if (this.range) {
			if (Array.isArray(value) && value.length >= 2) {
				const low = this.#snap(Number(value[0]));
				const high = this.#snap(Number(value[1]));
				return [Math.min(low, high), Math.max(low, high)];
			}
			const fallbackLow = this.#snap(this.min);
			const fallbackHigh = this.#snap(this.max);
			return [fallbackLow, fallbackHigh];
		}

		if (typeof value === 'number') {
			return this.#snap(value);
		}

		if (Array.isArray(value) && value.length > 0) {
			return this.#snap(Number(value[0]));
		}

		return this.#snap(this.min);
	}

	_reflectModelValue(): void {
		if (this.range && Array.isArray(this.#value)) {
			this.setAttribute('model-value', JSON.stringify(this.#value));
			return;
		}
		this.setAttribute('model-value', JSON.stringify(this.#valueValue()));
	}
}

export const defineSlider = createDefine('mb-slider', MbSlider);

export default MbSlider;
export {};
