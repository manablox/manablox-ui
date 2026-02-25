export const CONFIRM_POPUP_STYLES = `
.mb-confirmpopup {
	position: fixed;
	background: var(--mb-confirmpopup-background, var(--mb-popover-background));
	color: var(--mb-confirmpopup-color, var(--mb-popover-color));
	border: 1px solid var(--mb-confirmpopup-border-color, var(--mb-popover-border-color));
	border-radius: var(--mb-confirmpopup-border-radius, var(--mb-popover-border-radius));
	box-shadow: var(--mb-confirmpopup-shadow, var(--mb-popover-shadow));
	min-width: var(--mb-confirmpopup-min-width, 16rem);
	max-width: min(var(--mb-confirmpopup-max-width, 24rem), calc(100vw - 1rem));
	opacity: 1;
	transform: scale(1);
	transition:
		opacity var(--mb-transition-duration, 0.2s) ease,
		transform var(--mb-transition-duration, 0.2s) ease;
}

.mb-confirmpopup.mb-enter-from {
	opacity: 0;
	transform: scale(0.96);
}

.mb-confirmpopup.mb-leave-active {
	opacity: 0;
	transform: scale(0.96);
}

.mb-confirmpopup-content {
	display: flex;
	align-items: flex-start;
	gap: var(--mb-confirmpopup-content-gap, 0.625rem);
	padding: var(--mb-confirmpopup-content-padding, 0.875rem 1rem 0.625rem 1rem);
}

.mb-confirmpopup-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-confirmpopup-icon-size, 1.25rem);
	line-height: 1;
	margin-top: 0.0625rem;
}

.mb-confirmpopup-message {
	margin: 0;
	line-height: 1.4;
}

.mb-confirmpopup-footer {
	display: flex;
	justify-content: flex-end;
	gap: var(--mb-confirmpopup-footer-gap, 0.5rem);
	padding: var(--mb-confirmpopup-footer-padding, 0 1rem 0.875rem 1rem);
}

.mb-confirmpopup-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	padding: var(--mb-button-padding-y, 0.45rem) var(--mb-button-padding-x, 0.8rem);
	border-radius: var(--mb-button-border-radius, 0.375rem);
	border: 1px solid transparent;
	font: inherit;
	cursor: pointer;
}

.mb-confirmpopup-button.mb-confirmpopup-reject {
	background: var(--mb-confirmpopup-reject-background, var(--mb-button-secondary-background, #e5e7eb));
	color: var(--mb-confirmpopup-reject-color, var(--mb-button-secondary-color, #111827));
	border-color: var(--mb-confirmpopup-reject-border-color, transparent);
}

.mb-confirmpopup-button.mb-confirmpopup-accept {
	background: var(--mb-confirmpopup-accept-background, var(--mb-button-primary-background, #2563eb));
	color: var(--mb-confirmpopup-accept-color, var(--mb-button-primary-color, #ffffff));
	border-color: var(--mb-confirmpopup-accept-border-color, transparent);
}

.mb-confirmpopup-arrow {
	position: absolute;
	width: 0.75rem;
	height: 0.75rem;
	background: var(--mb-confirmpopup-background, var(--mb-popover-background));
	border-inline-end: 1px solid var(--mb-confirmpopup-border-color, var(--mb-popover-border-color));
	border-block-end: 1px solid var(--mb-confirmpopup-border-color, var(--mb-popover-border-color));
	transform: rotate(45deg);
}

.mb-confirmpopup.mb-confirmpopup-top .mb-confirmpopup-arrow {
	bottom: -0.375rem;
}

.mb-confirmpopup.mb-confirmpopup-bottom .mb-confirmpopup-arrow {
	top: -0.375rem;
}

.mb-confirmpopup.mb-confirmpopup-left .mb-confirmpopup-arrow {
	right: -0.375rem;
}

.mb-confirmpopup.mb-confirmpopup-right .mb-confirmpopup-arrow {
	left: -0.375rem;
}
`;

export {};
