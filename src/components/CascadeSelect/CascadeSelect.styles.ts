export const CASCADESELECT_STYLES = `
.mb-cascadeselect {
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-height: 2.5rem;
	border: 1px solid var(--mb-cascadeselect-border-color, #cbd5e1);
	border-radius: var(--mb-cascadeselect-border-radius, 0.5rem);
	background: var(--mb-cascadeselect-background, #ffffff);
	color: var(--mb-cascadeselect-color, #111827);
}

.mb-cascadeselect-label {
	flex: 1 1 auto;
	padding: 0.55rem 0.75rem;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-cascadeselect-dropdown {
	flex: 0 0 auto;
	border: 0;
	background: transparent;
	color: inherit;
	width: 2.25rem;
	height: 100%;
	cursor: pointer;
}

.mb-cascadeselect-overlay,
.mb-cascadeselect-overlay-sublist {
	position: fixed;
	min-width: 14rem;
	border-radius: 0.5rem;
	border: 1px solid var(--mb-cascadeselect-overlay-border-color, #d1d5db);
	background: var(--mb-cascadeselect-overlay-background, #ffffff);
	color: var(--mb-cascadeselect-overlay-color, #111827);
	box-shadow: var(--mb-cascadeselect-overlay-shadow, 0 10px 25px rgba(0, 0, 0, 0.12));
	overflow: visible;
}

.mb-cascadeselect-list {
	list-style: none;
	margin: 0;
	padding: 0.25rem;
}

.mb-cascadeselect-item {
	position: relative;
}

.mb-cascadeselect-item-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: 0.5rem 0.625rem;
	border-radius: 0.375rem;
	cursor: pointer;
}

.mb-cascadeselect-item-content:hover,
.mb-cascadeselect-item-content.mb-active {
	background: var(--mb-cascadeselect-item-hover-background, #eff6ff);
	color: var(--mb-cascadeselect-item-hover-color, #0f172a);
}

.mb-cascadeselect-group-icon {
	opacity: 0.75;
}

.mb-cascadeselect-overlay-sublist {
	position: absolute;
	top: 0;
	left: calc(100% + 0.25rem);
	z-index: 2;
}

.mb-cascadeselect-disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	pointer-events: none;
}

.mb-cascadeselect-invalid {
	border-color: var(--mb-cascadeselect-invalid-border-color, #ef4444);
}
`;

export {};
