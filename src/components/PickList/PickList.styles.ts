export const PICKLIST_STYLES = `
.mb-picklist {
	display: flex;
	gap: var(--mb-picklist-gap, 0.75rem);
	align-items: stretch;
}

.mb-picklist-list-wrapper {
	flex: 1;
	min-width: 0;
}

.mb-picklist-list-container {
	border: 1px solid var(--mb-picklist-border-color, #d9dde3);
	border-radius: var(--mb-picklist-border-radius, 0.5rem);
	background: var(--mb-picklist-background, #fff);
	overflow: hidden;
}

.mb-picklist-header {
	padding: var(--mb-picklist-header-padding, 0.625rem 0.75rem);
	border-bottom: 1px solid var(--mb-picklist-border-color, #d9dde3);
	font-weight: var(--mb-picklist-header-font-weight, 600);
}

.mb-picklist-filter-container {
	padding: 0.5rem 0.75rem;
	border-bottom: 1px solid var(--mb-picklist-border-color, #d9dde3);
}

.mb-picklist-filter-container input {
	width: 100%;
	padding: 0.4rem 0.55rem;
	border: 1px solid var(--mb-picklist-filter-border-color, #d9dde3);
	border-radius: 0.375rem;
	font: inherit;
}

.mb-picklist-list {
	list-style: none;
	margin: 0;
	padding: 0.375rem;
	max-height: var(--mb-picklist-list-height, 18rem);
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.mb-picklist-item {
	padding: var(--mb-picklist-item-padding, 0.5rem 0.625rem);
	border-radius: var(--mb-picklist-item-radius, 0.375rem);
	cursor: pointer;
	outline: none;
}

.mb-picklist-item:hover,
.mb-picklist-item.mb-picklist-item-focus {
	background: var(--mb-picklist-item-hover-background, #f5f7fa);
}

.mb-picklist-item-selected,
.mb-picklist-item.mb-picklist-item-selected {
	background: var(--mb-picklist-item-selected-background, #e6f0ff);
	color: var(--mb-picklist-item-selected-color, inherit);
}

.mb-picklist-controls {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: var(--mb-picklist-controls-gap, 0.375rem);
}

.mb-picklist-controls button,
.mb-picklist-list-controls button {
	padding: 0.35rem 0.5rem;
	border: 1px solid var(--mb-picklist-control-border-color, #d9dde3);
	border-radius: 0.375rem;
	background: var(--mb-picklist-control-background, transparent);
	cursor: pointer;
}

.mb-picklist-list-controls {
	display: flex;
	gap: 0.25rem;
	padding: 0.5rem 0.75rem;
	border-top: 1px solid var(--mb-picklist-border-color, #d9dde3);
}

.mb-picklist-striped .mb-picklist-item:nth-child(even) {
	background: var(--mb-picklist-striped-background, #fafbfc);
}

@media (max-width: 960px) {
	.mb-picklist[data-breakpoint="960px"],
	.mb-picklist {
		flex-direction: column;
	}

	.mb-picklist-controls {
		flex-direction: row;
	}
}
`;

export {};
