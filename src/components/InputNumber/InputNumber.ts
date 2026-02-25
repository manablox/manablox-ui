import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { INPUTNUMBER_STYLES } from './InputNumber.styles.js';

type InputNumberMode = 'decimal' | 'currency';
type ButtonLayout = 'stacked' | 'horizontal' | 'vertical';
type InputSize = 'small' | 'large' | '';

export class MbInputNumber extends MbBaseComponent {
	static readonly _componentName = 'mb-inputnumber';
	static readonly _componentStyles = INPUTNUMBER_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'number'],
			['placeholder', 'string'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['min', 'number'],
			['max', 'number'],
			['step', 'number'],
			['min-fraction-digits', 'number'],
			['max-fraction-digits', 'number'],
			['mode', 'string'],
			['currency', 'string'],
			['locale', 'string'],
			['prefix', 'string'],
			['suffix', 'string'],
			['show-buttons', 'boolean'],
			['button-layout', 'string'],
			['increment-button-icon', 'string'],
			['decrement-button-icon', 'string'],
			['variant', 'string'],
			['fluid', 'boolean'],
			['size', 'string'],
			['use-grouping', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbInputNumber.attributeConverters.keys());
	}

	#value: number | null = null;
	#editing = false;
	#editingText = '';

	connectedCallback(): void {
		super.connectedCallback();
		const initial = this._num('model-value', null);
		this.#value = initial;
	}

	get modelValue(): number | null {
		return this.#value;
	}
	set modelValue(value: number | null) {
		this.#value = this.#normalizeValue(value);
		this._reflectToAttr('model-value', this.#value, 'number');
		this._scheduleRender();
	}

	get placeholder(): string {
		return this._str('placeholder');
	}

	get disabled(): boolean {
		return this._bool('disabled');
	}

	get invalid(): boolean {
		return this._bool('invalid');
	}

	get min(): number | null {
		return this._num('min', null);
	}

	get max(): number | null {
		return this._num('max', null);
	}

	get step(): number {
		return this._num('step', 1) ?? 1;
	}

	get minFractionDigits(): number | null {
		return this._num('min-fraction-digits', null);
	}

	get maxFractionDigits(): number | null {
		return this._num('max-fraction-digits', null);
	}

	get mode(): InputNumberMode {
		return this._str('mode', 'decimal') === 'currency' ? 'currency' : 'decimal';
	}

	get currency(): string {
		return this._str('currency');
	}

	get locale(): string {
		return this._str('locale');
	}

	get prefix(): string {
		return this._str('prefix');
	}

	get suffix(): string {
		return this._str('suffix');
	}

	get showButtons(): boolean {
		return this._bool('show-buttons');
	}

	get buttonLayout(): ButtonLayout {
		const raw = this._str('button-layout', 'stacked');
		if (raw === 'horizontal' || raw === 'vertical') return raw;
		return 'stacked';
	}

	get incrementButtonIcon(): string {
		return this._str('increment-button-icon');
	}

	get decrementButtonIcon(): string {
		return this._str('decrement-button-icon');
	}

	get variant(): 'outlined' | 'filled' {
		return this._str('variant', 'outlined') === 'filled' ? 'filled' : 'outlined';
	}

	get fluid(): boolean {
		return this._bool('fluid');
	}

	get size(): InputSize {
		const raw = this._str('size');
		if (raw === 'small' || raw === 'large') return raw;
		return '';
	}

	get useGrouping(): boolean {
		const raw = this.getAttribute('use-grouping');
		if (raw === null) return true;
		return !['false', '0', 'no', 'off'].includes(raw.toLowerCase());
	}

	protected _render(): string {
		const classes = [
			'mb-inputnumber',
			this.invalid ? 'mb-invalid' : '',
			this.fluid ? 'mb-inputnumber-fluid' : '',
			this.variant === 'filled' ? 'mb-inputnumber-filled' : '',
			this.size ? `mb-inputnumber-${this.size}` : '',
		]
			.filter(Boolean)
			.join(' ');

		const inputValue = this.#editing ? this.#editingText : this.#formatValue(this.#value);

		return this._html`
			<div class="${classes}">
				${this.showButtons && this.buttonLayout === 'horizontal' ? this.#renderDecrementButton() : ''}
				<input
					class="mb-inputnumber-input"
					type="text"
					inputmode="decimal"
					placeholder="${this._escape(this.placeholder)}"
					${this.disabled ? 'disabled' : ''}
					value="${this._escape(inputValue)}"
					aria-invalid="${this.invalid ? 'true' : 'false'}"
				/>
				${this.showButtons ? this.#renderButtons() : ''}
			</div>
		`;
	}

	protected _afterRender(): void {
		const input = this._qs<HTMLInputElement>('.mb-inputnumber-input');
		if (!input) return;

		const onFocus = (event: FocusEvent) => {
			this.#editing = true;
			this.#editingText = this.#value == null ? '' : String(this.#value);
			this._scheduleRender();
			this.emit('mb-focus', { originalEvent: event, value: this.#value });
		};

		const onBlur = (event: FocusEvent) => {
			const parsed = this.#parseEditableValue(this.#editingText);
			this.#value = this.#normalizeValue(parsed);
			this._reflectToAttr('model-value', this.#value, 'number');
			this.#editing = false;
			this._scheduleRender();
			this.emit('mb-blur', { originalEvent: event, value: this.#value });
		};

		const onInput = (event: Event) => {
			const target = event.target as HTMLInputElement;
			this.#editingText = target.value;
			const parsed = this.#parseEditableValue(this.#editingText);
			this.#value = this.#normalizeValue(parsed);
			this._reflectToAttr('model-value', this.#value, 'number');
			this.emit('mb-input', { value: this.#value, originalEvent: event });
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (this.disabled) return;
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				this.#stepBy(1, event);
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				this.#stepBy(-1, event);
			}
		};

		input.addEventListener('focus', onFocus);
		input.addEventListener('blur', onBlur);
		input.addEventListener('input', onInput);
		input.addEventListener('keydown', onKeyDown);

		this._addCleanup(() => input.removeEventListener('focus', onFocus));
		this._addCleanup(() => input.removeEventListener('blur', onBlur));
		this._addCleanup(() => input.removeEventListener('input', onInput));
		this._addCleanup(() => input.removeEventListener('keydown', onKeyDown));

		if (this.showButtons) {
			const inc = this._qs<HTMLButtonElement>('.mb-inputnumber-button-inc');
			const dec = this._qs<HTMLButtonElement>('.mb-inputnumber-button-dec');

			if (inc) {
				const onInc = (event: MouseEvent) => {
					event.preventDefault();
					this.#stepBy(1, event);
				};
				inc.addEventListener('click', onInc);
				this._addCleanup(() => inc.removeEventListener('click', onInc));
			}

			if (dec) {
				const onDec = (event: MouseEvent) => {
					event.preventDefault();
					this.#stepBy(-1, event);
				};
				dec.addEventListener('click', onDec);
				this._addCleanup(() => dec.removeEventListener('click', onDec));
			}
		}
	}

	#renderButtons(): string {
		if (this.buttonLayout === 'horizontal') {
			return this._html`${this.#renderIncrementButton()}`;
		}

		const className = this.buttonLayout === 'vertical' ? 'mb-inputnumber-buttons-vertical' : 'mb-inputnumber-buttons-stacked';
		return this._html`
			<span class="mb-inputnumber-buttons ${className}">
				${this.#renderIncrementButton()}
				${this.#renderDecrementButton()}
			</span>
		`;
	}

	#renderIncrementButton(): string {
		const icon = this.incrementButtonIcon
			? `<span class="mb-inputnumber-button-icon ${this._escape(this.incrementButtonIcon)}"></span>`
			: '<span class="mb-inputnumber-button-icon">▲</span>';

		return this._html`
			<button type="button" class="mb-inputnumber-button mb-inputnumber-button-inc" ${this.disabled ? 'disabled' : ''} aria-label="Increment">
				${icon}
			</button>
		`;
	}

	#renderDecrementButton(): string {
		const icon = this.decrementButtonIcon
			? `<span class="mb-inputnumber-button-icon ${this._escape(this.decrementButtonIcon)}"></span>`
			: '<span class="mb-inputnumber-button-icon">▼</span>';

		return this._html`
			<button type="button" class="mb-inputnumber-button mb-inputnumber-button-dec" ${this.disabled ? 'disabled' : ''} aria-label="Decrement">
				${icon}
			</button>
		`;
	}

	#stepBy(direction: 1 | -1, originalEvent: Event): void {
		if (this.disabled) return;

		const base = this.#value ?? 0;
		const next = base + direction * this.step;
		this.#value = this.#normalizeValue(next);
		this._reflectToAttr('model-value', this.#value, 'number');
		this.#editingText = this.#value == null ? '' : String(this.#value);
		this._scheduleRender();
		this.emit('mb-input', { value: this.#value, originalEvent });
	}

	#normalizeValue(value: number | null): number | null {
		if (value == null || Number.isNaN(value)) return null;

		let normalized = value;
		if (this.min != null) normalized = Math.max(this.min, normalized);
		if (this.max != null) normalized = Math.min(this.max, normalized);

		const precision = this.#fractionPrecision();
		if (precision > 0) {
			const factor = 10 ** precision;
			normalized = Math.round(normalized * factor) / factor;
		}

		return normalized;
	}

	#fractionPrecision(): number {
		if (this.maxFractionDigits != null) {
			return Math.max(0, this.maxFractionDigits);
		}

		const stepStr = String(this.step);
		const dot = stepStr.indexOf('.');
		return dot === -1 ? 0 : stepStr.length - dot - 1;
	}

	#parseEditableValue(input: string): number | null {
		const trimmed = input.trim();
		if (!trimmed || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
			return null;
		}

		let value = trimmed;
		if (this.prefix && value.startsWith(this.prefix)) {
			value = value.slice(this.prefix.length);
		}
		if (this.suffix && value.endsWith(this.suffix)) {
			value = value.slice(0, -this.suffix.length);
		}

		const symbols = this.#numberSymbols();
		if (symbols.group) {
			const groupRegex = new RegExp(this.#escapeRegExp(symbols.group), 'g');
			value = value.replace(groupRegex, '');
		}
		if (symbols.decimal && symbols.decimal !== '.') {
			const decimalRegex = new RegExp(this.#escapeRegExp(symbols.decimal), 'g');
			value = value.replace(decimalRegex, '.');
		}

		value = value.replace(/\s/g, '');

		const parsed = Number(value);
		if (Number.isNaN(parsed)) return null;

		return parsed;
	}

	#formatValue(value: number | null): string {
		if (value == null) return '';

		const options: Intl.NumberFormatOptions = {
			style: this.mode,
			useGrouping: this.useGrouping,
		};

		if (this.mode === 'currency') {
			options.currency = this.currency || 'USD';
			options.currencyDisplay = 'symbol';
		}

		if (this.minFractionDigits != null) {
			options.minimumFractionDigits = this.minFractionDigits;
		}
		if (this.maxFractionDigits != null) {
			options.maximumFractionDigits = this.maxFractionDigits;
		}

		const formatter = new Intl.NumberFormat(this.locale || undefined, options);
		let text = formatter.format(value);

		if (this.prefix) {
			text = `${this.prefix}${text}`;
		}
		if (this.suffix) {
			text = `${text}${this.suffix}`;
		}

		return text;
	}

	#numberSymbols(): { group: string; decimal: string } {
		const formatter = new Intl.NumberFormat(this.locale || undefined);
		const parts = formatter.formatToParts(12345.6);
		const group = parts.find(p => p.type === 'group')?.value ?? ',';
		const decimal = parts.find(p => p.type === 'decimal')?.value ?? '.';
		return { group, decimal };
	}

	#escapeRegExp(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}

export const defineInputNumber = createDefine('mb-inputnumber', MbInputNumber);

export default MbInputNumber;
export {};
