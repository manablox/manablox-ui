import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { SelectOption } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { SELECTBUTTON_STYLES } from './SelectButton.styles.js';

type AttributeConverter = 'boolean' | 'number' | 'string' | 'object';

interface NormalizedOption {
	option: string | number | SelectOption;
	label: string;
	value: unknown;
	disabled: boolean;
}

export class MbSelectButton extends MbBaseComponent {
	static readonly _componentName = 'mb-selectbutton';
	static readonly _componentStyles = SELECTBUTTON_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['options', 'object'],
			['option-label', 'string'],
			['option-value', 'string'],
			['option-disabled', 'string'],
			['model-value', 'object'],
			['multiple', 'boolean'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['unselectable', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(this.attributeConverters.keys());
	}

	options: Array<string | number | SelectOption> | null = null;
	optionLabel = 'label';
	optionValue = 'value';
	optionDisabled = 'disabled';
	modelValue: unknown = null;
	multiple = false;
	disabled = false;
	invalid = false;
	unselectable = true;

	connectedCallback(): void {
		super.connectedCallback();
	}

	protected _render(): string {
		const options = this.#normalizedOptions();
		const groupRole = this.multiple ? 'group' : 'radiogroup';
		const classes = [
			'mb-selectbutton',
			'mb-component',
			this.disabled ? 'mb-disabled' : '',
			this.invalid ? 'mb-invalid' : '',
		].filter(Boolean).join(' ');

		return this._html`
			<div part="root" class="${classes}" role="${groupRole}" aria-disabled="${this.disabled ? 'true' : 'false'}">
				${options.map((option, index) => this.#renderOption(option, index)).join('')}
			</div>
		`;
	}

	protected _afterRender(): void {
		const root = this._qs<HTMLElement>('.mb-selectbutton');
		if (!root) return;

		const onClick = (e: MouseEvent) => this.#handleClick(e);
		const onKeyDown = (e: KeyboardEvent) => this.#handleKeyDown(e);
		const onFocusIn = (e: FocusEvent) => {
			if ((e.target as HTMLElement | null)?.closest('.mb-togglebutton')) {
				this.emit('mb-focus');
			}
		};
		const onFocusOut = (e: FocusEvent) => {
			const related = e.relatedTarget as Node | null;
			if (!related || !root.contains(related)) {
				this.emit('mb-blur');
			}
		};

		root.addEventListener('click', onClick);
		root.addEventListener('keydown', onKeyDown);
		root.addEventListener('focusin', onFocusIn);
		root.addEventListener('focusout', onFocusOut);

		this._addCleanup(() => root.removeEventListener('click', onClick));
		this._addCleanup(() => root.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => root.removeEventListener('focusin', onFocusIn));
		this._addCleanup(() => root.removeEventListener('focusout', onFocusOut));
	}

	#renderOption(option: NormalizedOption, index: number): string {
		const selected = this.#isSelected(option.value);
		const disabled = this.disabled || option.disabled;
		const role = this.multiple ? 'checkbox' : 'radio';

		return `
			<button
				type="button"
				part="button"
				class="mb-togglebutton${selected ? ' mb-selected' : ''}"
				data-index="${index}"
				role="${role}"
				aria-checked="${selected ? 'true' : 'false'}"
				aria-disabled="${disabled ? 'true' : 'false'}"
				tabindex="${disabled ? '-1' : '0'}"
			>
				<span part="button-content" class="mb-togglebutton-content">
					<span part="button-label" class="mb-togglebutton-label">${this._escape(option.label)}</span>
				</span>
			</button>
		`;
	}

	#normalizedOptions(): NormalizedOption[] {
		const source = this.options ?? [];

		return source.map((entry) => {
			if (typeof entry === 'string' || typeof entry === 'number') {
				return {
					option: entry,
					label: String(entry),
					value: entry,
					disabled: false,
				};
			}

			const obj = entry as SelectOption;
			const labelRaw = obj[this.optionLabel] ?? obj.label ?? obj.value;
			const value = obj[this.optionValue] ?? obj.value ?? obj[this.optionLabel];
			const disabled = Boolean(obj[this.optionDisabled] ?? obj.disabled);

			return {
				option: obj,
				label: String(labelRaw ?? ''),
				value,
				disabled,
			};
		});
	}

	#isSelected(value: unknown): boolean {
		if (this.multiple) {
			const list = Array.isArray(this.modelValue) ? this.modelValue : [];
			return list.some(item => Object.is(item, value));
		}
		return Object.is(this.modelValue, value);
	}

	#handleClick(event: MouseEvent): void {
		const btn = (event.target as HTMLElement | null)?.closest<HTMLElement>('.mb-togglebutton[data-index]');
		if (!btn) return;
		this.#selectFromButton(btn, event);
	}

	#handleKeyDown(event: KeyboardEvent): void {
		const btn = (event.target as HTMLElement | null)?.closest<HTMLElement>('.mb-togglebutton[data-index]');
		if (!btn) return;

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.#selectFromButton(btn, event);
		}
	}

	#selectFromButton(button: HTMLElement, originalEvent: Event): void {
		if (this.disabled || button.getAttribute('aria-disabled') === 'true') return;

		const index = Number(button.getAttribute('data-index'));
		if (Number.isNaN(index)) return;

		const options = this.#normalizedOptions();
		const selected = options[index];
		if (!selected) return;

		let nextValue: unknown;

		if (this.multiple) {
			const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
			const existingIndex = current.findIndex(item => Object.is(item, selected.value));

			if (existingIndex >= 0) {
				if (!this.unselectable) return;
				current.splice(existingIndex, 1);
			} else {
				current.push(selected.value);
			}
			nextValue = current;
		} else {
			const isAlreadySelected = Object.is(this.modelValue, selected.value);
			if (isAlreadySelected && this.unselectable) {
				nextValue = null;
			} else if (isAlreadySelected) {
				return;
			} else {
				nextValue = selected.value;
			}
		}

		this.modelValue = nextValue;
		this.emit('mb-change', { value: nextValue });
		this._scheduleRender();
		this.emit('mb-focus');
	}
}

export const defineSelectButton = createDefine('mb-selectbutton', MbSelectButton);

