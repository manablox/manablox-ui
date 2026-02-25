export const PASSWORD_STYLES = `
:root {
	--mb-password-border: var(--mb-form-field-border, 1px solid #ccc);
	--mb-password-bg: var(--mb-form-field-bg, #fff);
	--mb-password-color: var(--mb-form-field-color, #222);
	--mb-password-radius: var(--mb-form-field-radius, 6px);
	--mb-password-padding: var(--mb-form-field-padding, 0.5rem 0.75rem);
	--mb-password-focus-border-color: var(--mb-form-field-focus-border-color, #5b9df9);
	--mb-password-disabled-bg: var(--mb-form-field-disabled-bg, #f5f5f5);
	--mb-password-toggle-color: var(--mb-text-secondary, #666);
	--mb-password-toggle-hover-bg: rgba(0, 0, 0, 0.06);
	--mb-password-overlay-bg: #fff;
	--mb-password-overlay-border: 1px solid #dcdcdc;
	--mb-password-overlay-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
	--mb-password-meter-bg: #ececec;
	--mb-password-meter-weak: #f87171;
	--mb-password-meter-medium: #fbbf24;
	--mb-password-meter-strong: #34d399;
	--mb-password-zindex: 1000;
}

.mb-password {
	display: inline-flex;
	align-items: stretch;
	position: relative;
	box-sizing: border-box;
	width: auto;
	border: var(--mb-password-border);
	border-radius: var(--mb-password-radius);
	background: var(--mb-password-bg);
	transition: border-color .12s ease, box-shadow .12s ease;
}

.mb-password.mb-password-fluid {
	width: 100%;
}

.mb-password:focus-within {
	border-color: var(--mb-password-focus-border-color);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--mb-password-focus-border-color) 22%, transparent);
}

.mb-password.mb-invalid {
	border-color: var(--mb-form-field-invalid-color, #e53935);
	box-shadow: none;
}

.mb-password.mb-password-filled {
	border: none;
	background: color-mix(in srgb, var(--mb-password-bg) 90%, #000 4%);
}

.mb-password-input {
	appearance: none;
	border: 0;
	outline: none;
	background: transparent;
	color: var(--mb-password-color);
	padding: var(--mb-password-padding);
	font: var(--mb-form-field-font, 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	width: 100%;
	min-width: 0;
	border-radius: var(--mb-password-radius);
}

.mb-password-input::placeholder {
	color: color-mix(in srgb, var(--mb-password-color) 40%, transparent);
}

.mb-password-input:disabled {
	background: var(--mb-password-disabled-bg);
	cursor: not-allowed;
	color: color-mix(in srgb, var(--mb-password-color) 60%, transparent);
}

.mb-password-toggle {
	border: 0;
	background: transparent;
	cursor: pointer;
	color: var(--mb-password-toggle-color);
	padding: 0 0.65rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: calc(var(--mb-password-radius) - 2px);
	margin: 2px;
	line-height: 1;
}

.mb-password-toggle:hover {
	background: var(--mb-password-toggle-hover-bg);
}

.mb-password-toggle:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.mb-password-toggle-icon {
	font-size: 0.95rem;
	font-weight: 600;
}

.mb-password-panel {
	position: absolute;
	left: 0;
	top: 0;
	background: var(--mb-password-overlay-bg);
	border: var(--mb-password-overlay-border);
	border-radius: 8px;
	box-shadow: var(--mb-password-overlay-shadow);
	padding: 0.65rem;
	min-width: 15rem;
	max-width: 18rem;
	z-index: var(--mb-password-zindex);
	font: var(--mb-form-field-font, 0.92rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
	color: var(--mb-password-color);
}

.mb-password-meter {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 0.3rem;
	margin-bottom: 0.55rem;
}

.mb-password-meter-segment {
	height: 0.35rem;
	border-radius: 999px;
	background: var(--mb-password-meter-bg);
	transition: background-color .12s ease;
}

.mb-password-panel[data-strength='weak'] .mb-password-meter-segment[data-index='0'] {
	background: var(--mb-password-meter-weak);
}

.mb-password-panel[data-strength='medium'] .mb-password-meter-segment[data-index='0'],
.mb-password-panel[data-strength='medium'] .mb-password-meter-segment[data-index='1'] {
	background: var(--mb-password-meter-medium);
}

.mb-password-panel[data-strength='strong'] .mb-password-meter-segment[data-index='0'],
.mb-password-panel[data-strength='strong'] .mb-password-meter-segment[data-index='1'],
.mb-password-panel[data-strength='strong'] .mb-password-meter-segment[data-index='2'] {
	background: var(--mb-password-meter-strong);
}

.mb-password-info {
	font-size: 0.86rem;
	line-height: 1.35;
}
`;

export {};
