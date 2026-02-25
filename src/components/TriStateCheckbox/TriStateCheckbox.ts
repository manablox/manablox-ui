import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { TRISTATECHECKBOX_STYLES } from './TriStateCheckbox.styles.js';

type TriStateValue = boolean | null;

export class MbTriStateCheckbox extends MbBaseComponent {
	static readonly _componentName = 'mb-tristatecheckbox';
	static readonly _componentStyles = TRISTATECHECKBOX_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'string'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['variant', 'string'],
			['input-id', 'string'],
			['aria-label', 'string'],
			['aria-labelledby', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTriStateCheckbox.attributeConverters.keys());
	}

	disabled = false;
	invalid = false;
	variant: 'filled' | 'outlined' = 'outlined';
	inputId = '';
	ariaLabel = '';
	ariaLabelledby = '';

	get value(): TriStateValue {
		const raw = this.getAttribute('value');
		if (raw == null || raw === 'null') return null;
		if (raw === 'true') return true;
		if (raw === 'false') return false;
		return null;
	}

	set value(next: TriStateValue) {
		if (next === null) {
			this.setAttribute('value', 'null');
		} else {
			this.setAttribute('value', String(next));
		}
	}

	connectedCallback(): void {
		super.connectedCallback();
	}

	protected _render(): string {
		const current = this.value;
		const checked = current === true;
		const indeterminate = current === null;
		const classes = [
			'mb-tristatecheckbox',
			checked ? 'mb-tristatecheckbox-checked' : '',
			indeterminate ? 'mb-tristatecheckbox-indeterminate' : '',
			this.disabled ? 'mb-disabled' : '',
			this.invalid ? 'mb-invalid' : '',
			this.variant === 'filled' ? 'mb-variant-filled' : 'mb-variant-outlined',
		]
			.filter(Boolean)
			.join(' ');

		const icon = indeterminate
			? '<span class="mb-tristatecheckbox-indeterminate-icon">−</span>'
			: checked
				? '✓'
				: '✗';

		return this._html`
			<div
				part="root"
				class="${classes}"
				role="checkbox"
				aria-checked="${indeterminate ? 'mixed' : checked ? 'true' : 'false'}"
				aria-disabled="${this.disabled ? 'true' : 'false'}"
				tabindex="${this.disabled ? '-1' : '0'}"
				${this.inputId ? `id="${this._escape(this.inputId)}"` : ''}
				${this.ariaLabel ? `aria-label="${this._escape(this.ariaLabel)}"` : ''}
				${this.ariaLabelledby ? `aria-labelledby="${this._escape(this.ariaLabelledby)}"` : ''}
			>
				<span part="box" class="mb-tristatecheckbox-box"><span part="icon">${icon}</span></span>
				<span part="label" class="mb-tristatecheckbox-label"><slot name="label"></slot><slot></slot></span>
			</div>
		`;
	}

	protected _afterRender(): void {
		const root = this._qs<HTMLElement>('.mb-tristatecheckbox');
		if (!root) return;

		const onClick = () => this.#toggle();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();
				this.#toggle();
			}
		};

		root.addEventListener('click', onClick);
		root.addEventListener('keydown', onKeyDown);
		this._addCleanup(() => root.removeEventListener('click', onClick));
		this._addCleanup(() => root.removeEventListener('keydown', onKeyDown));
	}

	#toggle(): void {
		if (this.disabled) return;
		const current = this.value;
		const next: TriStateValue = current === null ? true : current === true ? false : null;
		this.value = next;
		this.emit('mb-change', { value: next });
		this._scheduleRender();
	}
}

export const defineTriStateCheckbox = createDefine('mb-tristatecheckbox', MbTriStateCheckbox);
export {};
