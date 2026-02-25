/**
 * Returns whether the given element is focusable.
 */
export function isFocusable(el: HTMLElement): boolean {
	const tag = el.tagName.toLowerCase();
	const focusableTags = new Set(['a', 'button', 'input', 'select', 'textarea']);

	if ((el as HTMLInputElement).disabled) return false;
	if (el.getAttribute('tabindex') === '-1') return false;
	if (el.hasAttribute('tabindex')) return true;
	if (focusableTags.has(tag)) return true;
	if (tag === 'a' && el.hasAttribute('href')) return true;

	return false;
}

/**
 * Get all focusable child elements.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	const selector = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
		'[contenteditable="true"]',
	].join(',');

	return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
		el => !el.closest('[disabled]') && getComputedStyle(el).display !== 'none'
	);
}

/**
 * Find the first focusable element in a container.
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
	return getFocusableElements(container)[0] ?? null;
}

/**
 * Find the last focusable element.
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
	const els = getFocusableElements(container);
	return els[els.length - 1] ?? null;
}

/**
 * Focus the first focusable element in a container.
 */
export function focusFirstElement(container: HTMLElement): void {
	getFirstFocusableElement(container)?.focus();
}

/**
 * Add a class to an element.
 */
export function addClass(el: HTMLElement, cls: string): void {
	el.classList.add(cls);
}

/**
 * Remove a class from an element.
 */
export function removeClass(el: HTMLElement, cls: string): void {
	el.classList.remove(cls);
}

/**
 * Check if element has class.
 */
export function hasClass(el: HTMLElement, cls: string): boolean {
	return el.classList.contains(cls);
}

/**
 * Toggle class on an element.
 */
export function toggleClass(el: HTMLElement, cls: string, force?: boolean): void {
	el.classList.toggle(cls, force);
}

/**
 * Get the element's outer width (including padding and border).
 */
export function getOuterWidth(el: HTMLElement, margin = false): number {
	let width = el.offsetWidth;
	if (margin) {
		const style = getComputedStyle(el);
		width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
	}
	return width;
}

/**
 * Get the element's outer height (including padding and border).
 */
export function getOuterHeight(el: HTMLElement, margin = false): number {
	let height = el.offsetHeight;
	if (margin) {
		const style = getComputedStyle(el);
		height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
	}
	return height;
}

/**
 * Get the element's viewport offset.
 */
export function getOffset(el: HTMLElement): { top: number; left: number } {
	const rect = el.getBoundingClientRect();
	return {
		top: rect.top + window.scrollY,
		left: rect.left + window.scrollX,
	};
}

/**
 * Get scroll parents of an element.
 */
export function getScrollableParents(el: HTMLElement): HTMLElement[] {
	const parents: HTMLElement[] = [];
	let current: HTMLElement | null = el.parentElement;

	while (current) {
		const style = getComputedStyle(current);
		const overflow = style.overflow + style.overflowX + style.overflowY;
		if (/auto|scroll|overlay/.test(overflow)) {
			parents.push(current);
		}
		current = current.parentElement;
	}

	return parents;
}

/**
 * Find closest ancestor matching selector.
 */
export function closest(el: HTMLElement, selector: string): HTMLElement | null {
	return el.closest(selector);
}

/**
 * Append element to body.
 */
export function appendTo(el: HTMLElement, target: HTMLElement | 'body' = 'body'): void {
	if (target === 'body') {
		document.body.appendChild(el);
	} else {
		target.appendChild(el);
	}
}

/**
 * Remove element from DOM.
 */
export function removeElement(el: HTMLElement): void {
	el.parentNode?.removeChild(el);
}

/**
 * Check if element is inside another element.
 */
export function isElement(obj: unknown): obj is HTMLElement {
	return obj instanceof HTMLElement;
}

/**
 * Get the index of a child element among its siblings.
 */
export function index(el: HTMLElement): number {
	const parent = el.parentElement;
	if (!parent) return -1;
	return Array.from(parent.children).indexOf(el);
}

/**
 * Prevent body scroll (for modals).
 */
export function blockBodyScroll(): void {
	document.body.classList.add('mb-overflow-hidden');
	document.body.style.overflow = 'hidden';
}

/**
 * Restore body scroll.
 */
export function unblockBodyScroll(): void {
	document.body.classList.remove('mb-overflow-hidden');
	document.body.style.overflow = '';
}

/**
 * Check if element is visible.
 */
export function isVisible(el: HTMLElement): boolean {
	return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Get the z-index of an element.
 */
export function getZindex(el: HTMLElement): number {
	const z = getComputedStyle(el).zIndex;
	return z === 'auto' ? 0 : parseInt(z, 10);
}

/**
 * Set inline style properties.
 */
export function setStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
	Object.assign(el.style, styles);
}

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
