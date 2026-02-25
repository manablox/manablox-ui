import { registerElement } from './registry.js';

export type DefineFunction = () => void;

/**
 * Creates a define function for a single component.
 * e.g., export const defineButton = createDefine('mb-button', MbButton);
 */
export function createDefine(
	tagName: string,
	constructor: CustomElementConstructor
): DefineFunction {
	return () => registerElement(tagName, constructor);
}

/**
 * Creates a defineAll function from a record of define functions.
 * e.g., export const defineAll = createDefineAll({ defineButton, defineInput, ... });
 */
export function createDefineAll(
	defineFns: Record<string, DefineFunction>
): DefineFunction {
	return () => Object.values(defineFns).forEach(fn => fn());
}
