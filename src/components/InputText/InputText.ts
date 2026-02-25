import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { INPUTTEXT_STYLES } from './InputText.styles.js';
import { createDefine } from '../../core/define.js';

export class MbInputText extends MbBaseComponent {
	static readonly _componentName = 'mb-inputtext';
	static readonly _componentStyles = INPUTTEXT_STYLES;

	// attribute converters
	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['size', 'string'],
			['invalid', 'boolean'],
			['variant', 'string'],
			['fluid', 'boolean'],
			['placeholder', 'string'],
			['disabled', 'boolean'],
			['readonly', 'boolean'],
			['value', 'string'],
			['type', 'string'],
			['name', 'string'],
			['id', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbInputText.attributeConverters.keys());
	}

	// internal backing
	#value = '';

	constructor() {
		super();
		this.type = 'text';
		this.variant = 'outlined';
	}

	get type(): string {
		return this._str('type', 'text');
	}
	set type(v: string) {
		this._reflectToAttr('type', v, 'string');
		this._scheduleRender();
	}

	get variant(): string {
		return this._str('variant', 'outlined');
	}
	set variant(v: string) {
		this._reflectToAttr('variant', v, 'string');
		this._scheduleRender();
	}

	// reflect property <-> attribute for value
	get value(): string {
		return this.#value;
	}
	set value(v: string) {
		this.#value = v == null ? '' : String(v);
		this._reflectToAttr('value', this.#value, 'string');
		this._scheduleRender();
	}

	protected _render(): string {
		const sizeCls = this.getAttribute('size') === 'small' ? 'mb-inputtext-sm' : this.getAttribute('size') === 'large' ? 'mb-inputtext-lg' : '';
		const invalid = this.hasAttribute('invalid') ? 'mb-invalid' : '';
		const fluid = this.hasAttribute('fluid') ? 'mb-inputtext-fluid' : '';
		const filled = (this.value ?? '') !== '' ? 'mb-inputtext-filled' : '';
		const variant = this.getAttribute('variant') === 'filled' ? 'mb-inputtext-filled' : '';

		const classes = ['mb-inputtext', sizeCls, invalid, fluid, filled, variant].filter(Boolean).join(' ');

		const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
		const readonly = this.hasAttribute('readonly') ? 'readonly' : '';

		const placeholder = this._escape(this.getAttribute('placeholder'));
		const name = this._escape(this.getAttribute('name'));
		const id = this._escape(this.getAttribute('id'));
		const type = this._escape(this.getAttribute('type') ?? 'text');

		const value = this._escape(this.value ?? '');

		return this._html`<div class="${classes}"><input
			${id ? `id="${id}"` : ''}
			${name ? `name="${name}"` : ''}
			type="${type}"
			placeholder="${placeholder}"
			${disabled ? 'disabled' : ''}
			${readonly ? 'readonly' : ''}
			value="${value}" /></div>`;
	}

	protected _afterRender(): void {
		const input = this._qs<HTMLInputElement>('input');
		if (!input) return;

		// ensure value stays in sync
		if (input.value !== this.value) {
			input.value = this.value ?? '';
		}

		const onInput = (e: Event) => {
			const el = e.target as HTMLInputElement;
			this.#value = el.value;
			this._reflectToAttr('value', this.#value, 'string');
			// update filled class
			if (el.value) input.parentElement?.classList.add('mb-inputtext-filled');
			else input.parentElement?.classList.remove('mb-inputtext-filled');
			this.emit('mb-input', { originalEvent: e, value: this.#value });
		};

		const onChange = (e: Event) => {
			this.emit('mb-change', { originalEvent: e, value: this.#value });
		};

		input.addEventListener('input', onInput);
		input.addEventListener('change', onChange);

		this._addCleanup(() => input.removeEventListener('input', onInput));
		this._addCleanup(() => input.removeEventListener('change', onChange));
	}
}

export const defineInputText = createDefine('mb-inputtext', MbInputText);

export default MbInputText;
export {};
