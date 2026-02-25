import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { TEXTAREA_STYLES } from './Textarea.styles.js';
import { createDefine } from '../../core/define.js';

export class MbTextarea extends MbBaseComponent {
	static readonly _componentName = 'mb-textarea';
	static readonly _componentStyles = TEXTAREA_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['auto-resize', 'boolean'],
			['rows', 'number'],
			['cols', 'number'],
			['invalid', 'boolean'],
			['variant', 'string'],
			['fluid', 'boolean'],
			['disabled', 'boolean'],
			['readonly', 'boolean'],
			['value', 'string'],
			['placeholder', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTextarea.attributeConverters.keys());
	}

	#value = '';

	constructor() {
		super();
		this.variant = 'outlined';
	}

	get variant(): string {
		return this._str('variant', 'outlined');
	}
	set variant(v: string) {
		this._reflectToAttr('variant', v, 'string');
		this._scheduleRender();
	}

	get value(): string { return this.#value; }
	set value(v: string) { this.#value = v == null ? '' : String(v); this._reflectToAttr('value', this.#value, 'string'); this._scheduleRender(); }

	protected _render(): string {
		const invalid = this.hasAttribute('invalid') ? 'mb-invalid' : '';
		const fluid = this.hasAttribute('fluid') ? 'mb-textarea-fluid' : '';
		const rows = this.getAttribute('rows') ?? '';
		const cols = this.getAttribute('cols') ?? '';
		const placeholder = this._escape(this.getAttribute('placeholder'));
		const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
		const readonly = this.hasAttribute('readonly') ? 'readonly' : '';

		const value = this._escape(this.value ?? '');

		return this._html`<div class="mb-textarea ${invalid} ${fluid}"><textarea ${rows ? `rows="${rows}"` : ''} ${cols ? `cols="${cols}"` : ''} ${disabled ? 'disabled' : ''} ${readonly ? 'readonly' : ''} placeholder="${placeholder}">${value}</textarea></div>`;
	}

	protected _afterRender(): void {
		const ta = this._qs<HTMLTextAreaElement>('textarea');
		if (!ta) return;

		if (ta.value !== this.value) ta.value = this.value ?? '';

		const autoResize = this.hasAttribute('auto-resize');

		const resize = () => {
			ta.style.height = 'auto';
			ta.style.height = `${ta.scrollHeight}px`;
		};

		const onInput = (e: Event) => {
			const el = e.target as HTMLTextAreaElement;
			this.#value = el.value;
			this._reflectToAttr('value', this.#value, 'string');
			if (autoResize) resize();
			this.emit('mb-input', { originalEvent: e, value: this.#value });
		};

		const onChange = (e: Event) => this.emit('mb-change', { originalEvent: e, value: this.#value });

		if (autoResize) {
			// initial size
			resize();
		}

		ta.addEventListener('input', onInput);
		ta.addEventListener('change', onChange);

		this._addCleanup(() => ta.removeEventListener('input', onInput));
		this._addCleanup(() => ta.removeEventListener('change', onChange));
	}
}

export const defineTextarea = createDefine('mb-textarea', MbTextarea);
export default MbTextarea;
