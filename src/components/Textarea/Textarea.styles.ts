export const TEXTAREA_STYLES = `
:host{
	display:inline-block;
}

:root{
	--mb-textarea-border: var(--mb-form-field-border, 1px solid #ccc);
	--mb-textarea-bg: var(--mb-form-field-bg, #fff);
	--mb-textarea-color: var(--mb-form-field-color, #222);
	--mb-textarea-padding: var(--mb-form-field-padding, 0.5rem 0.75rem);
	--mb-textarea-radius: var(--mb-form-field-radius, 4px);
	--mb-textarea-font: var(--mb-form-field-font, 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	--mb-textarea-focus-border-color: var(--mb-form-field-focus-border-color, #5b9df9);
	--mb-textarea-disabled-bg: var(--mb-form-field-disabled-bg, #f5f5f5);
}

.mb-textarea{ display:inline-block; width:auto; }
.mb-textarea > textarea, .mb-textarea textarea{
	width:100%;
	box-sizing:border-box;
	border: var(--mb-textarea-border);
	background: var(--mb-textarea-bg);
	color: var(--mb-textarea-color);
	padding: var(--mb-textarea-padding);
	border-radius: var(--mb-textarea-radius);
	font: var(--mb-textarea-font);
	outline: none;
	resize: vertical;
	min-height: 3rem;
}

.mb-textarea textarea:focus{ box-shadow: 0 0 0 3px color-mix(in srgb, var(--mb-textarea-focus-border-color) 22%, transparent); border-color: var(--mb-textarea-focus-border-color); }
.mb-textarea.mb-invalid textarea{ border-color: var(--mb-form-field-invalid-color, #e53935); }
.mb-textarea textarea:disabled{ background: var(--mb-textarea-disabled-bg); cursor:not-allowed; }
.mb-textarea.mb-textarea-fluid{ width:100%; }
`;
