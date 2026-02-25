import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { RATING_STYLES } from './Rating.styles.js';

export class MbRating extends MbBaseComponent {
	static readonly _componentName = 'mb-rating';
	static readonly _componentStyles = RATING_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'number'],
			['stars', 'number'],
			['disabled', 'boolean'],
			['readonly', 'boolean'],
			['invalid', 'boolean'],
			['cancel', 'boolean'],
			['on-icon', 'string'],
			['off-icon', 'string'],
			['cancel-icon', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbRating.attributeConverters.keys());
	}

	#value: number | null = null;
	#hoverValue: number | null = null;

	connectedCallback(): void {
		super.connectedCallback();
		const initial = this._num('model-value', null);
		this.#value = initial;
	}

	get modelValue(): number | null {
		return this.#value;
	}
	set modelValue(value: number | null) {
		this.#value = value == null ? null : Math.max(1, Math.min(this.stars, Math.trunc(value)));
		this._reflectToAttr('model-value', this.#value, 'number');
		this._scheduleRender();
	}

	get stars(): number {
		return Math.max(1, this._num('stars', 5) ?? 5);
	}

	get disabled(): boolean {
		return this._bool('disabled');
	}

	get readonly(): boolean {
		return this._bool('readonly');
	}

	get invalid(): boolean {
		return this._bool('invalid');
	}

	get cancel(): boolean {
		const raw = this.getAttribute('cancel');
		if (raw === null) return true;
		return !['false', '0', 'no', 'off'].includes(raw.toLowerCase());
	}

	get onIcon(): string {
		return this._str('on-icon');
	}

	get offIcon(): string {
		return this._str('off-icon');
	}

	get cancelIcon(): string {
		return this._str('cancel-icon');
	}

	protected _render(): string {
		const classes = [
			'mb-rating',
			this.disabled ? 'mb-disabled' : '',
			this.readonly ? 'mb-readonly' : '',
			this.invalid ? 'mb-invalid' : '',
		]
			.filter(Boolean)
			.join(' ');

		const displayValue = this.#hoverValue ?? this.#value ?? 0;

		const starMarkup = Array.from({ length: this.stars }, (_, i) => {
			const value = i + 1;
			const active = value <= displayValue;
			return this._html`
				<button
					type="button"
					class="mb-rating-item ${active ? 'mb-active' : ''}"
					data-value="${value}"
					role="radio"
					aria-checked="${this.#value === value ? 'true' : 'false'}"
					aria-label="${value} star"
					${this.disabled ? 'disabled' : ''}
					tabindex="${this.disabled ? '-1' : '0'}"
				>
					${active ? this.#renderOnIcon() : this.#renderOffIcon()}
				</button>
			`;
		}).join('');

		return this._html`
			<div class="${classes}" role="group" aria-label="Rating">
				${this.cancel
					? `<button type="button" class="mb-rating-cancel" data-value="0" role="radio" aria-checked="${this.#value == null ? 'true' : 'false'}" aria-label="Clear rating" ${this.disabled ? 'disabled' : ''} tabindex="${this.disabled ? '-1' : '0'}">${this.#renderCancelIcon()}</button>`
					: ''}
				${starMarkup}
			</div>
		`;
	}

	protected _afterRender(): void {
		const root = this._qs<HTMLElement>('.mb-rating');
		if (!root) return;

		const interactive = !this.disabled && !this.readonly;

		const onClick = (event: MouseEvent) => {
			if (!interactive) return;
			const target = event.target as HTMLElement;
			const button = target.closest<HTMLButtonElement>('[data-value]');
			if (!button) return;

			const raw = button.dataset.value;
			if (!raw) return;

			const value = Number(raw);
			if (Number.isNaN(value)) return;

			if (value <= 0) {
				this.#value = null;
				this.removeAttribute('model-value');
			} else {
				this.#value = Math.min(this.stars, value);
				this._reflectToAttr('model-value', this.#value, 'number');
			}

			this.#hoverValue = null;
			this._scheduleRender();
			this.emit('mb-change', { value: this.#value });
		};

		const onMouseOver = (event: MouseEvent) => {
			if (!interactive) return;
			const target = event.target as HTMLElement;
			const button = target.closest<HTMLButtonElement>('.mb-rating-item[data-value]');
			if (!button) return;

			const value = Number(button.dataset.value ?? '0');
			if (value <= 0 || Number.isNaN(value)) return;
			this.#hoverValue = value;
			this._scheduleRender();
		};

		const onMouseLeave = () => {
			if (!interactive) return;
			if (this.#hoverValue != null) {
				this.#hoverValue = null;
				this._scheduleRender();
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (!interactive) return;

			if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
				event.preventDefault();
				const current = this.#value ?? 0;
				this.#value = Math.min(this.stars, current + 1);
				this._reflectToAttr('model-value', this.#value, 'number');
				this._scheduleRender();
				this.emit('mb-change', { value: this.#value });
			}

			if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
				event.preventDefault();
				const current = this.#value ?? 1;
				const next = current - 1;
				this.#value = next <= 0 ? null : next;
				if (this.#value == null) {
					this.removeAttribute('model-value');
				} else {
					this._reflectToAttr('model-value', this.#value, 'number');
				}
				this._scheduleRender();
				this.emit('mb-change', { value: this.#value });
			}
		};

		root.addEventListener('click', onClick);
		root.addEventListener('mouseover', onMouseOver);
		root.addEventListener('mouseleave', onMouseLeave);
		root.addEventListener('keydown', onKeyDown);

		this._addCleanup(() => root.removeEventListener('click', onClick));
		this._addCleanup(() => root.removeEventListener('mouseover', onMouseOver));
		this._addCleanup(() => root.removeEventListener('mouseleave', onMouseLeave));
		this._addCleanup(() => root.removeEventListener('keydown', onKeyDown));
	}

	#renderOnIcon(): string {
		return this.#renderIcon(this.onIcon, this.#defaultStar(true));
	}

	#renderOffIcon(): string {
		return this.#renderIcon(this.offIcon, this.#defaultStar(false));
	}

	#renderCancelIcon(): string {
		return this.#renderIcon(this.cancelIcon, this.#defaultCancel());
	}

	#renderIcon(icon: string, fallback: string): string {
		const trimmed = icon.trim();
		if (!trimmed) return fallback;
		if (trimmed.includes('<svg')) return trimmed;
		return `<span class="mb-rating-icon ${this._escape(trimmed)}"></span>`;
	}

	#defaultStar(filled: boolean): string {
		if (filled) {
			return '<span class="mb-rating-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.8l3.05 6.18 6.82.99-4.93 4.8 1.16 6.79L12 17.35l-6.1 3.21 1.16-6.79-4.93-4.8 6.82-.99L12 1.8z"></path></svg></span>';
		}
		return '<span class="mb-rating-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.6l2.84 5.76.24.49.54.08 6.35.92-4.6 4.49-.39.38.09.53 1.08 6.33L12.47 18.6 12 18.35l-.47.25-5.68 2.98 1.08-6.33.09-.53-.39-.38-4.6-4.49 6.35-.92.54-.08.24-.49L12 2.6z"></path></svg></span>';
	}

	#defaultCancel(): string {
		return '<span class="mb-rating-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></span>';
	}
}

export const defineRating = createDefine('mb-rating', MbRating);

export default MbRating;
export {};
