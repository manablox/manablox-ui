const componentSheetCache = new Map<string, CSSStyleSheet>();
const sharedSheetCache = new Map<string, CSSStyleSheet>();

const shadowComponentSheet = new WeakMap<ShadowRoot, CSSStyleSheet>();
const shadowSharedSheets = new WeakMap<ShadowRoot, Set<CSSStyleSheet>>();

function supportsConstructableStylesheets(): boolean {
	return (
		typeof CSSStyleSheet !== 'undefined' &&
		typeof CSSStyleSheet.prototype.replaceSync === 'function'
	);
}

function getOrCreateComponentSheet(componentName: string, cssText: string): CSSStyleSheet {
	let sheet = componentSheetCache.get(componentName);
	if (!sheet) {
		sheet = new CSSStyleSheet();
		sheet.replaceSync(cssText);
		componentSheetCache.set(componentName, sheet);
	}
	return sheet;
}

function getOrCreateSharedSheet(cssText: string): CSSStyleSheet {
	let sheet = sharedSheetCache.get(cssText);
	if (!sheet) {
		sheet = new CSSStyleSheet();
		sheet.replaceSync(cssText);
		sharedSheetCache.set(cssText, sheet);
	}
	return sheet;
}

function applyAdoptedSheets(shadowRoot: ShadowRoot): void {
	const componentSheet = shadowComponentSheet.get(shadowRoot);
	const sharedSheets = shadowSharedSheets.get(shadowRoot);
	const orderedSheets = [
		...(sharedSheets ? Array.from(sharedSheets) : []),
		...(componentSheet ? [componentSheet] : []),
	];
	shadowRoot.adoptedStyleSheets = orderedSheets;
}

function getSharedStyleId(cssText: string): string {
	let hash = 0;
	for (let i = 0; i < cssText.length; i += 1) {
		hash = (hash << 5) - hash + cssText.charCodeAt(i);
		hash |= 0;
	}
	return `mb-shared-${Math.abs(hash).toString(36)}`;
}

export function applyShadowStyles(
	shadowRoot: ShadowRoot,
	componentName: string,
	cssText: string
): void {
	if (supportsConstructableStylesheets()) {
		const sheet = getOrCreateComponentSheet(componentName, cssText);
		shadowComponentSheet.set(shadowRoot, sheet);
		applyAdoptedSheets(shadowRoot);
		return;
	}

	const selector = `style[data-mb-component="${componentName}"]`;
	let styleEl = shadowRoot.querySelector<HTMLStyleElement>(selector);
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.setAttribute('data-mb-component', componentName);
		shadowRoot.appendChild(styleEl);
	}
	if (styleEl.textContent !== cssText) {
		styleEl.textContent = cssText;
	}
}

export function applySharedShadowStyles(shadowRoot: ShadowRoot, cssText: string): void {
	if (supportsConstructableStylesheets()) {
		const sheet = getOrCreateSharedSheet(cssText);
		const sheets = shadowSharedSheets.get(shadowRoot) ?? new Set<CSSStyleSheet>();
		sheets.add(sheet);
		shadowSharedSheets.set(shadowRoot, sheets);
		applyAdoptedSheets(shadowRoot);
		return;
	}

	const sharedId = getSharedStyleId(cssText);
	const selector = `style[data-mb-shared="${sharedId}"]`;
	let styleEl = shadowRoot.querySelector<HTMLStyleElement>(selector);
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.setAttribute('data-mb-shared', sharedId);
		shadowRoot.appendChild(styleEl);
	}
	if (styleEl.textContent !== cssText) {
		styleEl.textContent = cssText;
	}
}
