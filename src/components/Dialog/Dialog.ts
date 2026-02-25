import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { blockBodyScroll, unblockBodyScroll } from '../../utils/DomHandler.js';
import { FocusTrap } from '../../utils/FocusTrap.js';
import { DIALOG_STYLES } from './Dialog.styles.js';

type DialogPosition =
	| 'center'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right';

type BreakpointMap = Record<string, string>;

export class MbDialog extends MbBaseComponent {
	protected static readonly _componentName = 'mb-dialog';
	protected static readonly _componentStyles = DIALOG_STYLES;

	static get observedAttributes(): string[] {
		return [
			'visible',
			'header',
			'modal',
			'dismissable-mask',
			'closable',
			'close-on-escape',
			'draggable',
			'resizable',
			'maximizable',
			'maximized',
			'position',
			'style',
			'header-style',
			'content-style',
			'footer-style',
			'block-scroll',
			'breakpoints',
		];
	}

	#portalKey = `mb-dialog-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#focusTrap: FocusTrap | null = null;
	#templateHtml = '';
	#portalCleanupFns: Array<() => void> = [];
	#hideTimer: number | null = null;
	#isOpen = false;

	constructor() {
		super();
	}

	connectedCallback(): void {
		if (!this.#templateHtml) {
			this.#templateHtml = this.innerHTML;
		}

		super.connectedCallback();
		this.innerHTML = '';

		this._addCleanup(() => this.#teardown(true));

		if (this.visible) {
			this.#show();
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue === newValue || !this.isConnected) return;

		if (name === 'visible') {
			if (this.visible) {
				this.#show();
			} else {
				this.#hide();
			}
			return;
		}

		if (this.#isOpen) {
			this.#renderPortal();
		}
	}

	get visible(): boolean {
		return this.#readBoolAttr('visible', false);
	}
	set visible(value: boolean) {
		this.setAttribute('visible', String(Boolean(value)));
	}

	get header(): string {
		return this.getAttribute('header') ?? '';
	}
	set header(value: string) {
		this.setAttribute('header', value ?? '');
	}

	get modal(): boolean {
		return this.#readBoolAttr('modal', true);
	}
	set modal(value: boolean) {
		this.setAttribute('modal', String(Boolean(value)));
	}

	get dismissableMask(): boolean {
		return this.#readBoolAttr('dismissable-mask', false);
	}
	set dismissableMask(value: boolean) {
		this.setAttribute('dismissable-mask', String(Boolean(value)));
	}

	get closable(): boolean {
		return this.#readBoolAttr('closable', true);
	}
	set closable(value: boolean) {
		this.setAttribute('closable', String(Boolean(value)));
	}

	get closeOnEscape(): boolean {
		return this.#readBoolAttr('close-on-escape', true);
	}
	set closeOnEscape(value: boolean) {
		this.setAttribute('close-on-escape', String(Boolean(value)));
	}

	get draggable(): boolean {
		return this.#readBoolAttr('draggable', true);
	}
	set draggable(value: boolean) {
		this.setAttribute('draggable', String(Boolean(value)));
	}

	get resizable(): boolean {
		return this.#readBoolAttr('resizable', false);
	}
	set resizable(value: boolean) {
		this.setAttribute('resizable', String(Boolean(value)));
	}

	get maximizable(): boolean {
		return this.#readBoolAttr('maximizable', false);
	}
	set maximizable(value: boolean) {
		this.setAttribute('maximizable', String(Boolean(value)));
	}

	get maximized(): boolean {
		return this.#readBoolAttr('maximized', false);
	}
	set maximized(value: boolean) {
		this.setAttribute('maximized', String(Boolean(value)));
	}

	get position(): DialogPosition {
		const value = this.getAttribute('position') as DialogPosition | null;
		return value ?? 'center';
	}
	set position(value: DialogPosition) {
		this.setAttribute('position', value);
	}

	get blockScroll(): boolean {
		return this.#readBoolAttr('block-scroll', false);
	}
	set blockScroll(value: boolean) {
		this.setAttribute('block-scroll', String(Boolean(value)));
	}

	get breakpoints(): BreakpointMap | null {
		const raw = this.getAttribute('breakpoints');
		if (!raw) return null;
		try {
			return JSON.parse(raw) as BreakpointMap;
		} catch {
			return null;
		}
	}
	set breakpoints(value: BreakpointMap | null) {
		if (!value) {
			this.removeAttribute('breakpoints');
			return;
		}
		this.setAttribute('breakpoints', JSON.stringify(value));
	}

	protected _render(): string {
		return '';
	}

	#show(): void {
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

		if (this.blockScroll) {
			blockBodyScroll();
		}

		this.#renderPortal();
		this.emit('mb-show');
	}

