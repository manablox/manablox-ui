export const DIALOG_STYLES = `
.mb-dialog-mask {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.25rem;
	background: var(--mb-mask-background, rgba(0, 0, 0, 0.4));
	opacity: 1;
	transition: opacity var(--mb-mask-transition-duration, 0.3s) ease;
}

.mb-dialog-mask.mb-dialog-mask-non-modal {
	background: transparent;
	pointer-events: none;
}

.mb-dialog-mask.mb-dialog-top {
	align-items: flex-start;
	justify-content: center;
}

.mb-dialog-mask.mb-dialog-bottom {
	align-items: flex-end;
	justify-content: center;
}

.mb-dialog-mask.mb-dialog-left {
	align-items: center;
	justify-content: flex-start;
}

.mb-dialog-mask.mb-dialog-right {
	align-items: center;
	justify-content: flex-end;
}

.mb-dialog-mask.mb-dialog-top-left {
	align-items: flex-start;
	justify-content: flex-start;
}

.mb-dialog-mask.mb-dialog-top-right {
	align-items: flex-start;
	justify-content: flex-end;
}

.mb-dialog-mask.mb-dialog-bottom-left {
	align-items: flex-end;
	justify-content: flex-start;
}

.mb-dialog-mask.mb-dialog-bottom-right {
	align-items: flex-end;
	justify-content: flex-end;
}

.mb-dialog {
	position: relative;
	display: flex;
	flex-direction: column;
	width: min(90vw, 40rem);
	max-width: 100%;
	max-height: calc(100vh - 2.5rem);
	background: var(--mb-dialog-background);
	color: var(--mb-dialog-color);
	border: 1px solid var(--mb-dialog-border-color);
	border-radius: var(--mb-dialog-border-radius);
	box-shadow: var(--mb-dialog-shadow);
	overflow: hidden;
	pointer-events: auto;
	opacity: 1;
	transform: translateY(0) scale(1);
	transition:
		opacity var(--mb-transition-duration, 0.2s) ease,
		transform var(--mb-transition-duration, 0.2s) ease;
}

.mb-dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--mb-dialog-header-gap);
	padding: var(--mb-dialog-header-padding);
	border-bottom: 1px solid var(--mb-dialog-border-color);
	cursor: default;
	user-select: none;
}

.mb-dialog-header.mb-dialog-header-draggable {
	cursor: move;
}

.mb-dialog-title {
	font-size: var(--mb-dialog-title-font-size);
	font-weight: var(--mb-dialog-title-font-weight);
	line-height: 1.2;
}

.mb-dialog-header-actions {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	margin-inline-start: auto;
}

.mb-dialog-content {
	flex: 1;
	overflow-y: auto;
	padding: var(--mb-dialog-content-padding);
}

.mb-dialog-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: var(--mb-dialog-footer-gap);
	padding: var(--mb-dialog-footer-padding);
	border-top: 1px solid var(--mb-dialog-border-color);
}

.mb-dialog-close-button,
.mb-dialog-maximize-button {
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
	transition: background-color var(--mb-transition-duration, 0.2s) ease;
}

.mb-dialog-close-button:hover,
.mb-dialog-maximize-button:hover {
	background: var(--mb-surface-100, rgba(0, 0, 0, 0.06));
}

.mb-dialog-maximized {
	width: 100vw !important;
	max-width: 100vw !important;
	height: 100vh !important;
	max-height: 100vh !important;
	margin: 0 !important;
	border-radius: 0 !important;
	left: 0 !important;
	top: 0 !important;
	transform: none !important;
}

.mb-dialog-mask.mb-enter-from {
	opacity: 0;
}

.mb-dialog-mask.mb-enter-from .mb-dialog {
	opacity: 0;
	transform: translateY(-0.5rem) scale(0.98);
}

.mb-dialog-mask.mb-leave-active {
	opacity: 0;
}

.mb-dialog-mask.mb-leave-active .mb-dialog {
	opacity: 0;
	transform: translateY(-0.25rem) scale(0.98);
}
`;
