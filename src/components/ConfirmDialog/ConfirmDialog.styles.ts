export const CONFIRM_DIALOG_STYLES = `
.mb-confirmdialog-mask {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.25rem;
	background: var(--mb-mask-background, rgba(0, 0, 0, 0.4));
	opacity: 1;
	transition: opacity var(--mb-mask-transition-duration, 0.2s) ease;
}

.mb-confirmdialog-mask.mb-enter-from {
	opacity: 0;
}

.mb-confirmdialog-mask.mb-enter-from .mb-confirmdialog {
	opacity: 0;
	transform: translateY(-0.5rem) scale(0.98);
}

.mb-confirmdialog-mask.mb-leave-active {
	opacity: 0;
}

.mb-confirmdialog-mask.mb-leave-active .mb-confirmdialog {
	opacity: 0;
	transform: translateY(-0.25rem) scale(0.98);
}

.mb-confirmdialog {
	position: relative;
	display: flex;
	flex-direction: column;
	width: min(90vw, var(--mb-confirmdialog-width, 30rem));
	max-width: 100%;
	max-height: calc(100vh - 2.5rem);
	background: var(--mb-confirmdialog-background, var(--mb-dialog-background));
	color: var(--mb-confirmdialog-color, var(--mb-dialog-color));
	border: 1px solid var(--mb-confirmdialog-border-color, var(--mb-dialog-border-color));
	border-radius: var(--mb-confirmdialog-border-radius, var(--mb-dialog-border-radius));
	box-shadow: var(--mb-confirmdialog-shadow, var(--mb-dialog-shadow));
	overflow: hidden;
	pointer-events: auto;
	opacity: 1;
	transform: translateY(0) scale(1);
	transition:
		opacity var(--mb-transition-duration, 0.2s) ease,
		transform var(--mb-transition-duration, 0.2s) ease;
}

.mb-confirmdialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--mb-dialog-header-gap, 0.5rem);
	padding: var(--mb-dialog-header-padding, 1rem 1.25rem);
	border-bottom: 1px solid var(--mb-confirmdialog-border-color, var(--mb-dialog-border-color));
}

.mb-confirmdialog-header.mb-confirmdialog-header-draggable {
	cursor: move;
	user-select: none;
}

.mb-confirmdialog-title {
	font-size: var(--mb-dialog-title-font-size, 1.125rem);
	font-weight: var(--mb-dialog-title-font-weight, 600);
	line-height: 1.2;
}

.mb-confirmdialog-close-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	padding: 0;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: var(--mb-text-muted-color, currentColor);
	cursor: pointer;
}

.mb-confirmdialog-close-button:hover {
	background: var(--mb-surface-100, rgba(0, 0, 0, 0.06));
}

.mb-confirmdialog-content {
	display: flex;
	align-items: flex-start;
	gap: var(--mb-confirmdialog-content-gap, 0.75rem);
	padding: var(--mb-confirmdialog-content-padding, var(--mb-dialog-content-padding, 1rem 1.25rem));
}

.mb-confirmdialog-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-confirmdialog-icon-size, 1.5rem);
	line-height: 1;
	flex: 0 0 auto;
	margin-top: 0.125rem;
}

.mb-confirmdialog-message {
	margin: 0;
	line-height: 1.5;
}

.mb-confirmdialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: var(--mb-confirmdialog-footer-gap, var(--mb-dialog-footer-gap, 0.5rem));
	padding: var(--mb-confirmdialog-footer-padding, var(--mb-dialog-footer-padding, 1rem 1.25rem));
	border-top: 1px solid var(--mb-confirmdialog-border-color, var(--mb-dialog-border-color));
}

.mb-confirmdialog-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	padding: var(--mb-button-padding-y, 0.5rem) var(--mb-button-padding-x, 1rem);
	border-radius: var(--mb-button-border-radius, 0.375rem);
	border: 1px solid transparent;
	font: inherit;
	cursor: pointer;
}

.mb-confirmdialog-button.mb-confirmdialog-reject {
	background: var(--mb-confirmdialog-reject-background, var(--mb-button-secondary-background, #e5e7eb));
	color: var(--mb-confirmdialog-reject-color, var(--mb-button-secondary-color, #111827));
	border-color: var(--mb-confirmdialog-reject-border-color, transparent);
}

.mb-confirmdialog-button.mb-confirmdialog-accept {
	background: var(--mb-confirmdialog-accept-background, var(--mb-button-primary-background, #2563eb));
	color: var(--mb-confirmdialog-accept-color, var(--mb-button-primary-color, #ffffff));
	border-color: var(--mb-confirmdialog-accept-border-color, transparent);
}
`;

export {};
