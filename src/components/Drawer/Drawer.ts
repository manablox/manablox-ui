import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { blockBodyScroll, unblockBodyScroll } from '../../utils/DomHandler.js';
import { FocusTrap } from '../../utils/FocusTrap.js';
import { DRAWER_STYLES } from './Drawer.styles.js';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export class MbDrawer extends MbBaseComponent {
	protected static readonly _componentName = 'mb-drawer';
	protected static readonly _componentStyles = DRAWER_STYLES;

	static get observedAttributes(): string[] {
		return [
			'visible',
			'header',
			'position',
			'size',
			'modal',
			'dismissable-mask',
			'closable',
			'close-on-escape',
			'block-scroll',
		];
	}

	#portalKey = `mb-drawer-${Math.random().toString(36).slice(2)}`;
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
		this.#teardown(true);
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

	get position(): DrawerPosition {
		const position = this.getAttribute('position') as DrawerPosition | null;
		return position ?? 'left';
	}
	set position(value: DrawerPosition) {
		this.setAttribute('position', value);
	}

	get size(): string {
		return this.getAttribute('size') ?? this.#defaultSizeFor(this.position);
	}
	set size(value: string) {
		this.setAttribute('size', value);
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

	get blockScroll(): boolean {
		return this.#readBoolAttr('block-scroll', false);
	}
	set blockScroll(value: boolean) {
		this.setAttribute('block-scroll', String(Boolean(value)));
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

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-drawer-mask');
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
		const position = this.position;

		const sizingStyle =
			position === 'left' || position === 'right'
				? `width: ${this._escape(this.size)};`
				: `height: ${this._escape(this.size)};`;

		this.#portalHost.innerHTML = this._html`
			<div class="mb-drawer-mask ${this.modal ? '' : 'mb-drawer-mask-non-modal'} mb-enter-from" data-mb-drawer-key="${this.#portalKey}">
				<div class="mb-drawer mb-drawer-${position}" role="complementary" style="${sizingStyle}">
					${hasHeader
						? `<div class="mb-drawer-header">
							<div class="mb-drawer-title">${headerSlot || this._escape(this.header)}</div>
							${this.closable ? '<button type="button" class="mb-drawer-close-button" aria-label="close">✕</button>' : ''}
						</div>`
						: ''}
					<div class="mb-drawer-content">${contentSlot}</div>
					${hasFooter ? `<div class="mb-drawer-footer">${footerSlot}</div>` : ''}
				</div>
			</div>
		`;

		const mask = this.#portalHost.querySelector<HTMLElement>('.mb-drawer-mask');
		const drawer = this.#portalHost.querySelector<HTMLElement>('.mb-drawer');
		const closeButton = this.#portalHost.querySelector<HTMLButtonElement>('.mb-drawer-close-button');

		if (!mask || !drawer) return;

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

		if (!drawer.hasAttribute('tabindex')) {
			drawer.setAttribute('tabindex', '-1');
		}

		this.#focusTrap?.deactivate();
		this.#focusTrap = new FocusTrap(drawer);
		this.#focusTrap.activate();
	}

	#requestClose(reason: 'escape' | 'mask' | 'close-button'): void {
		this.emit('mb-update:visible', { value: false, reason });
		this.visible = false;
	}

	#defaultSizeFor(position: DrawerPosition): string {
		return position === 'left' || position === 'right' ? '20rem' : '18rem';
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
