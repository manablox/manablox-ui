export const COLORPICKER_STYLES = `
.mb-colorpicker {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

.mb-colorpicker-preview {
	width: var(--mb-colorpicker-preview-size, 2rem);
	height: var(--mb-colorpicker-preview-size, 2rem);
	border-radius: var(--mb-colorpicker-preview-radius, 0.375rem);
	border: 1px solid var(--mb-colorpicker-preview-border-color, #cbd5e1);
	cursor: pointer;
}

.mb-colorpicker-panel {
	position: fixed;
	width: var(--mb-colorpicker-panel-width, 18rem);
	padding: var(--mb-colorpicker-panel-padding, 0.75rem);
	border-radius: var(--mb-colorpicker-panel-radius, 0.5rem);
	border: 1px solid var(--mb-colorpicker-panel-border-color, #d1d5db);
	background: var(--mb-colorpicker-panel-bg, #ffffff);
	box-shadow: var(--mb-colorpicker-panel-shadow, 0 10px 25px rgba(0, 0, 0, 0.15));
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.mb-colorpicker-hue-bg {
	position: relative;
	width: 100%;
	height: var(--mb-colorpicker-sat-height, 10rem);
	border-radius: var(--mb-colorpicker-sat-radius, 0.375rem);
	overflow: hidden;
	cursor: crosshair;
}

.mb-colorpicker-saturation-lightness {
	width: 100%;
	height: 100%;
	position: relative;
}

.mb-colorpicker-color-handle {
	position: absolute;
	width: 0.85rem;
	height: 0.85rem;
	border: 2px solid #fff;
	border-radius: 50%;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
	transform: translate(-50%, -50%);
	pointer-events: none;
}

.mb-colorpicker-hue-slider,
.mb-colorpicker-alpha-slider {
	position: relative;
	width: 100%;
	height: 0.75rem;
	border-radius: 999px;
	cursor: pointer;
}

.mb-colorpicker-hue-slider {
	background: linear-gradient(to right, #f00 0%, #ff0 16.6%, #0f0 33.3%, #0ff 50%, #00f 66.6%, #f0f 83.3%, #f00 100%);
}

.mb-colorpicker-hue-handle,
.mb-colorpicker-alpha-handle {
	position: absolute;
	top: 50%;
	width: 0.8rem;
	height: 0.8rem;
	border-radius: 50%;
	border: 2px solid #fff;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
	transform: translate(-50%, -50%);
	pointer-events: none;
	background: #fff;
}

.mb-colorpicker-inputs {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.mb-colorpicker-hex-input,
.mb-colorpicker-rgb-inputs input {
	width: 100%;
	min-height: 2rem;
	border: 1px solid var(--mb-colorpicker-input-border-color, #cbd5e1);
	border-radius: 0.375rem;
	padding: 0.35rem 0.5rem;
	font: inherit;
	color: var(--mb-colorpicker-input-color, #111827);
	background: var(--mb-colorpicker-input-bg, #ffffff);
}

.mb-colorpicker-rgb-inputs {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.5rem;
}

.mb-colorpicker-disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	pointer-events: none;
}
`;

export {};
