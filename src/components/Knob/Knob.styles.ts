export const KNOB_STYLES = `
:host {
	display: inline-block;
}

.mb-knob {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: var(--mb-knob-size, 100px);
	height: var(--mb-knob-size, 100px);
	color: var(--mb-knob-text-color, var(--mb-text-color, #1f2937));
	user-select: none;
	touch-action: none;
}

.mb-knob-svg {
	width: 100%;
	height: 100%;
	overflow: visible;
	cursor: grab;
}

.mb-knob-disabled .mb-knob-svg,
.mb-knob-readonly .mb-knob-svg {
	cursor: default;
}

.mb-knob-range {
	fill: none;
	stroke: var(--mb-knob-range-color, var(--mb-surface-300, #cfd4dc));
	stroke-linecap: round;
}

.mb-knob-value {
	fill: none;
	stroke: var(--mb-knob-value-color, var(--mb-primary-color, #3b82f6));
	stroke-linecap: round;
	transition: stroke-dasharray 120ms linear;
}

.mb-knob-label {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-knob-label-font-size, 1rem);
	font-weight: var(--mb-knob-label-font-weight, 600);
	color: var(--mb-knob-text-color, currentColor);
	pointer-events: none;
}

.mb-knob-disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
}
`;

export {};
