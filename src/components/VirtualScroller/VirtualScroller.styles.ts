export const VIRTUALSCROLLER_STYLES = `
.mb-virtualscroller {
	position: relative;
	overflow: auto;
	contain: strict;
	border: 1px solid var(--mb-virtualscroller-border-color, transparent);
	border-radius: var(--mb-virtualscroller-border-radius, 0.375rem);
	background: var(--mb-virtualscroller-background, transparent);
}

.mb-virtualscroller-spacer {
	position: absolute;
	inset: 0 auto auto 0;
	pointer-events: none;
	width: 1px;
	height: var(--mb-virtualscroller-spacer-height, 0px);
}

.mb-virtualscroller-content {
	position: absolute;
	top: 0;
	left: 0;
	will-change: transform;
	width: 100%;
}

.mb-virtualscroller-item {
	box-sizing: border-box;
}

.mb-virtualscroller-loader {
	padding: var(--mb-virtualscroller-loader-padding, 0.75rem);
	opacity: 0.75;
}
`;

export {};
