const registered = new Set<string>();

/**
 * Register a custom element by tag name, safely. Returns true if newly registered.
 */
export function registerElement(
	tagName: string,
	constructor: CustomElementConstructor,
	options?: ElementDefinitionOptions
): boolean {
	if (registered.has(tagName)) return false;
	if (customElements.get(tagName)) {
		registered.add(tagName);
		return false;
	}
	customElements.define(tagName, constructor, options);
	registered.add(tagName);
	return true;
}

/**
 * Check if a tag name has been registered.
 */
export function isRegistered(tagName: string): boolean {
	return registered.has(tagName) || !!customElements.get(tagName);
}
