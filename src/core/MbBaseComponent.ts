import type { AttributeConverter } from './types.js';
import { injectComponentStyles } from './styles.js';
import { applyShadowStyles, applySharedShadowStyles } from './shadowStyles.js';
import { RIPPLE_CSS } from '../utils/Ripple.js';

type AttributeMap = Map<string, AttributeConverter>;

export abstract class MbBaseComponent extends HTMLElement {
	// Subclasses declare: static get observedAttributes() and static attributeConverters
	protected static readonly _componentName: string = '';
	protected static readonly _componentStyles: string = '';

	// Internal state
	#mounted = false;
	#renderPending = false;
	#lastRenderedHtml: string | null = null;
	#cleanupFns: Array<() => void> = [];
	#renderCleanupFns: Array<() => void> = [];

	// Subclasses override this: map of attribute name -> converter type
	protected static get attributeConverters(): AttributeMap {
		return new Map();
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback(): void {
		this.#mounted = true;

		// Inject component styles once per tag name
		const ctor = this.constructor as typeof MbBaseComponent;
		if (ctor._componentName && ctor._componentStyles) {
			injectComponentStyles(ctor._componentName, ctor._componentStyles);
		}

		// Initial render
		this._scheduleRender();
	}

	disconnectedCallback(): void {
		this.#mounted = false;
		this.#flushRenderCleanup();
		// Run all cleanup functions registered via _addCleanup()
		this.#cleanupFns.forEach(fn => fn());
		this.#cleanupFns = [];
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue === newValue) return;

		const ctor = this.constructor as typeof MbBaseComponent;
		const converters = ctor.attributeConverters;
		const converter = converters.get(name);

		if (converter) {
			const propName = this._attrToProp(name);
			const converted = this._convertAttribute(newValue, converter);
			if (this._canSetProperty(propName)) {
				// Use Object.assign pattern to avoid ts errors on dynamic prop set
				(this as unknown as Record<string, unknown>)[propName] = converted;
			}
		}

		if (this.#mounted) {
			this._scheduleRender();
		}
	}

	// Guard dynamic property assignment to avoid throwing on getter-only properties.
	protected _canSetProperty(propName: string): boolean {
		let proto: object | null = this;
		while (proto) {
			const descriptor = Object.getOwnPropertyDescriptor(proto, propName);
			if (descriptor) {
				if ('set' in descriptor) {
					return typeof descriptor.set === 'function';
				}
				return Boolean(descriptor.writable);
			}
			proto = Object.getPrototypeOf(proto);
		}
		return true;
	}

	// Abstract: subclasses implement this to produce their Light DOM HTML string
	protected abstract _render(): string;

