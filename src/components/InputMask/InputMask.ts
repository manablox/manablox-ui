import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { INPUTMASK_STYLES } from './InputMask.styles.js';

interface MaskState {
	masked: string;
	unmasked: string;
	complete: boolean;
}

export class MbInputMask extends MbBaseComponent {
	static readonly _componentName = 'mb-inputmask';
	static readonly _componentStyles = INPUTMASK_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'string'],
			['mask', 'string'],
			['slot-char', 'string'],
			['auto-clear', 'boolean'],
			['unmask', 'boolean'],
			['disabled', 'boolean'],
			['readonly', 'boolean'],
			['placeholder', 'string'],
			['size', 'number'],
			['input-id', 'string'],
			['aria-label', 'string'],
			['aria-labelledby', 'string'],
			['aria-describedby', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbInputMask.attributeConverters.keys());
	}

	value = '';
	mask = '';
	slotChar = '_';
	autoClear = true;
	unmask = false;
	disabled = false;
	readonly = false;
	placeholder = '';
	size: number | null = null;
	inputId = '';
	ariaLabel = '';
	ariaLabelledby = '';
	ariaDescribedby = '';

	#listenersBound = false;
	#maskedValue = '';

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onInput = (event: Event) => this.#onInput(event);
		const onKeyDown = (event: KeyboardEvent) => this.#onKeyDown(event);
		const onBlur = () => this.#onBlur();

		this.addEventListener('input', onInput);
		this.addEventListener('keydown', onKeyDown);
		this.addEventListener('blur', onBlur, true);

		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => this.removeEventListener('blur', onBlur, true));
	}

	protected _render(): string {
		const maskState = this.#applyMaskFromRaw(this.value ?? '');
		this.#maskedValue = maskState.masked;

		return this._html`
			<input
				class="mb-inputtext mb-inputmask"
				type="text"
				value="${this._escape(this.#maskedValue)}"
				${this.disabled ? 'disabled' : ''}
				${this.readonly ? 'readonly' : ''}
				${this.placeholder ? `placeholder="${this._escape(this.placeholder)}"` : ''}
				${this.size != null ? `size="${this.size}"` : ''}
				${this._num('tab-index', null) != null ? `tabindex="${this._num('tab-index', null)}"` : ''}
				${this.inputId ? `id="${this._escape(this.inputId)}"` : ''}
				${this.ariaLabel ? `aria-label="${this._escape(this.ariaLabel)}"` : ''}
				${this.ariaLabelledby ? `aria-labelledby="${this._escape(this.ariaLabelledby)}"` : ''}
				${this.ariaDescribedby ? `aria-describedby="${this._escape(this.ariaDescribedby)}"` : ''}
			/>
		`;
	}

	protected _afterRender(): void {
		const input = this.#inputEl();
		if (!input) return;
		if (input.value !== this.#maskedValue) {
			input.value = this.#maskedValue;
		}
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (!target || target.tagName !== 'INPUT') return;

		const caret = target.selectionStart ?? target.value.length;
		const incoming = target.value;
		const state = this.#applyMaskFromRaw(incoming);
		this.#maskedValue = state.masked;
		target.value = state.masked;
		const nextCaret = this.#nextEditableIndex(caret);
		target.setSelectionRange(nextCaret, nextCaret);

		this.#updateValueFromMaskState(state, true);
		this.emit('mb-input');
		if (state.complete) {
			this.emit('mb-complete', { value: this.unmask ? state.unmasked : state.masked });
		}
	}

	#onKeyDown(event: KeyboardEvent): void {
		const input = event.target as HTMLInputElement;
		if (!input || input.tagName !== 'INPUT' || this.readonly || this.disabled) return;

		if (event.key !== 'Backspace' && event.key !== 'Delete') return;
		event.preventDefault();

		const start = input.selectionStart ?? 0;
		const end = input.selectionEnd ?? start;
		const chars = this.#extractMaskChars(input.value);

		if (start !== end) {
			const [fromSlot, toSlot] = this.#slotRangeFromSelection(start, end);
			for (let i = fromSlot; i <= toSlot; i += 1) {
				if (i >= 0 && i < chars.length) chars[i] = '';
			}
		} else if (event.key === 'Backspace') {
			const slot = this.#findPreviousSlotIndex(start);
			if (slot >= 0 && slot < chars.length) chars[slot] = '';
		} else {
			const slot = this.#findCurrentSlotIndex(start);
			if (slot >= 0 && slot < chars.length) chars[slot] = '';
		}

		const state = this.#applyMaskFromChars(chars);
		this.#maskedValue = state.masked;
		input.value = state.masked;
		const cursor = event.key === 'Backspace' ? this.#previousEditableIndex(start) : this.#nextEditableIndex(start);
		input.setSelectionRange(cursor, cursor);
		this.#updateValueFromMaskState(state, true);
		if (state.complete) {
			this.emit('mb-complete', { value: this.unmask ? state.unmasked : state.masked });
		}
	}

	#onBlur(): void {
		const state = this.#applyMaskFromRaw(this.#maskedValue || this.value || '');
		if (!state.complete && this.autoClear) {
			this.value = '';
			this._reflectToAttr('value', '', 'string');
			this.#maskedValue = '';
			const input = this.#inputEl();
			if (input) input.value = '';
			this.emit('mb-change', { value: '' });
			return;
		}
		if (state.complete) {
			this.emit('mb-complete', { value: this.unmask ? state.unmasked : state.masked });
		}
	}

	#updateValueFromMaskState(state: MaskState, emitChange: boolean): void {
		const outputValue = this.unmask ? state.unmasked : state.masked;
		this.value = outputValue;
		this._reflectToAttr('value', outputValue, 'string');
		if (emitChange) {
			this.emit('mb-change', { value: state.masked });
		}
	}

	#applyMaskFromRaw(raw: string): MaskState {
		const chars = this.#extractMaskChars(raw);
		return this.#applyMaskFromChars(chars);
	}

	#applyMaskFromChars(chars: string[]): MaskState {
		const mask = this.mask || '';
		if (!mask) {
			const value = chars.join('');
			return { masked: value, unmasked: value, complete: value.length > 0 };
		}

		const slotChar = (this.slotChar || '_').charAt(0) || '_';
		const out: string[] = [];
		const accepted: string[] = [];
		let charCursor = 0;
		let complete = true;

		for (let i = 0; i < mask.length; i += 1) {
			const token = mask[i] ?? '';
			if (this.#isMaskToken(token)) {
				let matched = '';
				while (charCursor < chars.length) {
					const candidate = chars[charCursor] ?? '';
					charCursor += 1;
					if (this.#matchesToken(token, candidate)) {
						matched = candidate;
						break;
					}
				}

				if (matched) {
					out.push(matched);
					accepted.push(matched);
				} else {
					out.push(slotChar);
					complete = false;
				}
			} else {
				out.push(token);
			}
		}

		return {
			masked: out.join(''),
			unmasked: accepted.join(''),
			complete,
		};
	}

	#extractMaskChars(value: string): string[] {
		const slot = (this.slotChar || '_').charAt(0) || '_';
		const maskLiterals = new Set((this.mask || '').split('').filter(ch => !this.#isMaskToken(ch)));
		return (value || '')
			.split('')
			.filter(ch => ch !== slot)
			.filter(ch => !maskLiterals.has(ch));
	}

	#isMaskToken(ch: string): boolean {
		return ch === '9' || ch === 'a' || ch === '*';
	}

	#matchesToken(token: string, ch: string): boolean {
		if (!ch) return false;
		if (token === '9') return /[0-9]/.test(ch);
		if (token === 'a') return /[A-Za-z]/.test(ch);
		if (token === '*') return /[A-Za-z0-9]/.test(ch);
		return false;
	}

	#inputEl(): HTMLInputElement | null {
		return this._qs<HTMLInputElement>('input.mb-inputmask');
	}

	#editableIndexes(): number[] {
		const mask = this.mask || '';
		const indexes: number[] = [];
		for (let i = 0; i < mask.length; i += 1) {
			if (this.#isMaskToken(mask[i] ?? '')) indexes.push(i);
		}
		return indexes;
	}

	#findPreviousSlotIndex(position: number): number {
		const editables = this.#editableIndexes();
		for (let i = editables.length - 1; i >= 0; i -= 1) {
			const index = editables[i] ?? -1;
			if (index < position) return i;
		}
		return editables.length > 0 ? 0 : -1;
	}

	#findCurrentSlotIndex(position: number): number {
		const editables = this.#editableIndexes();
		for (let i = 0; i < editables.length; i += 1) {
			const index = editables[i] ?? -1;
			if (index >= position) return i;
		}
		return editables.length - 1;
	}

	#slotRangeFromSelection(start: number, end: number): [number, number] {
		const editables = this.#editableIndexes();
		let from = -1;
		let to = -1;
		for (let i = 0; i < editables.length; i += 1) {
			const index = editables[i] ?? -1;
			if (from === -1 && index >= start) from = i;
			if (index <= end - 1) to = i;
		}
		if (from === -1) from = 0;
		if (to === -1) to = from;
		return [from, to];
	}

	#nextEditableIndex(position: number): number {
		const mask = this.mask || '';
		if (!mask) return position;
		for (let i = Math.max(0, position); i < mask.length; i += 1) {
			if (this.#isMaskToken(mask[i] ?? '')) return i;
		}
		return mask.length;
	}

	#previousEditableIndex(position: number): number {
		const mask = this.mask || '';
		if (!mask) return Math.max(0, position - 1);
		for (let i = Math.max(0, position - 1); i >= 0; i -= 1) {
			if (this.#isMaskToken(mask[i] ?? '')) return i;
		}
		return this.#nextEditableIndex(0);
	}
}

export const defineInputMask = createDefine('mb-inputmask', MbInputMask);
export {};
