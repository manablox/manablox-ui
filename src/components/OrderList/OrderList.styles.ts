export const ORDERLIST_STYLES = `
:host {
	display: block;
}

.mb-orderlist {
	display: flex;
	gap: var(--mb-orderlist-gap, 0.75rem);
	align-items: stretch;
}

.mb-orderlist-controls {
	display: flex;
	flex-direction: column;
	gap: var(--mb-orderlist-controls-gap, 0.375rem);
}

.mb-orderlist-controls button {
	padding: 0.35rem 0.5rem;
	border: 1px solid var(--mb-orderlist-control-border-color, #d9dde3);
	border-radius: 0.375rem;
	background: var(--mb-orderlist-control-background, transparent);
	cursor: pointer;
}

.mb-orderlist-list-container {
	flex: 1;
	border: 1px solid var(--mb-orderlist-border-color, #d9dde3);
	border-radius: var(--mb-orderlist-border-radius, 0.5rem);
	overflow: hidden;
	background: var(--mb-orderlist-background, #fff);
}

.mb-orderlist-header {
	padding: var(--mb-orderlist-header-padding, 0.625rem 0.75rem);
	border-bottom: 1px solid var(--mb-orderlist-border-color, #d9dde3);
	font-weight: var(--mb-orderlist-header-font-weight, 600);
}

.mb-orderlist-filter-container {
	padding: 0.5rem 0.75rem;
	border-bottom: 1px solid var(--mb-orderlist-border-color, #d9dde3);
}

.mb-orderlist-filter-container input {
	width: 100%;
	padding: 0.4rem 0.55rem;
	border: 1px solid var(--mb-orderlist-filter-border-color, #d9dde3);
	border-radius: 0.375rem;
	font: inherit;
}

.mb-orderlist-list {
	list-style: none;
	margin: 0;
	padding: 0.375rem;
	max-height: var(--mb-orderlist-list-height, 18rem);
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.mb-orderlist-item {
	padding: var(--mb-orderlist-item-padding, 0.5rem 0.625rem);
	border-radius: var(--mb-orderlist-item-radius, 0.375rem);
	cursor: pointer;
	outline: none;
}

.mb-orderlist-item:hover,
.mb-orderlist-item.mb-orderlist-item-focus {
	background: var(--mb-orderlist-item-hover-background, #f5f7fa);
}

.mb-orderlist-item-selected,
.mb-orderlist-item.mb-orderlist-item-selected {
	background: var(--mb-orderlist-item-selected-background, #e6f0ff);
	color: var(--mb-orderlist-item-selected-color, inherit);
}

.mb-orderlist-striped .mb-orderlist-item:nth-child(even) {
	background: var(--mb-orderlist-striped-background, #fafbfc);
}
`;

export {};
