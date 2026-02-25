export const TREETABLE_STYLES = `
.mb-treetable {
	position: relative;
	border: 1px solid var(--mb-treetable-border-color, var(--mb-datatable-border-color, #d9dde3));
	border-radius: var(--mb-treetable-border-radius, var(--mb-datatable-border-radius, 0.5rem));
	background: var(--mb-treetable-background, var(--mb-datatable-background, #fff));
	overflow: hidden;
}

.mb-treetable-wrapper {
	overflow: auto;
	max-height: var(--mb-treetable-scroll-height, auto);
}

.mb-treetable-table {
	width: 100%;
	border-collapse: collapse;
	background: inherit;
	color: var(--mb-treetable-color, var(--mb-datatable-color, inherit));
}

.mb-treetable-table th,
.mb-treetable-table td {
	padding: var(--mb-treetable-cell-padding, var(--mb-datatable-cell-padding, 0.625rem 0.75rem));
	border-bottom: 1px solid var(--mb-treetable-row-border-color, var(--mb-datatable-row-border-color, #ebedf0));
	text-align: left;
	vertical-align: middle;
}

.mb-treetable-show-gridlines .mb-treetable-table th,
.mb-treetable-show-gridlines .mb-treetable-table td {
	border-inline-end: 1px solid var(--mb-treetable-row-border-color, var(--mb-datatable-row-border-color, #ebedf0));
}

.mb-treetable-row-striped:nth-child(even) {
	background: var(--mb-treetable-striped-background, var(--mb-datatable-striped-background, #fafbfc));
}

.mb-treetable-row-selected {
	background: var(--mb-treetable-row-selected-background, var(--mb-datatable-row-selected-background, #e6f0ff));
	color: var(--mb-treetable-row-selected-color, var(--mb-datatable-row-selected-color, inherit));
}

.mb-treetable-row:hover {
	background: var(--mb-treetable-row-hover-background, var(--mb-datatable-row-hover-background, #f7f9fc));
}

.mb-treetable-toggler {
	border: 0;
	background: transparent;
	color: inherit;
	width: 1.25rem;
	height: 1.25rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	cursor: pointer;
}

.mb-treetable-toggler:disabled {
	opacity: 0.5;
	cursor: default;
}

.mb-treetable-header-cell-sort {
	cursor: pointer;
	user-select: none;
}

.mb-treetable-loading-overlay {
	position: absolute;
	inset: 0;
	background: var(--mb-treetable-loading-background, rgba(255, 255, 255, 0.7));
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}

.mb-treetable-empty {
	padding: 0.75rem;
	opacity: 0.75;
}

.mb-treetable-paginator {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.5rem;
	padding: 0.625rem;
	border-top: 1px solid var(--mb-treetable-row-border-color, var(--mb-datatable-row-border-color, #ebedf0));
}

.mb-treetable-paginator button {
	padding: 0.25rem 0.5rem;
	border: 1px solid var(--mb-treetable-border-color, var(--mb-datatable-border-color, #d9dde3));
	background: transparent;
	border-radius: 0.375rem;
	cursor: pointer;
}

.mb-treetable-paginator button:disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	cursor: default;
}
`;

export {};
