export const TOOLTIP_STYLES = `
.mb-tooltip {
	position: fixed;
	z-index: 1;
	pointer-events: none;
	max-width: var(--mb-tooltip-max-width);
	filter: drop-shadow(var(--mb-tooltip-shadow));
}

.mb-tooltip-text {
	background: var(--mb-tooltip-background);
	color: var(--mb-tooltip-color);
	padding: var(--mb-tooltip-padding);
	border-radius: var(--mb-tooltip-border-radius);
	line-height: 1.2;
	word-break: break-word;
}

.mb-tooltip-arrow {
	position: absolute;
	width: 0.5rem;
	height: 0.5rem;
	background: var(--mb-tooltip-background);
	transform: rotate(45deg);
}

.mb-tooltip.mb-tooltip-top .mb-tooltip-arrow {
	bottom: -0.25rem;
}

.mb-tooltip.mb-tooltip-bottom .mb-tooltip-arrow {
	top: -0.25rem;
}

.mb-tooltip.mb-tooltip-left .mb-tooltip-arrow {
	right: -0.25rem;
}

.mb-tooltip.mb-tooltip-right .mb-tooltip-arrow {
	left: -0.25rem;
}
`;
