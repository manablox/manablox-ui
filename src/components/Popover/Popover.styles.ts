export const POPOVER_STYLES = `
.mb-popover {
	position: fixed;
	background: var(--mb-popover-background);
	color: var(--mb-popover-color);
	border: 1px solid var(--mb-popover-border-color);
	border-radius: var(--mb-popover-border-radius);
	box-shadow: var(--mb-popover-shadow);
	opacity: 1;
	transform: scale(1);
	transition:
		opacity var(--mb-transition-duration, 0.2s) ease,
		transform var(--mb-transition-duration, 0.2s) ease;
}

.mb-popover-content {
	padding: var(--mb-popover-content-padding);
}

.mb-popover-arrow {
	position: absolute;
	width: 0.75rem;
	height: 0.75rem;
	background: var(--mb-popover-background);
	border-inline-end: 1px solid var(--mb-popover-border-color);
	border-block-end: 1px solid var(--mb-popover-border-color);
	transform: rotate(45deg);
}

.mb-popover.mb-popover-top .mb-popover-arrow {
	bottom: -0.375rem;
}

.mb-popover.mb-popover-bottom .mb-popover-arrow {
	top: -0.375rem;
}

.mb-popover.mb-popover-left .mb-popover-arrow {
	right: -0.375rem;
}

.mb-popover.mb-popover-right .mb-popover-arrow {
	left: -0.375rem;
}

.mb-popover.mb-enter-from {
	opacity: 0;
	transform: scale(0.96);
}

.mb-popover.mb-leave-active {
	opacity: 0;
	transform: scale(0.96);
}
`;
