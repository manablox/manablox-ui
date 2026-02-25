import type { ConfirmOptions } from '../../core/types.js';
import type { Unsubscribe } from '../../services/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { applyPosition, startAutoPosition } from '../../overlay/Positioning.js';
import { confirmService } from '../../services/ConfirmService.js';
import { FocusTrap } from '../../utils/FocusTrap.js';
import { CONFIRM_POPUP_STYLES } from './ConfirmPopup.styles.js';

export class MbConfirmPopup extends MbBaseComponent {
	protected static readonly _componentName = 'mb-confirmpopup';
	protected static readonly _componentStyles = CONFIRM_POPUP_STYLES;

	static get observedAttributes(): string[] {
		return [
			'group',
			'accept-class',
			'reject-class',
			'accept-icon',
			'reject-icon',
			'accept-label',
			'reject-label',
			'default-focus',
		];
	}

	#portalKey = `mb-confirmpopup-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#focusTrap: FocusTrap | null = null;
	#overlayCleanupFns: Array<() => void> = [];
	#hideTimer: number | null = null;
	#isOpen = false;
	#unsubscribe: Unsubscribe | null = null;
	#options: ConfirmOptions | null = null;
	#actionHandled = false;

	constructor() {
		super();
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.innerHTML = '';

		this.#unsubscribe = confirmService.subscribe(state => {
			this.#options = state.options;
			const shouldShow =
				state.visible &&
				Boolean(state.options?.target) &&
				this.#matchesGroup(state.options);

			if (shouldShow) {
				this.#actionHandled = false;
				this.#open();
			} else {
				this.#hide();
			}
		});

		this._addCleanup(() => {
			this.#unsubscribe?.();
			this.#unsubscribe = null;
		});
		this._addCleanup(() => this.#teardown(true));
	}

	disconnectedCallback(): void {
		this.#teardown(true);
		super.disconnectedCallback();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue === newValue || !this.isConnected) return;
		if (this.#isOpen) {
			this.#render();
		}
	}

	get group(): string {
		return this.getAttribute('group') ?? '';
	}

	set group(value: string) {
		this.setAttribute('group', value ?? '');
	}

	get acceptClass(): string {
		return this.getAttribute('accept-class') ?? '';
	}

	set acceptClass(value: string) {
		this.setAttribute('accept-class', value ?? '');
	}

	get rejectClass(): string {
		return this.getAttribute('reject-class') ?? '';
	}

	set rejectClass(value: string) {
		this.setAttribute('reject-class', value ?? '');
	}

	get acceptIcon(): string {
		return this.getAttribute('accept-icon') ?? '';
	}

	set acceptIcon(value: string) {
		this.setAttribute('accept-icon', value ?? '');
	}

	get rejectIcon(): string {
		return this.getAttribute('reject-icon') ?? '';
	}

	set rejectIcon(value: string) {
		this.setAttribute('reject-icon', value ?? '');
	}

	get acceptLabel(): string {
		return this.getAttribute('accept-label') ?? '';
	}

	set acceptLabel(value: string) {
		this.setAttribute('accept-label', value ?? '');
	}

	get rejectLabel(): string {
		return this.getAttribute('reject-label') ?? '';
	}

	set rejectLabel(value: string) {
		this.setAttribute('reject-label', value ?? '');
	}

	get defaultFocus(): 'accept' | 'reject' | 'close' | 'none' {
		const value = this.getAttribute('default-focus');
		if (value === 'accept' || value === 'reject' || value === 'close' || value === 'none') {
			return value;
		}
		return 'accept';
	}

	set defaultFocus(value: 'accept' | 'reject' | 'close' | 'none') {
		this.setAttribute('default-focus', value);
	}

	protected _render(): string {
		return '';
	}

	#open(): void {
		if (!this.#options?.target) return;

		if (!this.#portalHost) {
			this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		}

		this.#isOpen = true;
		this.#render();
	}

	#render(): void {
		if (!this.#portalHost || !this.#options?.target) return;

		const options = this.#options;
		const acceptLabel = (options.acceptLabel ?? this.acceptLabel) || 'Yes';
		const rejectLabel = (options.rejectLabel ?? this.rejectLabel) || 'No';
		const acceptIcon = options.acceptIcon ?? this.acceptIcon;
		const rejectIcon = options.rejectIcon ?? this.rejectIcon;
		const acceptClass = [
			'mb-confirmpopup-button',
			'mb-confirmpopup-accept',
			this.acceptClass,
			options.acceptClass ?? '',
		]
			.filter(Boolean)
			.join(' ');
		const rejectClass = [
			'mb-confirmpopup-button',
			'mb-confirmpopup-reject',
			this.rejectClass,
			options.rejectClass ?? '',
		]
			.filter(Boolean)
			.join(' ');

		this.#portalHost.innerHTML = this._html`
			<div class="mb-confirmpopup mb-enter-from" role="alertdialog" aria-modal="false" data-mb-confirmpopup-key="${this.#portalKey}">
				<div class="mb-confirmpopup-content">
					${options.icon ? `<span class="mb-confirmpopup-icon" aria-hidden="true">${this._escape(options.icon)}</span>` : ''}
					<p class="mb-confirmpopup-message">${this._escape(options.message ?? '')}</p>
				</div>
				<div class="mb-confirmpopup-footer">
					<button type="button" class="${this._escape(rejectClass)}" data-mb-action="reject">
						${rejectIcon ? `<span aria-hidden="true">${this._escape(rejectIcon)}</span>` : ''}
						<span>${this._escape(rejectLabel)}</span>
					</button>
					<button type="button" class="${this._escape(acceptClass)}" data-mb-action="accept">
						${acceptIcon ? `<span aria-hidden="true">${this._escape(acceptIcon)}</span>` : ''}
						<span>${this._escape(acceptLabel)}</span>
					</button>
				</div>
				<div class="mb-confirmpopup-arrow"></div>
			</div>
		`;

		const popup = this.#portalHost.querySelector<HTMLElement>('.mb-confirmpopup');
		const arrow = this.#portalHost.querySelector<HTMLElement>('.mb-confirmpopup-arrow');
		const acceptButton = this.#portalHost.querySelector<HTMLButtonElement>('[data-mb-action="accept"]');
		const rejectButton = this.#portalHost.querySelector<HTMLButtonElement>('[data-mb-action="reject"]');
		if (!popup || !arrow || !acceptButton || !rejectButton) return;

		this.#clearOverlayListeners();
		this.#positionCleanup?.();
		this.#positionCleanup = null;

		requestAnimationFrame(() => popup.classList.remove('mb-enter-from'));

		const target = options.target;
		if (!target) return;

		void applyPosition(target, popup, {
			placement: 'bottom',
			offsetDistance: 10,
			flip: true,
			shift: true,
			arrowEl: arrow,
		}).then(result => {
			const side = result.placement.split('-')[0];
			popup.classList.remove(
				'mb-confirmpopup-top',
				'mb-confirmpopup-right',
				'mb-confirmpopup-bottom',
				'mb-confirmpopup-left'
			);
			popup.classList.add(`mb-confirmpopup-${side}`);
		});

		this.#positionCleanup = startAutoPosition(target, popup, {
			placement: 'bottom',
			offsetDistance: 10,
			flip: true,
			shift: true,
			arrowEl: arrow,
		});

		const onAccept = () => {
			this.#actionHandled = true;
			this.#options?.accept?.();
			this.emit('mb-accept', { options: this.#options });
			confirmService.close();
		};
		acceptButton.addEventListener('click', onAccept);
		this.#overlayCleanupFns.push(() => acceptButton.removeEventListener('click', onAccept));

		const onReject = () => {
			this.#rejectAndClose();
		};
		rejectButton.addEventListener('click', onReject);
		this.#overlayCleanupFns.push(() => rejectButton.removeEventListener('click', onReject));

		const onDocumentMouseDown = (event: MouseEvent) => {
			const node = event.target as Node | null;
			if (!node) return;

			const clickedInsidePopup = popup.contains(node);
			const clickedTarget = options.target?.contains(node) ?? false;
			if (!clickedInsidePopup && !clickedTarget) {
				this.#rejectAndClose();
			}
		};
		document.addEventListener('mousedown', onDocumentMouseDown);
		this.#overlayCleanupFns.push(() => document.removeEventListener('mousedown', onDocumentMouseDown));

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && this.#readCloseOnEscape()) {
				this.#rejectAndClose();
			}
		};
		document.addEventListener('keydown', onEscape);
		this.#overlayCleanupFns.push(() => document.removeEventListener('keydown', onEscape));

		if (!popup.hasAttribute('tabindex')) {
			popup.setAttribute('tabindex', '-1');
		}

		const initialFocus = this.#resolveInitialFocus(acceptButton, rejectButton);
		this.#focusTrap?.deactivate();
		this.#focusTrap = new FocusTrap(popup, {
			initialFocus,
		});
		this.#focusTrap.activate();
	}

	#hide(immediate = false): void {
		if (!this.#isOpen || !this.#portalHost) return;

		const finalize = () => {
			this.#positionCleanup?.();
			this.#positionCleanup = null;
			this.#focusTrap?.deactivate();
			this.#focusTrap = null;
			this.#clearOverlayListeners();
			removePortal(this.#portalKey);
			this.#portalHost = null;
			this.#isOpen = false;
		};

		if (immediate) {
			finalize();
			return;
		}

		const popup = this.#portalHost.querySelector<HTMLElement>('.mb-confirmpopup');
		popup?.classList.add('mb-leave-active');

		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
		}

		this.#hideTimer = window.setTimeout(() => {
			this.#hideTimer = null;
			finalize();
		}, 150);
	}

	#teardown(immediate = false): void {
		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
			this.#hideTimer = null;
		}
		this.#hide(immediate);
	}

	#rejectAndClose(): void {
		if (this.#actionHandled) return;
		this.#actionHandled = true;
		this.#options?.reject?.();
		this.emit('mb-reject', { options: this.#options });
		confirmService.close();
	}

	#readCloseOnEscape(): boolean {
		if (this.#options?.closeOnEscape != null) {
			return this.#options.closeOnEscape;
		}
		return true;
	}

	#resolveInitialFocus(
		acceptButton: HTMLButtonElement,
		rejectButton: HTMLButtonElement
	): HTMLElement | boolean {
		const focusTarget = this.#options?.defaultFocus ?? this.defaultFocus;
		if (focusTarget === 'none' || focusTarget === 'close') return false;
		if (focusTarget === 'reject') return rejectButton;
		return acceptButton;
	}

	#matchesGroup(options: ConfirmOptions | null): boolean {
		if (!options) return false;
		if (!this.group) return true;
		return (options.group ?? '') === this.group;
	}

	#clearOverlayListeners(): void {
		for (const cleanup of this.#overlayCleanupFns) {
			cleanup();
		}
		this.#overlayCleanupFns = [];
	}
}
