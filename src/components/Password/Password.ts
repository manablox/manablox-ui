import type { AttributeConverter } from '../../core/types.js';
import { createDefine } from '../../core/define.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { applyPosition, startAutoPosition } from '../../overlay/Positioning.js';
import { PASSWORD_STYLES } from './Password.styles.js';

type StrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

export class MbPassword extends MbBaseComponent {
	static readonly _componentName = 'mb-password';
	static readonly _componentStyles = PASSWORD_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['model-value', 'string'],
			['placeholder', 'string'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['feedback', 'boolean'],
			['toggle-mask', 'boolean'],
			['variant', 'string'],
			['fluid', 'boolean'],
			['strong-regex', 'string'],
			['medium-regex', 'string'],
			['prompt-label', 'string'],
			['weak-label', 'string'],
			['medium-label', 'string'],
			['strong-label', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbPassword.attributeConverters.keys());
	}

	#value = '';
	#maskVisible = false;
	#focused = false;
	#portalKey = `mb-password-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;

	connectedCallback(): void {
		super.connectedCallback();
		this.#value = this.getAttribute('model-value') ?? '';
		this._addCleanup(() => this.#hideOverlay());
	}

	disconnectedCallback(): void {
		this.#hideOverlay();
		super.disconnectedCallback();
	}

	get modelValue(): string {
		return this.#value;
	}
	set modelValue(value: string) {
		this.#value = value ?? '';
		this._reflectToAttr('model-value', this.#value, 'string');
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

	get feedback(): boolean {
		const raw = this.getAttribute('feedback');
		if (raw === null) return true;
		return !['false', '0', 'no', 'off'].includes(raw.toLowerCase());
	}

	get toggleMask(): boolean {
		return this._bool('toggle-mask');
	}

	get variant(): 'outlined' | 'filled' {
		return this._str('variant', 'outlined') === 'filled' ? 'filled' : 'outlined';
	}

	get fluid(): boolean {
		return this._bool('fluid');
	}

	get strongRegex(): string {
		return this._str('strong-regex', '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$');
	}

	get mediumRegex(): string {
		return this._str('medium-regex', '^(?=.*[a-zA-Z])(?=.*\\d).{6,}$');
	}

	get promptLabel(): string {
		return this._str('prompt-label', 'Enter a password');
	}

	get weakLabel(): string {
		return this._str('weak-label', 'Weak');
	}

	get mediumLabel(): string {
		return this._str('medium-label', 'Medium');
	}

	get strongLabel(): string {
		return this._str('strong-label', 'Strong');
	}

	protected _render(): string {
		const classes = [
			'mb-password',
			this.invalid ? 'mb-invalid' : '',
			this.fluid ? 'mb-password-fluid' : '',
			this.variant === 'filled' ? 'mb-password-filled' : '',
		]
			.filter(Boolean)
			.join(' ');

		return this._html`
			<div class="${classes}">
				<input
					class="mb-password-input"
					type="${this.#maskVisible ? 'text' : 'password'}"
					value="${this._escape(this.#value)}"
					placeholder="${this._escape(this.placeholder)}"
					${this.disabled ? 'disabled' : ''}
					aria-invalid="${this.invalid ? 'true' : 'false'}"
				/>
				${this.toggleMask
					? `<button type="button" class="mb-password-toggle" ${this.disabled ? 'disabled' : ''} aria-label="${this.#maskVisible ? 'Hide password' : 'Show password'}"><span class="mb-password-toggle-icon">${this.#maskVisible ? '🙈' : '👁'}</span></button>`
					: ''}
			</div>
		`;
	}

	protected _afterRender(): void {
		const input = this._qs<HTMLInputElement>('.mb-password-input');
		if (!input) return;

		if (input.value !== this.#value) {
			input.value = this.#value;
		}

		const onInput = (event: Event) => {
			const target = event.target as HTMLInputElement;
			this.#value = target.value;
			this._reflectToAttr('model-value', this.#value, 'string');
			this.emit('mb-input', { originalEvent: event, value: this.#value });
			if (this.feedback && this.#focused) {
				this.#showOverlay();
			}
		};

		const onChange = (event: Event) => {
			this.emit('mb-change', { originalEvent: event, value: this.#value });
		};

		const onFocus = () => {
			this.#focused = true;
			if (this.feedback && !this.disabled) {
				this.#showOverlay();
			}
		};

		const onBlur = () => {
			this.#focused = false;
			window.setTimeout(() => {
				if (!this.#focused) {
					this.#hideOverlay();
				}
			}, 80);
		};

		input.addEventListener('input', onInput);
		input.addEventListener('change', onChange);
		input.addEventListener('focus', onFocus);
		input.addEventListener('blur', onBlur);

		this._addCleanup(() => input.removeEventListener('input', onInput));
		this._addCleanup(() => input.removeEventListener('change', onChange));
		this._addCleanup(() => input.removeEventListener('focus', onFocus));
		this._addCleanup(() => input.removeEventListener('blur', onBlur));

		const toggle = this._qs<HTMLButtonElement>('.mb-password-toggle');
		if (toggle) {
			const onToggleMouseDown = (event: MouseEvent) => {
				event.preventDefault();
			};

			const onToggleClick = () => {
				if (this.disabled) return;
				this.#maskVisible = !this.#maskVisible;
				this._scheduleRender();
				if (this.feedback && this.#focused) {
					this.#showOverlay();
				}
			};

			toggle.addEventListener('mousedown', onToggleMouseDown);
			toggle.addEventListener('click', onToggleClick);

			this._addCleanup(() => toggle.removeEventListener('mousedown', onToggleMouseDown));
			this._addCleanup(() => toggle.removeEventListener('click', onToggleClick));
		}
	}

	#showOverlay(): void {
		if (!this.feedback) return;

		const input = this._qs<HTMLInputElement>('.mb-password-input');
		if (!input) return;

		if (!this.#portalHost) {
			this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		}

		const strength = this.#strength();
		const strengthLabel = this.#strengthLabel(strength);

		this.#portalHost.innerHTML = this._html`
			<div class="mb-password-panel" data-strength="${strength}">
				<div class="mb-password-meter">
					<span class="mb-password-meter-segment" data-index="0"></span>
					<span class="mb-password-meter-segment" data-index="1"></span>
					<span class="mb-password-meter-segment" data-index="2"></span>
					<span class="mb-password-meter-segment" data-index="3"></span>
				</div>
				<div class="mb-password-info">${this._escape(strengthLabel)}</div>
			</div>
		`;

		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-password-panel');
		if (!panel) return;

		this.#positionCleanup?.();
		this.#positionCleanup = null;

		void applyPosition(input, panel, {
			placement: 'bottom-start',
			offsetDistance: 8,
			flip: true,
			shift: true,
		});

		this.#positionCleanup = startAutoPosition(input, panel, {
			placement: 'bottom-start',
			offsetDistance: 8,
			flip: true,
			shift: true,
		});
	}

	#hideOverlay(): void {
		this.#positionCleanup?.();
		this.#positionCleanup = null;

		if (this.#portalHost) {
			removePortal(this.#portalKey);
			this.#portalHost = null;
		}
	}

	#strength(): StrengthLevel {
		if (!this.#value) return 'empty';

		const strong = this.#testRegex(this.strongRegex, this.#value);
		if (strong) return 'strong';

		const medium = this.#testRegex(this.mediumRegex, this.#value);
		if (medium) return 'medium';

		return 'weak';
	}

	#strengthLabel(strength: StrengthLevel): string {
		switch (strength) {
			case 'weak':
				return this.weakLabel;
			case 'medium':
				return this.mediumLabel;
			case 'strong':
				return this.strongLabel;
			default:
				return this.promptLabel;
		}
	}

	#testRegex(regexSource: string, value: string): boolean {
		try {
			return new RegExp(regexSource).test(value);
		} catch {
			return false;
		}
	}
}

export const definePassword = createDefine('mb-password', MbPassword);

export default MbPassword;
export {};
