export const INPUTNUMBER_STYLES = `
:host {
	display: inline-block;
}

:root {
	--mb-inputnumber-border: var(--mb-form-field-border, 1px solid #ccc);
	--mb-inputnumber-bg: var(--mb-form-field-bg, #fff);
	--mb-inputnumber-color: var(--mb-form-field-color, #222);
	--mb-inputnumber-radius: var(--mb-form-field-radius, 6px);
	--mb-inputnumber-padding: var(--mb-form-field-padding, 0.5rem 0.75rem);
	--mb-inputnumber-focus-border-color: var(--mb-form-field-focus-border-color, #5b9df9);
	--mb-inputnumber-disabled-bg: var(--mb-form-field-disabled-bg, #f5f5f5);
	--mb-inputnumber-button-bg: #f7f7f7;
	--mb-inputnumber-button-hover-bg: #efefef;
	--mb-inputnumber-button-color: #555;
}

.mb-inputnumber {
	display: inline-flex;
	align-items: stretch;
	box-sizing: border-box;
	border: var(--mb-inputnumber-border);
	border-radius: var(--mb-inputnumber-radius);
	background: var(--mb-inputnumber-bg);
	width: auto;
	overflow: hidden;
	transition: border-color .12s ease, box-shadow .12s ease;
}

.mb-inputnumber.mb-inputnumber-fluid {
	width: 100%;
}

.mb-inputnumber:focus-within {
	border-color: var(--mb-inputnumber-focus-border-color);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--mb-inputnumber-focus-border-color) 22%, transparent);
}

.mb-inputnumber.mb-inputnumber-filled {
	border: none;
	background: color-mix(in srgb, var(--mb-inputnumber-bg) 90%, #000 4%);
}

.mb-inputnumber.mb-invalid {
	border-color: var(--mb-form-field-invalid-color, #e53935);
	box-shadow: none;
}

.mb-inputnumber-input {
	appearance: none;
	border: 0;
	outline: none;
	background: transparent;
	color: var(--mb-inputnumber-color);
	padding: var(--mb-inputnumber-padding);
	font: var(--mb-form-field-font, 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	width: 100%;
	min-width: 0;
}

.mb-inputnumber-input:disabled {
	background: var(--mb-inputnumber-disabled-bg);
	cursor: not-allowed;
	color: color-mix(in srgb, var(--mb-inputnumber-color) 60%, transparent);
}

.mb-inputnumber.mb-inputnumber-small .mb-inputnumber-input {
	font-size: 0.85rem;
	padding: 0.35rem 0.6rem;
}

.mb-inputnumber.mb-inputnumber-large .mb-inputnumber-input {
	font-size: 1.12rem;
	padding: 0.7rem 0.85rem;
}

.mb-inputnumber-buttons {
	display: inline-flex;
	align-items: stretch;
}

.mb-inputnumber-button {
	border: 0;
	background: var(--mb-inputnumber-button-bg);
	color: var(--mb-inputnumber-button-color);
	padding: 0 0.6rem;
	cursor: pointer;
	font-size: 0.85rem;
	line-height: 1;
	transition: background-color .12s ease;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 2rem;
}

.mb-inputnumber-button:hover {
	background: var(--mb-inputnumber-button-hover-bg);
}

.mb-inputnumber-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.mb-inputnumber-button-icon {
	pointer-events: none;
}

::slotted([slot="increment-icon"]),
::slotted([slot="decrement-icon"]) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.mb-inputnumber-buttons-stacked,
.mb-inputnumber-buttons-vertical {
	flex-direction: column;
	border-left: 1px solid color-mix(in srgb, var(--mb-inputnumber-color) 15%, transparent);
}

.mb-inputnumber-buttons-horizontal {
	flex-direction: row;
	border-left: 1px solid color-mix(in srgb, var(--mb-inputnumber-color) 15%, transparent);
	border-right: 1px solid color-mix(in srgb, var(--mb-inputnumber-color) 15%, transparent);
}

.mb-inputnumber-buttons-horizontal .mb-inputnumber-button {
	min-width: 2.15rem;
}

.mb-inputnumber-buttons-stacked .mb-inputnumber-button + .mb-inputnumber-button,
.mb-inputnumber-buttons-vertical .mb-inputnumber-button + .mb-inputnumber-button,
.mb-inputnumber-buttons-horizontal .mb-inputnumber-button + .mb-inputnumber-button {
	border-left: 1px solid color-mix(in srgb, var(--mb-inputnumber-color) 10%, transparent);
	border-top: 1px solid color-mix(in srgb, var(--mb-inputnumber-color) 10%, transparent);
}
`;

export {};
