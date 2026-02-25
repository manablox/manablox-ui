export const DRAWER_STYLES = `
.mb-drawer-mask {
	position: fixed;
	inset: 0;
	background: var(--mb-mask-background, rgba(0, 0, 0, 0.4));
	opacity: 1;
	transition: opacity var(--mb-mask-transition-duration, 0.3s) ease;
}

.mb-drawer-mask.mb-drawer-mask-non-modal {
	background: transparent;
	pointer-events: none;
}

.mb-drawer {
	position: fixed;
	display: flex;
	flex-direction: column;
	background: var(--mb-drawer-background);
	color: var(--mb-drawer-color);
	border: 1px solid var(--mb-drawer-border-color);
	box-shadow: var(--mb-drawer-shadow);
	overflow: hidden;
	pointer-events: auto;
	transition:
		transform var(--mb-transition-duration, 0.2s) ease,
		opacity var(--mb-transition-duration, 0.2s) ease;
}

.mb-drawer-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: var(--mb-drawer-header-padding);
	border-bottom: 1px solid var(--mb-drawer-border-color);
}

.mb-drawer-title {
	font-size: var(--mb-drawer-title-font-size);
	font-weight: var(--mb-drawer-title-font-weight);
	line-height: 1.2;
}

.mb-drawer-close-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: var(--mb-text-muted-color, currentColor);
	cursor: pointer;
}

.mb-drawer-close-button:hover {
	background: var(--mb-surface-100, rgba(0, 0, 0, 0.06));
}

.mb-drawer-content {
	flex: 1;
	overflow-y: auto;
	padding: var(--mb-drawer-content-padding);
}

.mb-drawer-footer {
	padding: var(--mb-drawer-footer-padding);
	border-top: 1px solid var(--mb-drawer-border-color);
}

.mb-drawer-left {
	left: 0;
	top: 0;
	height: 100%;
	width: 20rem;
	transform: translateX(0);
}

.mb-drawer-right {
	right: 0;
	top: 0;
	height: 100%;
	width: 20rem;
	transform: translateX(0);
}

.mb-drawer-top {
	left: 0;
	top: 0;
	width: 100%;
	height: 18rem;
	transform: translateY(0);
}

.mb-drawer-bottom {
	left: 0;
	bottom: 0;
	width: 100%;
	height: 18rem;
	transform: translateY(0);
}

.mb-drawer-mask.mb-enter-from {
	opacity: 0;
}

.mb-drawer-mask.mb-enter-from .mb-drawer-left {
	transform: translateX(-100%);
}

.mb-drawer-mask.mb-enter-from .mb-drawer-right {
	transform: translateX(100%);
}

.mb-drawer-mask.mb-enter-from .mb-drawer-top {
	transform: translateY(-100%);
}

.mb-drawer-mask.mb-enter-from .mb-drawer-bottom {
	transform: translateY(100%);
}

.mb-drawer-mask.mb-leave-active {
	opacity: 0;
}

.mb-drawer-mask.mb-leave-active .mb-drawer-left {
	transform: translateX(-100%);
}

.mb-drawer-mask.mb-leave-active .mb-drawer-right {
	transform: translateX(100%);
}

.mb-drawer-mask.mb-leave-active .mb-drawer-top {
	transform: translateY(-100%);
}

.mb-drawer-mask.mb-leave-active .mb-drawer-bottom {
	transform: translateY(100%);
}
`;
