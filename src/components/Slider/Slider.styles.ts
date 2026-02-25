export const SLIDER_STYLES = `
:host {
	display: inline-block;
}

:root {
	--mb-slider-track-bg: #e5e7eb;
	--mb-slider-range-bg: #3b82f6;
	--mb-slider-thumb-bg: #fff;
	--mb-slider-thumb-border: 2px solid #3b82f6;
	--mb-slider-thumb-size: 1.05rem;
	--mb-slider-track-size: 0.35rem;
	--mb-slider-focus-ring: rgba(59, 130, 246, 0.26);
	--mb-slider-disabled-opacity: 0.55;
	--mb-slider-height: 1.4rem;
	--mb-slider-width-vertical: 1.4rem;
	--mb-slider-length-vertical: 10rem;
}

.mb-slider {
	position: relative;
	display: inline-flex;
	align-items: center;
	box-sizing: border-box;
	height: var(--mb-slider-height);
	min-width: 12rem;
	touch-action: none;
	user-select: none;
}

.mb-slider.mb-slider-vertical {
	width: var(--mb-slider-width-vertical);
	height: var(--mb-slider-length-vertical);
	min-width: 0;
}

.mb-slider.mb-disabled {
	opacity: var(--mb-slider-disabled-opacity);
	cursor: not-allowed;
}

.mb-slider-track {
	position: relative;
	width: 100%;
	height: var(--mb-slider-track-size);
	background: var(--mb-slider-track-bg);
	border-radius: 999px;
	cursor: pointer;
}

.mb-slider.mb-slider-vertical .mb-slider-track {
	width: var(--mb-slider-track-size);
	height: 100%;
	margin: 0 auto;
}

.mb-slider-range {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	background: var(--mb-slider-range-bg);
	border-radius: 999px;
}

.mb-slider.mb-slider-vertical .mb-slider-range {
	left: 0;
	bottom: 0;
	width: 100%;
	height: auto;
	top: auto;
}

.mb-slider-thumb {
	position: absolute;
	top: 50%;
	width: var(--mb-slider-thumb-size);
	height: var(--mb-slider-thumb-size);
	margin-left: calc(var(--mb-slider-thumb-size) / -2);
	margin-top: calc(var(--mb-slider-thumb-size) / -2);
	border-radius: 50%;
	border: var(--mb-slider-thumb-border);
	background: var(--mb-slider-thumb-bg);
	cursor: grab;
	box-sizing: border-box;
	touch-action: none;
	padding: 0;
}

.mb-slider.mb-slider-vertical .mb-slider-thumb {
	left: 50%;
	top: auto;
	margin-left: calc(var(--mb-slider-thumb-size) / -2);
	margin-top: calc(var(--mb-slider-thumb-size) / -2);
}

.mb-slider-thumb:focus-visible {
	outline: none;
	box-shadow: 0 0 0 4px var(--mb-slider-focus-ring);
}

.mb-slider-thumb:active {
	cursor: grabbing;
}
`;

export {};
