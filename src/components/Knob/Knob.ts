import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { KNOB_STYLES } from './Knob.styles.js';

const START_ANGLE = 135;
const END_ANGLE = 405;
const TOTAL_ANGLE = END_ANGLE - START_ANGLE;

export class MbKnob extends MbBaseComponent {
	static readonly _componentName = 'mb-knob';
	static readonly _componentStyles = KNOB_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'number'],
			['min', 'number'],
			['max', 'number'],
			['step', 'number'],
			['size', 'number'],
			['disabled', 'boolean'],
			['readonly', 'boolean'],
			['stroke-width', 'number'],
			['show-value', 'boolean'],
			['value-template', 'string'],
			['range-color', 'string'],
			['value-color', 'string'],
			['text-color', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbKnob.attributeConverters.keys());
	}

	value = 0;
	min = 0;
	max = 100;
	step = 1;
	size = 100;
	disabled = false;
	readonly = false;
	strokeWidth = 14;
	showValue = true;
	valueTemplate = '';
	rangeColor = '';
	valueColor = '';
	textColor = '';

	#listenersBound = false;
	#dragging = false;
	#removeDragListeners: (() => void) | null = null;

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onMouseDown = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.mb-knob-svg')) return;
			this.#startDrag(event);
		};

		const onTouchStart = (event: TouchEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.mb-knob-svg')) return;
			this.#startTouchDrag(event);
		};

		const onKeyDown = (event: KeyboardEvent) => this.#onKeyDown(event);

		this.addEventListener('mousedown', onMouseDown);
		this.addEventListener('touchstart', onTouchStart, { passive: false });
		this.addEventListener('keydown', onKeyDown);

		this._addCleanup(() => this.removeEventListener('mousedown', onMouseDown));
		this._addCleanup(() => this.removeEventListener('touchstart', onTouchStart));
		this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => this.#removeDragListeners?.());
	}

	protected _render(): string {
		const safeMin = Number.isFinite(this.min) ? this.min : 0;
		const safeMax = Number.isFinite(this.max) ? this.max : 100;
		const max = safeMax > safeMin ? safeMax : safeMin + 1;
		const min = safeMin;
		const strokeWidth = Math.max(1, Number.isFinite(this.strokeWidth) ? this.strokeWidth : 14);
		const size = Math.max(40, Number.isFinite(this.size) ? this.size : 100);

		const range = max - min;
		const clampedValue = this.#clamp(this.value, min, max);
		const ratio = range === 0 ? 0 : (clampedValue - min) / range;

		const radius = (size - strokeWidth) / 2;
		const center = size / 2;
		const circumference = 2 * Math.PI * radius;
		const arcLength = (TOTAL_ANGLE / 360) * circumference;
		const valueLength = Math.max(0, Math.min(arcLength, arcLength * ratio));

		const classes = [
			'mb-knob',
			this.disabled ? 'mb-knob-disabled' : '',
			this.readonly ? 'mb-knob-readonly' : '',
		]
			.filter(Boolean)
			.join(' ');

		const labelText = this.valueTemplate
			? this.valueTemplate.replace('{value}', String(clampedValue))
			: String(clampedValue);
		const styleParts: string[] = [`--mb-knob-size:${size}px`];
		if (this.rangeColor) styleParts.push(`--mb-knob-range-color:${this._escape(this.rangeColor)}`);
		if (this.valueColor) styleParts.push(`--mb-knob-value-color:${this._escape(this.valueColor)}`);
		if (this.textColor) styleParts.push(`--mb-knob-text-color:${this._escape(this.textColor)}`);

		return this._html`
			<div
				class="${classes}"
				role="slider"
				aria-valuemin="${min}"
				aria-valuemax="${max}"
				aria-valuenow="${clampedValue}"
				aria-disabled="${this.disabled ? 'true' : 'false'}"
				tabindex="${this.disabled ? '-1' : '0'}"
				style="${styleParts.join(';')}"
			>
				<svg class="mb-knob-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
					<g transform="rotate(${START_ANGLE} ${center} ${center})">
						<circle
							class="mb-knob-range"
							cx="${center}"
							cy="${center}"
							r="${radius}"
							stroke-width="${strokeWidth}"
							stroke-dasharray="${arcLength} ${circumference}"
							stroke-dashoffset="0"
						></circle>
						<circle
							class="mb-knob-value"
							cx="${center}"
							cy="${center}"
							r="${radius}"
							stroke-width="${strokeWidth}"
							stroke-dasharray="${valueLength} ${circumference}"
							stroke-dashoffset="0"
						></circle>
					</g>
				</svg>
				${this.showValue ? `<span class="mb-knob-label">${this._escape(labelText)}</span>` : ''}
			</div>
		`;
	}

	#startDrag(event: MouseEvent): void {
		if (this.disabled || this.readonly) return;
		event.preventDefault();
		this.#dragging = true;
		this.#updateFromPoint(event.clientX, event.clientY, true);

		const onMove = (moveEvent: MouseEvent) => {
			if (!this.#dragging) return;
			this.#updateFromPoint(moveEvent.clientX, moveEvent.clientY, true);
		};
		const onUp = () => {
			this.#dragging = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			this.#removeDragListeners = null;
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		this.#removeDragListeners = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}

	#startTouchDrag(event: TouchEvent): void {
		if (this.disabled || this.readonly || event.touches.length === 0) return;
		event.preventDefault();
		this.#dragging = true;
		const touch = event.touches[0];
		if (!touch) return;
		this.#updateFromPoint(touch.clientX, touch.clientY, true);

		const onMove = (moveEvent: TouchEvent) => {
			if (!this.#dragging || moveEvent.touches.length === 0) return;
			moveEvent.preventDefault();
			const moveTouch = moveEvent.touches[0];
			if (!moveTouch) return;
			this.#updateFromPoint(moveTouch.clientX, moveTouch.clientY, true);
		};
		const onEnd = () => {
			this.#dragging = false;
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onEnd);
			this.#removeDragListeners = null;
		};

		window.addEventListener('touchmove', onMove, { passive: false });
		window.addEventListener('touchend', onEnd);
		this.#removeDragListeners = () => {
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onEnd);
		};
	}

	#onKeyDown(event: KeyboardEvent): void {
		if (this.disabled || this.readonly) return;
		const step = Math.max(0.000001, Number.isFinite(this.step) ? this.step : 1);

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				event.preventDefault();
				this.#setValue(this.value + step, true);
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				event.preventDefault();
				this.#setValue(this.value - step, true);
				break;
			case 'Home':
				event.preventDefault();
				this.#setValue(this.min, true);
				break;
			case 'End':
				event.preventDefault();
				this.#setValue(this.max, true);
				break;
			default:
				break;
		}
	}

	#updateFromPoint(clientX: number, clientY: number, emit: boolean): void {
		const knob = this._qs<HTMLElement>('.mb-knob');
		if (!knob) return;
		const rect = knob.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const angle = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
		let normalized = angle < 0 ? angle + 360 : angle;
		if (normalized < START_ANGLE) normalized += 360;
		const constrained = this.#clamp(normalized, START_ANGLE, END_ANGLE);
		const ratio = (constrained - START_ANGLE) / TOTAL_ANGLE;
		const rawValue = this.min + ratio * (this.max - this.min);
		this.#setValue(rawValue, emit);
	}

	#setValue(next: number, emitEvent: boolean): void {
		const min = Number.isFinite(this.min) ? this.min : 0;
		const maxRaw = Number.isFinite(this.max) ? this.max : 100;
		const max = maxRaw > min ? maxRaw : min + 1;
		const step = Math.max(0.000001, Number.isFinite(this.step) ? this.step : 1);

		const snapped = min + Math.round((next - min) / step) * step;
		const clamped = this.#clamp(snapped, min, max);
		const rounded = Number(clamped.toFixed(6));
		if (rounded === this.value) return;

		this.value = rounded;
		this._reflectToAttr('value', rounded, 'number');
		if (emitEvent) this.emit('mb-change', { value: rounded });
		this._scheduleRender();
	}

	#clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
}

export const defineKnob = createDefine('mb-knob', MbKnob);
export {};
