import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { INPUTOTP_STYLES } from './InputOtp.styles.js';

type InputOtpSize = 'small' | 'large' | '';

export class MbInputOtp extends MbBaseComponent {
	static readonly _componentName = 'mb-inputotp';
	static readonly _componentStyles = INPUTOTP_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'string'],
			['length', 'number'],
			['mask', 'boolean'],
			['integer-only', 'boolean'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['variant', 'string'],
			['size', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbInputOtp.attributeConverters.keys());
	}

	#chars: string[] = [];

	connectedCallback(): void {
		super.connectedCallback();
		this.#setFromString(this.getAttribute('model-value') ?? '');
	}

	get modelValue(): string {
		return this.#chars.join('');
	}
	set modelValue(value: string) {
		this.#setFromString(value);
		this._reflectToAttr('model-value', this.modelValue, 'string');
		this._scheduleRender();
	}

	get length(): number {
		return Math.max(1, this._num('length', 4) ?? 4);
	}

	get mask(): boolean {
		return this._bool('mask');
	}

	get integerOnly(): boolean {
		return this._bool('integer-only');
	}

	get disabled(): boolean {
		return this._bool('disabled');
	}

	get invalid(): boolean {
		return this._bool('invalid');
	}

	get variant(): 'outlined' | 'filled' {
		return this._str('variant', 'outlined') === 'filled' ? 'filled' : 'outlined';
	}

	get size(): InputOtpSize {
		const raw = this._str('size');
		if (raw === 'small' || raw === 'large') return raw;
		return '';
	}

	protected _render(): string {
		this.#ensureCharsLength();
		const classes = [
			'mb-inputotp',
			this.invalid ? 'mb-invalid' : '',
			this.variant === 'filled' ? 'mb-filled' : '',
			this.size ? `mb-${this.size}` : '',
		]
			.filter(Boolean)
			.join(' ');

		const inputs = Array.from({ length: this.length }, (_, index) => {
			const value = this.#chars[index] ?? '';
			return this._html`
				<input
					class="mb-inputotp-input"
					type="${this.mask ? 'password' : 'text'}"
					maxlength="1"
					data-index="${index}"
					value="${this._escape(value)}"
					${this.disabled ? 'disabled' : ''}
					inputmode="${this.integerOnly ? 'numeric' : 'text'}"
					aria-label="OTP character ${index + 1}"
				/>
			`;
		}).join('');

		return `<div class="${classes}">${inputs}</div>`;
	}

	protected _afterRender(): void {
		const root = this._qs<HTMLElement>('.mb-inputotp');
		if (!root) return;

		const inputs = Array.from(this._qsa<HTMLInputElement>('.mb-inputotp-input'));
		if (inputs.length === 0) return;

		const onInput = (event: Event) => {
			if (this.disabled) return;

			const target = event.target as HTMLInputElement;
			const index = Number(target.dataset.index ?? '-1');
			if (index < 0) return;

			const raw = target.value;
			const char = this.#sanitizeChar(raw);
			target.value = char;

			this.#setChar(index, char);
			this.#emitChange();

			if (char && index < inputs.length - 1) {
				const nextInput = inputs[index + 1];
				if (nextInput) {
					nextInput.focus();
					nextInput.select();
				}
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (this.disabled) return;

			const target = event.target as HTMLInputElement;
			const index = Number(target.dataset.index ?? '-1');
			if (index < 0) return;

			if (event.key === 'Backspace') {
				if (target.value === '' && index > 0) {
					event.preventDefault();
					this.#setChar(index - 1, '');
					const prevInput = inputs[index - 1];
					if (prevInput) {
						prevInput.focus();
						prevInput.value = '';
					}
					this.#emitChange();
					return;
				}

				this.#setChar(index, '');
				this.#emitChange();
			}

			if (event.key === 'ArrowLeft' && index > 0) {
				event.preventDefault();
				inputs[index - 1]?.focus();
			}

			if (event.key === 'ArrowRight' && index < inputs.length - 1) {
				event.preventDefault();
				inputs[index + 1]?.focus();
			}
		};

		const onPaste = (event: ClipboardEvent) => {
			if (this.disabled) return;

			event.preventDefault();
			const target = event.target as HTMLInputElement;
			const start = Number(target.dataset.index ?? '0');
			const pasted = event.clipboardData?.getData('text') ?? '';
			const sanitized = this.#sanitizeText(pasted);

			if (!sanitized) return;

			const chars = sanitized.slice(0, this.length - start).split('');
			chars.forEach((char, offset) => {
				const idx = start + offset;
				this.#setChar(idx, char);
				const input = inputs[idx];
				if (input) input.value = char;
			});

			const nextIndex = Math.min(start + chars.length, this.length - 1);
			inputs[nextIndex]?.focus();
			this.#emitChange();
		};

		root.addEventListener('input', onInput);
		root.addEventListener('keydown', onKeyDown);
		root.addEventListener('paste', onPaste);

		this._addCleanup(() => root.removeEventListener('input', onInput));
		this._addCleanup(() => root.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => root.removeEventListener('paste', onPaste));
	}

	#setChar(index: number, char: string): void {
		if (index < 0 || index >= this.length) return;
		this.#ensureCharsLength();
		this.#chars[index] = char;
		this._reflectToAttr('model-value', this.modelValue, 'string');
	}

	#emitChange(): void {
		const value = this.modelValue;
		this.emit('mb-change', { value });
		if (this.#isComplete()) {
			this.emit('mb-complete', { value });
		}
	}

	#isComplete(): boolean {
		this.#ensureCharsLength();
		return this.#chars.length === this.length && this.#chars.every(char => char.length === 1);
	}

	#sanitizeChar(value: string): string {
		if (!value) return '';
		const trimmed = value.slice(-1);
		if (!this.integerOnly) return trimmed;
		return /\d/.test(trimmed) ? trimmed : '';
	}

	#sanitizeText(value: string): string {
		if (!value) return '';
		if (!this.integerOnly) return value.replace(/\s/g, '');
		return value.replace(/\D/g, '');
	}

	#normalizedValue(value: string): string {
		const sanitized = this.#sanitizeText(value ?? '').slice(0, this.length);
		return sanitized;
	}

	#setFromString(value: string): void {
		const normalized = this.#normalizedValue(value);
		this.#chars = Array.from({ length: this.length }, (_, index) => normalized[index] ?? '');
	}

	#ensureCharsLength(): void {
		if (this.#chars.length > this.length) {
			this.#chars = this.#chars.slice(0, this.length);
			return;
		}

		if (this.#chars.length < this.length) {
			while (this.#chars.length < this.length) {
				this.#chars.push('');
			}
		}
	}
}

export const defineInputOtp = createDefine('mb-inputotp', MbInputOtp);

export default MbInputOtp;
export {};
