import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { applyPosition, startAutoPosition } from '../../overlay/Positioning.js';
import { POPOVER_STYLES } from './Popover.styles.js';

type BreakpointMap = Record<string, string>;

export class MbPopover extends MbBaseComponent {
	protected static readonly _componentName = 'mb-popover';
	protected static readonly _componentStyles = POPOVER_STYLES;

	static get observedAttributes(): string[] {
		return ['visible', 'dismissable', 'close-on-escape', 'breakpoints', 'append-to'];
	}

	#portalKey = `mb-popover-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#overlayCleanupFns: Array<() => void> = [];
	#anchorEl: HTMLElement | null = null;
	#templateHtml = '';
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
		this._addCleanup(() => this.#teardown());

		if (this.visible && this.#anchorEl) {
			this.#open();
		}
	}

	disconnectedCallback(): void {
		this.#teardown();
		super.disconnectedCallback();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue === newValue || !this.isConnected) return;

		if (name === 'visible') {
			if (this.visible) {
				this.#open();
			} else {
				this.hide();
			}
			return;
		}

		if (this.#isOpen) {
			this.#render();
		}
	}

	get visible(): boolean {
		return this.#readBoolAttr('visible', false);
	}
	set visible(value: boolean) {
		this.setAttribute('visible', String(Boolean(value)));
	}

	get dismissable(): boolean {
		return this.#readBoolAttr('dismissable', true);
	}
	set dismissable(value: boolean) {
		this.setAttribute('dismissable', String(Boolean(value)));
	}

	get closeOnEscape(): boolean {
		return this.#readBoolAttr('close-on-escape', true);
	}
	set closeOnEscape(value: boolean) {
		this.setAttribute('close-on-escape', String(Boolean(value)));
	}

	get appendTo(): string {
		return this.getAttribute('append-to') ?? 'body';
	}
	set appendTo(value: string) {
		this.setAttribute('append-to', value ?? 'body');
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

	toggle(event: Event): void {
		if (this.#isOpen) {
			this.hide();
			return;
		}
		this.show(event);
	}

	show(event: Event, target?: HTMLElement): void {
		const eventTarget =
			target ??
			((event.currentTarget as HTMLElement | null) ?? (event.target as HTMLElement | null) ?? null);

		if (!eventTarget) return;

		this.#anchorEl = eventTarget;
		this.visible = true;
	}

	hide(): void {
		if (!this.#isOpen) {
			if (this.getAttribute('visible') !== 'false') {
				this.setAttribute('visible', 'false');
			}
			return;
		}

		const popover = this.#portalHost?.querySelector<HTMLElement>('.mb-popover');
		popover?.classList.add('mb-leave-active');

		window.setTimeout(() => {
			this.#destroyOverlay();
			this.emit('mb-hide');
		}, 180);

		if (this.getAttribute('visible') !== 'false') {
			this.setAttribute('visible', 'false');
		}
	}

	protected _render(): string {
		return '';
	}

	#open(): void {
		if (!this.#anchorEl) return;

		if (!this.#portalHost) {
			this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
			if (this.appendTo !== 'body') {
				const target = document.querySelector<HTMLElement>(this.appendTo);
				if (target) {
					target.appendChild(this.#portalHost);
				}
			}
		}

		this.#isOpen = true;
		this.#render();
		this.emit('mb-show');
	}

	#render(): void {
		if (!this.#portalHost || !this.#anchorEl) return;

		this.#portalHost.innerHTML = this._html`
			<div class="mb-popover mb-enter-from" role="dialog" data-mb-popover-key="${this.#portalKey}">
				<div class="mb-popover-content">${this.#getDefaultSlotMarkup()}</div>
				<div class="mb-popover-arrow"></div>
				${this.#breakpointStyles()}
			</div>
		`;

		const popover = this.#portalHost.querySelector<HTMLElement>('.mb-popover');
		const arrow = this.#portalHost.querySelector<HTMLElement>('.mb-popover-arrow');
		if (!popover || !arrow) return;

		this.#clearOverlayListeners();
		this.#positionCleanup?.();
		this.#positionCleanup = null;

		requestAnimationFrame(() => popover.classList.remove('mb-enter-from'));

		void applyPosition(this.#anchorEl, popover, {
			placement: 'bottom',
			offsetDistance: 10,
			arrowEl: arrow,
		}).then(result => {
			const side = result.placement.split('-')[0];
			popover.classList.remove('mb-popover-top', 'mb-popover-right', 'mb-popover-bottom', 'mb-popover-left');
			popover.classList.add(`mb-popover-${side}`);
		});

		this.#positionCleanup = startAutoPosition(this.#anchorEl, popover, {
			placement: 'bottom',
			offsetDistance: 10,
			arrowEl: arrow,
		});

		const onDocumentMouseDown = (event: MouseEvent) => {
			if (!this.dismissable) return;
			const node = event.target as Node | null;
			if (!node) return;

			const clickedInsidePopover = popover.contains(node);
			const clickedAnchor = this.#anchorEl?.contains(node) ?? false;
			if (!clickedInsidePopover && !clickedAnchor) {
				this.hide();
			}
		};

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && this.closeOnEscape) {
				this.hide();
			}
		};

		document.addEventListener('mousedown', onDocumentMouseDown);
		document.addEventListener('keydown', onEscape);

		this.#overlayCleanupFns.push(() => document.removeEventListener('mousedown', onDocumentMouseDown));
		this.#overlayCleanupFns.push(() => document.removeEventListener('keydown', onEscape));
	}

	#destroyOverlay(): void {
		this.#positionCleanup?.();
		this.#positionCleanup = null;

		this.#clearOverlayListeners();

		removePortal(this.#portalKey);
		this.#portalHost = null;
		this.#isOpen = false;
	}

	#teardown(): void {
		this.#destroyOverlay();
	}

	#breakpointStyles(): string {
		const breakpoints = this.breakpoints;
		if (!breakpoints || Object.keys(breakpoints).length === 0) return '';

		const rules = Object.entries(breakpoints)
			.map(
				([maxWidth, width]) =>
					`@media screen and (max-width: ${maxWidth}) { [data-mb-popover-key="${this.#portalKey}"] { width: ${width} !important; } }`
			)
			.join(' ');

		return `<style>${rules}</style>`;
	}

	#readBoolAttr(name: string, defaultValue: boolean): boolean {
		const value = this.getAttribute(name);
		if (value === null) return defaultValue;
		const normalized = value.toLowerCase();
		return !['false', '0', 'no', 'off'].includes(normalized);
	}

	#getDefaultSlotMarkup(): string {
		if (!this.#templateHtml) return '';

		const template = document.createElement('template');
		template.innerHTML = this.#templateHtml;

		return Array.from(template.content.childNodes)
			.filter(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return true;
				return !(node as Element).hasAttribute('slot');
			})
			.map(node => {
				if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
				if (node.nodeType === Node.ELEMENT_NODE) return (node as Element).outerHTML;
				return '';
			})
			.join('');
	}

	#clearOverlayListeners(): void {
		for (const cleanup of this.#overlayCleanupFns) {
			cleanup();
		}
		this.#overlayCleanupFns = [];
	}
}
