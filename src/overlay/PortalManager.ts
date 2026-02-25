import { nextZIndex, type ZIndexType } from '../utils/ZIndexManager.js';

interface PortalEntry {
	host: HTMLElement;
	owner: HTMLElement;
	type: ZIndexType;
}

const portals = new Map<string, PortalEntry>();

let portalRoot: HTMLElement | null = null;

function getPortalRoot(): HTMLElement {
	if (!portalRoot || !document.body.contains(portalRoot)) {
		portalRoot = document.createElement('div');
		portalRoot.setAttribute('data-mb-portals', '');
		portalRoot.style.cssText =
			'position:absolute;top:0;left:0;width:100%;pointer-events:none;';
		document.body.appendChild(portalRoot);
	}
	return portalRoot;
}

/**
 * Create a portal host element appended to the portal root.
 * @param key unique key for this portal (used to look up/remove later)
 * @param owner the component that owns this portal
 * @param type z-index type (controls stacking layer)
 * @returns the host element to render overlay content into
 */
export function createPortal(
	key: string,
	owner: HTMLElement,
	type: ZIndexType = 'overlay'
): HTMLElement {
	removePortal(key);

	const host = document.createElement('div');
	host.setAttribute('data-mb-portal', key);
	host.style.cssText = 'position:fixed;top:0;left:0;pointer-events:auto;';
	host.style.zIndex = String(nextZIndex(type));

	getPortalRoot().appendChild(host);
	portals.set(key, { host, owner, type });

	return host;
}

/**
 * Remove and destroy a portal by key.
 */
export function removePortal(key: string): void {
	const entry = portals.get(key);
	if (entry) {
		entry.host.remove();
		portals.delete(key);
	}
}

/**
 * Remove all portals owned by a given element (call on disconnectedCallback).
 */
export function removePortalsByOwner(owner: HTMLElement): void {
	for (const [key, entry] of portals) {
		if (entry.owner === owner) {
			entry.host.remove();
			portals.delete(key);
		}
	}
}

/**
 * Get the portal host element for a key, if it exists.
 */
export function getPortal(key: string): HTMLElement | null {
	return portals.get(key)?.host ?? null;
}

/**
 * Check if a portal exists.
 */
export function hasPortal(key: string): boolean {
	return portals.has(key);
}

/**
 * Update z-index of an existing portal.
 */
export function bringToFront(key: string): void {
	const entry = portals.get(key);
	if (entry) {
		entry.host.style.zIndex = String(nextZIndex(entry.type));
	}
}
