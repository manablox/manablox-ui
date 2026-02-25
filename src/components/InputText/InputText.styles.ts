export const INPUTTEXT_STYLES = `
:host{
	display:inline-block;
}

:root{
	--mb-inputtext-border: var(--mb-form-field-border, 1px solid #ccc);
	--mb-inputtext-bg: var(--mb-form-field-bg, #fff);
	--mb-inputtext-color: var(--mb-form-field-color, #222);
	--mb-inputtext-padding: var(--mb-form-field-padding, 0.5rem 0.75rem);
	--mb-inputtext-radius: var(--mb-form-field-radius, 4px);
	--mb-inputtext-font: var(--mb-form-field-font, 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	--mb-inputtext-focus-border-color: var(--mb-form-field-focus-border-color, #5b9df9);
	--mb-inputtext-disabled-bg: var(--mb-form-field-disabled-bg, #f5f5f5);
}

.mb-inputtext{
	box-sizing: border-box;
	display: inline-block;
	width: auto;
}
.mb-inputtext > input,.mb-inputtext input{
	appearance: none;
	width: 100%;
	border: var(--mb-inputtext-border);
	background: var(--mb-inputtext-bg);
	color: var(--mb-inputtext-color);
	padding: var(--mb-inputtext-padding);
	border-radius: var(--mb-inputtext-radius);
	font: var(--mb-inputtext-font);
	outline: none;
	transition: box-shadow .12s ease,border-color .12s ease,background .12s ease;
}

.mb-inputtext input::placeholder{ color: color-mix(in srgb, var(--mb-inputtext-color) 40%, transparent); }

/* size variants */
.mb-inputtext.mb-inputtext-sm input{ padding: calc(var(--mb-inputtext-padding) / 1.4); font-size: 0.85rem; }
.mb-inputtext.mb-inputtext-lg input{ padding: calc(var(--mb-inputtext-padding) * 1.25); font-size: 1.125rem; }

/* states */
.mb-inputtext input:hover{ filter: brightness(.995); }
.mb-inputtext input:focus{ box-shadow: 0 0 0 3px color-mix(in srgb, var(--mb-inputtext-focus-border-color) 22%, transparent); border-color: var(--mb-inputtext-focus-border-color); }
.mb-inputtext.mb-invalid input{ border-color: var(--mb-form-field-invalid-color, #e53935); box-shadow: none; }
.mb-inputtext input:disabled{ background: var(--mb-inputtext-disabled-bg); cursor: not-allowed; color: color-mix(in srgb, var(--mb-inputtext-color) 60%, transparent); }

/* filled */
.mb-inputtext.mb-inputtext-filled input{ background: color-mix(in srgb, var(--mb-inputtext-bg) 85%, #000 5%); }

/* fluid */
.mb-inputtext.mb-inputtext-fluid{ width: 100%; }

/* variant */
.mb-inputtext.mb-inputtext-filled input{ border: none; }
`;
