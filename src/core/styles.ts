const injectedStyles = new Set<string>();
const injectedGlobalStyles = new Set<string>();

/**
 * Injects styles for a component into the document head once.
 * Safe to call multiple times — deduplicated by componentName.
 */
export function injectComponentStyles(componentName: string, css: string): void {
	if (!componentName || injectedStyles.has(componentName)) return;
	injectedStyles.add(componentName);

	if (typeof document === 'undefined') return;

	const style = document.createElement('style');
	style.setAttribute('data-mb-component', componentName);
	style.textContent = css;
	document.head.appendChild(style);
}

/**
 * Injects global styles once (e.g., base reset, ripple animations).
 * @param id unique identifier for these styles
 */
export function injectGlobalStyles(id: string, css: string): void {
	if (injectedGlobalStyles.has(id)) return;
	injectedGlobalStyles.add(id);

	if (typeof document === 'undefined') return;

	const style = document.createElement('style');
	style.setAttribute('data-mb-global', id);
	style.textContent = css;
	document.head.appendChild(style);
}

/**
 * Remove injected styles — useful for testing / cleanup
 */
export function removeComponentStyles(componentName: string): void {
	const el = document.head.querySelector(`style[data-mb-component="${componentName}"]`);
	if (el) {
		el.remove();
		injectedStyles.delete(componentName);
	}

	const globalEl = document.head.querySelector(`style[data-mb-global="${componentName}"]`);
	if (globalEl) {
		globalEl.remove();
		injectedGlobalStyles.delete(componentName);
	}
}