	// Schedule a microtask render (batches multiple synchronous attribute changes)
	protected _scheduleRender(): void {
		if (this.#renderPending) return;
		this.#renderPending = true;
		queueMicrotask(() => {
			this.#renderPending = false;
			if (!this.#mounted) return;
			this._performRender();
		});
	}

	protected _performRender(): void {
		const shadowRoot = this.shadowRoot;
		if (!shadowRoot) return;

		const html = this._render();
		// Compare against the last emitted render output to avoid Shadow DOM serialization mismatches.
		if (this.#lastRenderedHtml !== html) {
			this.#flushRenderCleanup();
			shadowRoot.innerHTML = html;
			this.#lastRenderedHtml = html;
			this._afterRender();
		}

		const ctor = this.constructor as typeof MbBaseComponent;
		if (ctor._componentName && ctor._componentStyles) {
			applyShadowStyles(shadowRoot, ctor._componentName, ctor._componentStyles);
		}
		applySharedShadowStyles(shadowRoot, RIPPLE_CSS);
	}

	#flushRenderCleanup(): void {
		this.#renderCleanupFns.forEach(fn => fn());
		this.#renderCleanupFns = [];
	}

	// Hook called after every DOM update — subclasses can override to attach listeners
	protected _afterRender(): void {}

	// Register a cleanup function to run on disconnectedCallback
	protected _addCleanup(fn: () => void): void {
		this.#cleanupFns.push(fn);
	}

	// Dispatch a CustomEvent (bubbles by default, not composed for Light DOM)
	protected emit<TDetail = unknown>(
		eventName: string,
		detail?: TDetail,
		options: EventInit = {}
	): boolean {
		return this.dispatchEvent(
			new CustomEvent<TDetail>(eventName, {
				bubbles: true,
				composed: false,
				detail,
				...options,
			})
		);
	}

	// Tagged template literal helper for building HTML strings
	// Values are stringified; null/undefined become empty string
	protected _html(strings: TemplateStringsArray, ...values: unknown[]): string {
		let result = '';
		strings.forEach((str, i) => {
			result += str;
			if (i < values.length) {
				const v = values[i];
				result += v == null ? '' : String(v);
			}
		});
		return result;
	}

	// Escape HTML entities in user-provided strings to prevent XSS
	protected _escape(value: unknown): string {
		if (value == null) return '';
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	// Convert kebab-case attribute name to camelCase property name
	protected _attrToProp(attr: string): string {
		return attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
	}

	// Convert camelCase property name to kebab-case attribute name
	protected _propToAttr(prop: string): string {
		return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
	}

	// Convert attribute string value to typed value based on converter
	protected _convertAttribute(value: string | null, converter: AttributeConverter): unknown {
		switch (converter) {
			case 'boolean':
				return value !== null;
			case 'number': {
				if (value === null) return null;
				const n = Number(value);
				return isNaN(n) ? null : n;
			}
			case 'object': {
				if (value === null) return null;
				try {
					return JSON.parse(value) as unknown;
				} catch {
					return null;
				}
			}
			case 'string':
			default:
				return value;
		}
	}

	// Reflect a property value back to attribute (for string/number/boolean)
	protected _reflectToAttr(attrName: string, value: unknown, converter: AttributeConverter): void {
		if (converter === 'boolean') {
			if (value) {
				this.setAttribute(attrName, '');
			} else {
				this.removeAttribute(attrName);
			}
		} else if (value == null) {
			this.removeAttribute(attrName);
		} else {
			this.setAttribute(attrName, String(value));
		}
	}

	// Utility: get boolean attribute
	protected _bool(attr: string): boolean {
		const val = this.getAttribute(attr);
		return val !== null && val !== 'false';
	}

	// Utility: get string attribute with optional fallback
	protected _str(attr: string, fallback = ''): string {
		return this.getAttribute(attr) ?? fallback;
	}

	// Utility: get number attribute with optional fallback
	protected _num(attr: string, fallback: number | null = null): number | null {
		const raw = this.getAttribute(attr);
		if (raw === null) return fallback;
		const n = Number(raw);
		return isNaN(n) ? fallback : n;
	}

	// Utility: get JSON object attribute
	protected _obj<T = unknown>(attr: string): T | null {
		const raw = this.getAttribute(attr);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}

	// Utility: query a child element
	protected _qs<T extends HTMLElement>(selector: string): T | null {
		return this.shadowRoot?.querySelector<T>(selector) ?? null;
	}

	// Utility: query all child elements
	protected _qsa<T extends HTMLElement>(selector: string): NodeListOf<T> {
		if (this.shadowRoot) {
			return this.shadowRoot.querySelectorAll<T>(selector);
		}
		return this.querySelectorAll<T>('__mb_unreachable__');
	}

	// Utility: query a child element from Light DOM only
	protected _qsLight<T extends HTMLElement>(selector: string): T | null {
		return this.querySelector<T>(selector);
	}

	// Utility: query all child elements from Light DOM only
	protected _qsaLight<T extends HTMLElement>(selector: string): NodeListOf<T> {
		return this.querySelectorAll<T>(selector);
	}

	// Attach a ripple effect to an element
	protected _attachRipple(el: HTMLElement): void {
		if (el.dataset.mbRipple === '1') return;
		el.dataset.mbRipple = '1';
		el.classList.add('mb-ripple');
		const handler = (e: Event) => {
			const pointerEvent = e as PointerEvent;
			const rect = el.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height);
			const x = pointerEvent.clientX - rect.left - size / 2;
			const y = pointerEvent.clientY - rect.top - size / 2;

			const ripple = document.createElement('span');
			ripple.className = 'mb-ink';
			ripple.style.cssText = `width:${size}px;height:${size}px;top:${y}px;left:${x}px`;
			el.querySelectorAll('.mb-ink').forEach(node => node.remove());
			el.appendChild(ripple);

			// Force reflow
			void ripple.offsetWidth;
			ripple.classList.add('mb-ink-active');

			let cleaned = false;
			const cleanup = () => {
				if (cleaned) return;
				cleaned = true;
				ripple.removeEventListener('animationend', cleanup);
				ripple.removeEventListener('transitionend', cleanup);
				ripple.remove();
			};
			ripple.addEventListener('animationend', cleanup);
			ripple.addEventListener('transitionend', cleanup);
			window.setTimeout(cleanup, 500);
		};

		el.addEventListener('pointerdown', handler);
		this.#renderCleanupFns.push(() => el.removeEventListener('pointerdown', handler));
	}
}
