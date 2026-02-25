import type { ConfirmOptions } from '../../core/types.js';
import type { Unsubscribe } from '../../services/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { confirmService } from '../../services/ConfirmService.js';
import { blockBodyScroll, unblockBodyScroll } from '../../utils/DomHandler.js';
import { FocusTrap } from '../../utils/FocusTrap.js';
import { CONFIRM_DIALOG_STYLES } from './ConfirmDialog.styles.js';

export class MbConfirmDialog extends MbBaseComponent {
	protected static readonly _componentName = 'mb-confirmdialog';
	protected static readonly _componentStyles = CONFIRM_DIALOG_STYLES;

	static get observedAttributes(): string[] {
		return [
			'group',
			'dragable',
			'closable',
			'accept-class',
			'reject-class',
			'accept-icon',
			'reject-icon',
			'accept-label',
			'reject-label',
			'default-focus',
		];
	}

	#portalKey = `mb-confirmdialog-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#focusTrap: FocusTrap | null = null;
	#portalCleanupFns: Array<() => void> = [];
	#hideTimer: number | null = null;
	#isOpen = false;
	#unsubscribe: Unsubscribe | null = null;
	#options: ConfirmOptions | null = null;

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
				Boolean(state.options) &&
				this.#matchesGroup(state.options) &&
				!state.options?.target;

