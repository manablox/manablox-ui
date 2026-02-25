export const INPUTOTP_STYLES = `
:root {
	--mb-inputotp-gap: 0.5rem;
	--mb-inputotp-size: 2.5rem;
	--mb-inputotp-font-size: 1.1rem;
	--mb-inputotp-border: var(--mb-form-field-border, 1px solid #ccc);
	--mb-inputotp-radius: var(--mb-form-field-radius, 6px);
	--mb-inputotp-bg: var(--mb-form-field-bg, #fff);
	--mb-inputotp-color: var(--mb-form-field-color, #222);
	--mb-inputotp-focus-border-color: var(--mb-form-field-focus-border-color, #5b9df9);
	--mb-inputotp-disabled-bg: var(--mb-form-field-disabled-bg, #f5f5f5);
}

.mb-inputotp {
	display: inline-flex;
	align-items: center;
	gap: var(--mb-inputotp-gap);
}

.mb-inputotp-input {
	appearance: none;
	width: var(--mb-inputotp-size);
	height: var(--mb-inputotp-size);
	border: var(--mb-inputotp-border);
	border-radius: var(--mb-inputotp-radius);
	background: var(--mb-inputotp-bg);
	color: var(--mb-inputotp-color);
	text-align: center;
	font: var(--mb-form-field-font, 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	font-size: var(--mb-inputotp-font-size);
	outline: none;
	transition: border-color .12s ease, box-shadow .12s ease;
}

.mb-inputotp-input:focus {
	border-color: var(--mb-inputotp-focus-border-color);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--mb-inputotp-focus-border-color) 22%, transparent);
}

.mb-inputotp.mb-invalid .mb-inputotp-input {
	border-color: var(--mb-form-field-invalid-color, #e53935);
}

.mb-inputotp.mb-filled .mb-inputotp-input {
	border: none;
	background: color-mix(in srgb, var(--mb-inputotp-bg) 90%, #000 4%);
}

.mb-inputotp.mb-small .mb-inputotp-input {
	width: 2.1rem;
	height: 2.1rem;
	font-size: 0.95rem;
}

.mb-inputotp.mb-large .mb-inputotp-input {
	width: 2.9rem;
	height: 2.9rem;
	font-size: 1.2rem;
}

.mb-inputotp-input:disabled {
	background: var(--mb-inputotp-disabled-bg);
	cursor: not-allowed;
	color: color-mix(in srgb, var(--mb-inputotp-color) 60%, transparent);
}
`;

export {};
