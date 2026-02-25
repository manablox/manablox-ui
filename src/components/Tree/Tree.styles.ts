export const TREE_STYLES = `
.mb-tree {
	display: flex;
	flex-direction: column;
	gap: var(--mb-tree-gap, 0.5rem);
	border: 1px solid var(--mb-tree-border-color, var(--mb-surface-border, #d9dde3));
	border-radius: var(--mb-tree-border-radius, 0.5rem);
	background: var(--mb-tree-background, var(--mb-surface-card, #ffffff));
	color: var(--mb-tree-color, inherit);
	overflow: hidden;
}

.mb-tree-filter-container {
	padding: var(--mb-tree-filter-padding, 0.625rem);
	border-bottom: 1px solid var(--mb-tree-border-color, var(--mb-surface-border, #d9dde3));
}

.mb-tree-filter-container input {
	width: 100%;
	padding: var(--mb-tree-filter-input-padding, 0.45rem 0.6rem);
	border: 1px solid var(--mb-tree-filter-input-border, var(--mb-surface-border, #d9dde3));
	border-radius: var(--mb-tree-filter-input-radius, 0.375rem);
	background: var(--mb-tree-filter-input-background, transparent);
	color: inherit;
	font: inherit;
}

.mb-tree-container {
	position: relative;
	overflow-y: auto;
	max-height: var(--mb-tree-scroll-height, 20rem);
	padding: var(--mb-tree-container-padding, 0.375rem);
}

.mb-tree-root,
.mb-tree-node-children {
	list-style: none;
	margin: 0;
	padding: 0;
}

.mb-tree-node {
	margin: 0;
	padding: 0;
}

.mb-tree-node-content {
	display: flex;
	align-items: center;
	gap: var(--mb-tree-node-gap, 0.375rem);
	padding: var(--mb-tree-node-padding, 0.375rem 0.5rem);
	border-radius: var(--mb-tree-node-border-radius, 0.375rem);
	cursor: pointer;
	outline: none;
	transition: background var(--mb-tree-transition-duration, 120ms), color var(--mb-tree-transition-duration, 120ms);
}

.mb-tree-node-content:hover,
.mb-tree-node-content.mb-tree-node-highlighted {
	background: var(--mb-tree-node-hover-background, var(--mb-surface-hover, #f5f7fa));
	color: var(--mb-tree-node-hover-color, inherit);
}

.mb-tree-node-content.mb-tree-node-selected {
	background: var(--mb-tree-node-selected-background, #e6f0ff);
	color: var(--mb-tree-node-selected-color, inherit);
}

.mb-tree-node-content.mb-tree-node-focus {
	box-shadow: 0 0 0 var(--mb-tree-focus-ring-width, 2px) var(--mb-tree-focus-ring-color, #93c5fd);
}

.mb-tree-node-toggler {
	border: 0;
	background: transparent;
	color: inherit;
	width: var(--mb-tree-toggler-size, 1.25rem);
	height: var(--mb-tree-toggler-size, 1.25rem);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	border-radius: 999px;
}

.mb-tree-node-toggler:disabled {
	opacity: 0.5;
	cursor: default;
}

.mb-tree-node-checkbox {
	margin: 0;
}

.mb-tree-node-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: var(--mb-tree-icon-size, 1rem);
	height: var(--mb-tree-icon-size, 1rem);
	font-size: var(--mb-tree-icon-size, 1rem);
	line-height: 1;
}

.mb-tree-node-label {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.mb-tree-node-children {
	overflow: hidden;
	max-height: 120rem;
	opacity: 1;
	transition: max-height var(--mb-tree-transition-duration, 140ms), opacity var(--mb-tree-transition-duration, 140ms);
}

.mb-tree-node-children[hidden] {
	max-height: 0;
	opacity: 0;
	pointer-events: none;
}

.mb-tree-empty {
	padding: var(--mb-tree-empty-padding, 0.75rem 0.5rem);
	opacity: 0.75;
}

.mb-tree-loading-overlay {
	position: absolute;
	inset: 0;
	background: var(--mb-tree-loading-background, rgba(255, 255, 255, 0.7));
	backdrop-filter: blur(1px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
	font-size: var(--mb-tree-loading-font-size, 0.875rem);
}
`;

export {};