			if (shouldShow) {
				this.#show();
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
			this.#renderPortal();
		}
	}

	get group(): string {
		return this.getAttribute('group') ?? '';
	}

	set group(value: string) {
		this.setAttribute('group', value ?? '');
	}

	get dragable(): boolean {
		return this.#readBoolAttr('dragable', true);
	}

	set dragable(value: boolean) {
		this.setAttribute('dragable', String(Boolean(value)));
	}

	get closable(): boolean {
		return this.#readBoolAttr('closable', true);
	}

	set closable(value: boolean) {
		this.setAttribute('closable', String(Boolean(value)));
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

	#show(): void {
		if (!this.#options) return;

		if (this.#isOpen) {
			this.#renderPortal();
			return;
		}

		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
			this.#hideTimer = null;
		}

		this.#portalHost = createPortal(this.#portalKey, this, 'modal');
		this.#isOpen = true;

		if (this.#options.blockScroll) {
			blockBodyScroll();
		}

		this.#renderPortal();
	}

	#hide(immediate = false): void {
		if (!this.#isOpen || !this.#portalHost) return;

		const finalize = () => {
			if (this.#options?.blockScroll) {
				unblockBodyScroll();
			}

			this.#focusTrap?.deactivate();
			this.#focusTrap = null;

			this.#clearPortalListeners();
			removePortal(this.#portalKey);
			this.#portalHost = null;
			this.#isOpen = false;
		};

		if (immediate) {
			finalize();
			return;
		}

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-confirmdialog-mask');
		mask?.classList.add('mb-leave-active');

		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
		}

		this.#hideTimer = window.setTimeout(() => {
			this.#hideTimer = null;
			finalize();
		}, 180);
	}

	#teardown(immediate = false): void {
		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
			this.#hideTimer = null;
		}
		this.#hide(immediate);
	}

	#renderPortal(): void {
		if (!this.#portalHost || !this.#options) return;

		const options = this.#options;
		const header = options.header ?? '';
		const hasHeader = Boolean(header || this.closable);
		const acceptLabel = (options.acceptLabel ?? this.acceptLabel) || 'Yes';
		const rejectLabel = (options.rejectLabel ?? this.rejectLabel) || 'No';
		const acceptIcon = options.acceptIcon ?? this.acceptIcon;
		const rejectIcon = options.rejectIcon ?? this.rejectIcon;
		const acceptClass = [
			'mb-confirmdialog-button',
			'mb-confirmdialog-accept',
			this.acceptClass,
			options.acceptClass ?? '',
		]
			.filter(Boolean)
			.join(' ');
		const rejectClass = [
			'mb-confirmdialog-button',
			'mb-confirmdialog-reject',
			this.rejectClass,
			options.rejectClass ?? '',
		]
			.filter(Boolean)
			.join(' ');

		this.#portalHost.innerHTML = this._html`
			<div class="mb-confirmdialog-mask mb-enter-from" data-mb-confirmdialog-key="${this.#portalKey}">
				<div class="mb-confirmdialog" role="alertdialog" aria-modal="true" aria-labelledby="mb-confirmdialog-title-${this.#portalKey}" aria-describedby="mb-confirmdialog-message-${this.#portalKey}">
					${hasHeader
						? `<div class="mb-confirmdialog-header ${this.dragable ? 'mb-confirmdialog-header-draggable' : ''}">
							<div id="mb-confirmdialog-title-${this.#portalKey}" class="mb-confirmdialog-title">${this._escape(header)}</div>
							${this.closable ? '<button type="button" class="mb-confirmdialog-close-button" aria-label="Close">✕</button>' : ''}
						</div>`
						: ''}
					<div class="mb-confirmdialog-content">
						${options.icon ? `<span class="mb-confirmdialog-icon" aria-hidden="true">${this._escape(options.icon)}</span>` : ''}
						<p id="mb-confirmdialog-message-${this.#portalKey}" class="mb-confirmdialog-message">${this._escape(options.message ?? '')}</p>
					</div>
					<div class="mb-confirmdialog-footer">
						<button type="button" class="${this._escape(rejectClass)}" data-mb-action="reject">
							${rejectIcon ? `<span aria-hidden="true">${this._escape(rejectIcon)}</span>` : ''}
							<span>${this._escape(rejectLabel)}</span>
						</button>
						<button type="button" class="${this._escape(acceptClass)}" data-mb-action="accept">
							${acceptIcon ? `<span aria-hidden="true">${this._escape(acceptIcon)}</span>` : ''}
							<span>${this._escape(acceptLabel)}</span>
						</button>
					</div>
				</div>
			</div>
		`;

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-confirmdialog-mask');
		const dialog = this.#portalHost.querySelector<HTMLElement>('.mb-confirmdialog');
		const acceptButton = this.#portalHost.querySelector<HTMLButtonElement>('[data-mb-action="accept"]');
		const rejectButton = this.#portalHost.querySelector<HTMLButtonElement>('[data-mb-action="reject"]');
		const closeButton = this.#portalHost.querySelector<HTMLButtonElement>('.mb-confirmdialog-close-button');
		const headerEl = this.#portalHost.querySelector<HTMLElement>('.mb-confirmdialog-header');

		if (!mask || !dialog || !acceptButton || !rejectButton) return;

		this.#clearPortalListeners();

		requestAnimationFrame(() => {
			mask.classList.remove('mb-enter-from');
		});

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && this.#readCloseOnEscape()) {
				confirmService.close();
			}
		};
		document.addEventListener('keydown', onEscape);
		this.#addPortalCleanup(() => document.removeEventListener('keydown', onEscape));

		const onMaskClick = (event: MouseEvent) => {
			if (event.target === mask && this.#readDismissableMask()) {
				confirmService.close();
			}
		};
		mask.addEventListener('click', onMaskClick);
		this.#addPortalCleanup(() => mask.removeEventListener('click', onMaskClick));

		const onAccept = () => {
			this.#options?.accept?.();
			this.emit('mb-accept', { options: this.#options });
			confirmService.close();
		};
		acceptButton.addEventListener('click', onAccept);
		this.#addPortalCleanup(() => acceptButton.removeEventListener('click', onAccept));

		const onReject = () => {
			this.#options?.reject?.();
			this.emit('mb-reject', { options: this.#options });
			confirmService.close();
		};
		rejectButton.addEventListener('click', onReject);
		this.#addPortalCleanup(() => rejectButton.removeEventListener('click', onReject));

		if (closeButton) {
			const onClose = () => confirmService.close();
			closeButton.addEventListener('click', onClose);
			this.#addPortalCleanup(() => closeButton.removeEventListener('click', onClose));
		}

		if (headerEl && this.dragable) {
			const onMouseDown = (event: MouseEvent) => {
				if (event.button !== 0) return;

				const rect = dialog.getBoundingClientRect();
				const startX = event.clientX;
				const startY = event.clientY;

				dialog.style.position = 'fixed';
				dialog.style.margin = '0';

				const onMove = (moveEvent: MouseEvent) => {
					const dx = moveEvent.clientX - startX;
					const dy = moveEvent.clientY - startY;
					dialog.style.left = `${Math.max(0, rect.left + dx)}px`;
					dialog.style.top = `${Math.max(0, rect.top + dy)}px`;
				};

				const onUp = () => {
					document.removeEventListener('mousemove', onMove);
					document.removeEventListener('mouseup', onUp);
				};

				document.addEventListener('mousemove', onMove);
				document.addEventListener('mouseup', onUp);

				this.#addPortalCleanup(() => document.removeEventListener('mousemove', onMove));
				this.#addPortalCleanup(() => document.removeEventListener('mouseup', onUp));
			};

			headerEl.addEventListener('mousedown', onMouseDown);
			this.#addPortalCleanup(() => headerEl.removeEventListener('mousedown', onMouseDown));
		}

		if (!dialog.hasAttribute('tabindex')) {
			dialog.setAttribute('tabindex', '-1');
		}

		const initialFocus = this.#resolveInitialFocus(acceptButton, rejectButton, closeButton);
		this.#focusTrap?.deactivate();
		this.#focusTrap = new FocusTrap(dialog, {
			initialFocus,
		});
		this.#focusTrap.activate();
	}

	#readCloseOnEscape(): boolean {
		if (this.#options?.closeOnEscape != null) {
			return this.#options.closeOnEscape;
		}
		return true;
	}

	#readDismissableMask(): boolean {
		if (this.#options?.dismissableMask != null) {
			return this.#options.dismissableMask;
		}
		return false;
	}

	#resolveInitialFocus(
		acceptButton: HTMLButtonElement,
		rejectButton: HTMLButtonElement,
		closeButton: HTMLButtonElement | null
	): HTMLElement | boolean {
		const focusTarget = this.#options?.defaultFocus ?? this.defaultFocus;
		if (focusTarget === 'none') return false;
		if (focusTarget === 'reject') return rejectButton;
		if (focusTarget === 'close') return closeButton ?? acceptButton;
		return acceptButton;
	}

	#matchesGroup(options: ConfirmOptions | null): boolean {
		if (!options) return false;
		if (!this.group) return true;
		return (options.group ?? '') === this.group;
	}

	#readBoolAttr(name: string, defaultValue: boolean): boolean {
		const value = this.getAttribute(name);
		if (value === null) return defaultValue;
		const normalized = value.toLowerCase();
		return !['false', '0', 'no', 'off'].includes(normalized);
	}

	#addPortalCleanup(fn: () => void): void {
		this.#portalCleanupFns.push(fn);
	}

	#clearPortalListeners(): void {
		for (const fn of this.#portalCleanupFns) {
			fn();
		}
		this.#portalCleanupFns = [];
	}
}
