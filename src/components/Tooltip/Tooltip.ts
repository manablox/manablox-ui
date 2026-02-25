import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { applyPosition, startAutoPosition } from '../../overlay/Positioning.js';
import { escapeHtml } from '../../utils/DomHandler.js';
import { TOOLTIP_STYLES } from './Tooltip.styles.js';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipEvent = 'hover' | 'focus';

export class MbTooltip extends MbBaseComponent {
	protected static readonly _componentName = 'mb-tooltip';
	protected static readonly _componentStyles = TOOLTIP_STYLES;

	static get observedAttributes(): string[] {
		return ['value', 'target', 'position', 'event', 'escape'];
	}

	#portalKey = `mb-tooltip-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#triggerCleanupFns: Array<() => void> = [];
	#currentTarget: HTMLElement | null = null;
	#currentText = '';

	constructor() {
		super();
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.innerHTML = '';

		this.#bindTriggers();
		this._addCleanup(() => this.#teardown());
	}

	disconnectedCallback(): void {
		this.#teardown();
		super.disconnectedCallback();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue === newValue || !this.isConnected) return;

		if (name === 'target' || name === 'event') {
			this.#bindTriggers();
		}

		if (name === 'value' && this.#portalHost && this.#currentTarget) {
			this.#showFor(this.#currentTarget, this.#resolveValue(this.#currentTarget));
		}
	}

	get value(): string {
		return this.getAttribute('value') ?? '';
	}
	set value(v: string) {
		this.setAttribute('value', v ?? '');
	}

	get target(): string {
		return this.getAttribute('target') ?? '';
	}
	set target(v: string) {
		this.setAttribute('target', v ?? '');
	}

	get position(): TooltipPosition {
		return (this.getAttribute('position') as TooltipPosition | null) ?? 'top';
	}
	set position(v: TooltipPosition) {
		this.setAttribute('position', v);
	}

	get event(): TooltipEvent {
		return (this.getAttribute('event') as TooltipEvent | null) ?? 'hover';
	}
	set event(v: TooltipEvent) {
		this.setAttribute('event', v);
	}

	get escape(): boolean {
		return this.#readBoolAttr('escape', true);
	}
	set escape(v: boolean) {
		this.setAttribute('escape', String(Boolean(v)));
	}

	protected _render(): string {
		return '';
	}

	#bindTriggers(): void {
		this.#clearTriggerListeners();
		this.hide();

		if (this.target) {
			const targetEl = document.querySelector<HTMLElement>(this.target);
			if (!targetEl) return;
			this.#attachToTarget(targetEl);
			return;
		}

		if (this.event === 'hover') {
			const onMouseOver = (event: MouseEvent) => {
				const element = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-mb-tooltip]');
				if (!element) return;
				this.#showFor(element, this.#resolveValue(element));
			};

			const onMouseOut = (event: MouseEvent) => {
				const element = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-mb-tooltip]');
				if (!element || element !== this.#currentTarget) return;
				const related = event.relatedTarget as Node | null;
				if (related && element.contains(related)) return;
				this.hide();
			};

			document.addEventListener('mouseover', onMouseOver);
			document.addEventListener('mouseout', onMouseOut);

			this.#triggerCleanupFns.push(() => document.removeEventListener('mouseover', onMouseOver));
			this.#triggerCleanupFns.push(() => document.removeEventListener('mouseout', onMouseOut));
			return;
		}

		const onFocusIn = (event: FocusEvent) => {
			const element = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-mb-tooltip]');
			if (!element) return;
			this.#showFor(element, this.#resolveValue(element));
		};

		const onFocusOut = (event: FocusEvent) => {
			const element = event.target as HTMLElement | null;
			if (!element || element !== this.#currentTarget) return;
			this.hide();
		};

		document.addEventListener('focusin', onFocusIn);
		document.addEventListener('focusout', onFocusOut);

		this.#triggerCleanupFns.push(() => document.removeEventListener('focusin', onFocusIn));
		this.#triggerCleanupFns.push(() => document.removeEventListener('focusout', onFocusOut));
	}

	#attachToTarget(targetEl: HTMLElement): void {
		if (this.event === 'focus') {
			const onFocus = () => this.#showFor(targetEl, this.#resolveValue(targetEl));
			const onBlur = () => this.hide();
			targetEl.addEventListener('focus', onFocus);
			targetEl.addEventListener('blur', onBlur);
			this.#triggerCleanupFns.push(() => targetEl.removeEventListener('focus', onFocus));
			this.#triggerCleanupFns.push(() => targetEl.removeEventListener('blur', onBlur));
			return;
		}

		const onEnter = () => this.#showFor(targetEl, this.#resolveValue(targetEl));
		const onLeave = () => this.hide();
		targetEl.addEventListener('mouseenter', onEnter);
		targetEl.addEventListener('mouseleave', onLeave);
		this.#triggerCleanupFns.push(() => targetEl.removeEventListener('mouseenter', onEnter));
		this.#triggerCleanupFns.push(() => targetEl.removeEventListener('mouseleave', onLeave));
	}

	#showFor(target: HTMLElement, text: string): void {
		if (!text) return;

		this.#currentTarget = target;
		this.#currentText = text;

		if (!this.#portalHost) {
			this.#portalHost = createPortal(this.#portalKey, this, 'tooltip');
		}

		const content = this.escape ? escapeHtml(text) : text;
		this.#portalHost.innerHTML = this._html`
			<div class="mb-tooltip mb-tooltip-${this.position}" role="tooltip">
				<div class="mb-tooltip-text">${content}</div>
				<div class="mb-tooltip-arrow"></div>
			</div>
		`;

		const tooltipEl = this.#portalHost.querySelector<HTMLElement>('.mb-tooltip');
		const arrowEl = this.#portalHost.querySelector<HTMLElement>('.mb-tooltip-arrow');
		if (!tooltipEl || !arrowEl) return;

		this.#positionCleanup?.();
		this.#positionCleanup = null;

		void applyPosition(target, tooltipEl, {
			placement: this.position,
			offsetDistance: 8,
			arrowEl,
		}).then(result => {
			const baseSide = result.placement.split('-')[0] as TooltipPosition;
			tooltipEl.classList.remove('mb-tooltip-top', 'mb-tooltip-bottom', 'mb-tooltip-left', 'mb-tooltip-right');
			tooltipEl.classList.add(`mb-tooltip-${baseSide}`);
		});

		this.#positionCleanup = startAutoPosition(target, tooltipEl, {
			placement: this.position,
			offsetDistance: 8,
			arrowEl,
		});

		this.emit('mb-show', { target, value: text });
	}

	hide(): void {
		if (!this.#portalHost) return;

		this.#positionCleanup?.();
		this.#positionCleanup = null;
		removePortal(this.#portalKey);
		this.#portalHost = null;

		this.emit('mb-hide', { target: this.#currentTarget, value: this.#currentText });
		this.#currentTarget = null;
		this.#currentText = '';
	}

	#resolveValue(target: HTMLElement): string {
		if (this.value) return this.value;
		return target.getAttribute('data-mb-tooltip') ?? '';
	}

	#readBoolAttr(name: string, defaultValue: boolean): boolean {
		const value = this.getAttribute(name);
		if (value === null) return defaultValue;
		const normalized = value.toLowerCase();
		return !['false', '0', 'no', 'off'].includes(normalized);
	}

	#clearTriggerListeners(): void {
		for (const fn of this.#triggerCleanupFns) {
			fn();
		}
		this.#triggerCleanupFns = [];
	}

	#teardown(): void {
		this.hide();
		this.#clearTriggerListeners();
	}
}