	#hide(immediate = false): void {
		if (!this.#isOpen || !this.#portalHost) return;

		const finalize = () => {
			if (this.blockScroll) {
				unblockBodyScroll();
			}

			this.#focusTrap?.deactivate();
			this.#focusTrap = null;

			this.#clearPortalListeners();
			removePortal(this.#portalKey);
			this.#portalHost = null;
			this.#isOpen = false;
			this.emit('mb-hide');
		};

		if (immediate) {
			finalize();
			return;
		}

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-dialog-mask');
		mask?.classList.add('mb-leave-active');

		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
		}

		this.#hideTimer = window.setTimeout(() => {
			this.#hideTimer = null;
			finalize();
		}, 220);
	}

	#teardown(immediate = false): void {
		if (this.#hideTimer !== null) {
			window.clearTimeout(this.#hideTimer);
			this.#hideTimer = null;
		}
		this.#hide(immediate);
	}

	#renderPortal(): void {
		if (!this.#portalHost) return;

		const headerSlot = this.#getSlotMarkup('header');
		const contentSlot = this.#getSlotMarkup();
		const footerSlot = this.#getSlotMarkup('footer');
		const hasHeader = Boolean(headerSlot || this.header);
		const hasFooter = Boolean(footerSlot);
		const positionClass = this.position === 'center' ? '' : `mb-dialog-${this.position}`;

		const dialogStyle = [
			this.getAttribute('style') ?? '',
			this.resizable ? 'resize: both;' : '',
			this.resizable ? 'overflow: auto;' : '',
		]
			.filter(Boolean)
			.join(' ');

		this.#portalHost.innerHTML = this._html`
			<div
				class="mb-dialog-mask ${positionClass} ${this.modal ? '' : 'mb-dialog-mask-non-modal'} mb-enter-from"
				data-mb-dialog-key="${this.#portalKey}"
			>
				<div class="mb-dialog ${this.maximized ? 'mb-dialog-maximized' : ''}" role="dialog" aria-modal="${this.modal ? 'true' : 'false'}" style="${this._escape(dialogStyle)}">
					${hasHeader
						? `<div class="mb-dialog-header ${this.draggable && !this.maximized ? 'mb-dialog-header-draggable' : ''}" style="${this._escape(this.getAttribute('header-style') ?? '')}">
						<div class="mb-dialog-title">${headerSlot || this._escape(this.header)}</div>
						<div class="mb-dialog-header-actions">
							${this.maximizable ? `<button type="button" class="mb-dialog-maximize-button" aria-label="${this.maximized ? 'restore' : 'maximize'}">${this.maximized ? '🗗' : '🗖'}</button>` : ''}
							${this.closable ? '<button type="button" class="mb-dialog-close-button" aria-label="close">✕</button>' : ''}
						</div>
					</div>`
						: ''}
					<div class="mb-dialog-content" style="${this._escape(this.getAttribute('content-style') ?? '')}">${contentSlot}</div>
					${hasFooter
						? `<div class="mb-dialog-footer" style="${this._escape(this.getAttribute('footer-style') ?? '')}">${footerSlot}</div>`
						: ''}
				</div>
				${this.#breakpointStyles()}
			</div>
		`;

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-dialog-mask');
		const dialog = this.#portalHost.querySelector<HTMLElement>('.mb-dialog');
		const closeButton = this.#portalHost.querySelector<HTMLButtonElement>('.mb-dialog-close-button');
		const maximizeButton = this.#portalHost.querySelector<HTMLButtonElement>('.mb-dialog-maximize-button');
		const headerEl = this.#portalHost.querySelector<HTMLElement>('.mb-dialog-header');

		if (!mask || !dialog) return;

		this.#clearPortalListeners();

		requestAnimationFrame(() => {
			mask.classList.remove('mb-enter-from');
		});

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && this.closeOnEscape) {
				this.#requestClose('escape');
			}
		};
		document.addEventListener('keydown', onEscape);
		this.#addPortalCleanup(() => document.removeEventListener('keydown', onEscape));

		const onMaskClick = (event: MouseEvent) => {
			if (event.target === mask && this.modal && this.dismissableMask) {
				this.#requestClose('mask');
			}
		};
		mask.addEventListener('click', onMaskClick);
		this.#addPortalCleanup(() => mask.removeEventListener('click', onMaskClick));

		if (closeButton) {
			const onClose = () => this.#requestClose('close-button');
			closeButton.addEventListener('click', onClose);
			this.#addPortalCleanup(() => closeButton.removeEventListener('click', onClose));
		}

		if (maximizeButton) {
			const onMaximize = () => {
				this.maximized = !this.maximized;
				this.emit(this.maximized ? 'mb-maximize' : 'mb-unmaximize');
			};
			maximizeButton.addEventListener('click', onMaximize);
			this.#addPortalCleanup(() => maximizeButton.removeEventListener('click', onMaximize));
		}

		if (headerEl && this.draggable && !this.maximized) {
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

		this.#focusTrap?.deactivate();
		this.#focusTrap = new FocusTrap(dialog);
		this.#focusTrap.activate();
	}

	#breakpointStyles(): string {
		const breakpoints = this.breakpoints;
		if (!breakpoints || Object.keys(breakpoints).length === 0) return '';

		const rules = Object.entries(breakpoints)
			.map(
				([maxWidth, width]) =>
					`@media screen and (max-width: ${maxWidth}) { [data-mb-dialog-key="${this.#portalKey}"] .mb-dialog { width: ${width} !important; } }`
			)
			.join(' ');

		return `<style>${rules}</style>`;
	}

	#requestClose(reason: 'escape' | 'mask' | 'close-button'): void {
		this.emit('mb-update:visible', { value: false, reason });
		this.visible = false;
	}

	#readBoolAttr(name: string, defaultValue: boolean): boolean {
		const value = this.getAttribute(name);
		if (value === null) return defaultValue;
		const normalized = value.toLowerCase();
		return !['false', '0', 'no', 'off'].includes(normalized);
	}

	#getSlotMarkup(name?: 'header' | 'footer'): string {
		if (!this.#templateHtml) return '';

		const template = document.createElement('template');
		template.innerHTML = this.#templateHtml;

		const toMarkup = (node: ChildNode): string => {
			if (node.nodeType === Node.TEXT_NODE) {
				return node.textContent ?? '';
			}
			if (node.nodeType === Node.ELEMENT_NODE) {
				const clone = (node as Element).cloneNode(true) as Element;
				clone.removeAttribute('slot');
				return clone.outerHTML;
			}
			return '';
		};

		const nodes = Array.from(template.content.childNodes);

		if (name) {
			return nodes
				.filter(
					node =>
						node.nodeType === Node.ELEMENT_NODE &&
						(node as Element).getAttribute('slot') === name
				)
				.map(toMarkup)
				.join('');
		}

		return nodes
			.filter(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return true;
				return !(node as Element).hasAttribute('slot');
			})
			.map(toMarkup)
			.join('');
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
