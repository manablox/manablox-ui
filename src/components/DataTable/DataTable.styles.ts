export const DATATABLE_STYLES = `
.mb-datatable {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--mb-datatable-gap, 0.5rem);
	background: var(--mb-datatable-background, var(--mb-surface-ground, #fff));
	color: var(--mb-datatable-color, inherit);
	border: var(--mb-datatable-border-width, 1px) solid var(--mb-datatable-border-color, var(--mb-border-color, #e5e7eb));
	border-radius: var(--mb-datatable-border-radius, 0.5rem);
	overflow: hidden;
}

.mb-datatable-header,
.mb-datatable-footer {
	padding: var(--mb-datatable-section-padding, 0.75rem);
	background: var(--mb-datatable-section-background, transparent);
}

.mb-datatable-table-container {
	position: relative;
	overflow: auto;
}

.mb-datatable-scrollable .mb-datatable-table-container {
	max-height: var(--mb-datatable-scroll-height, 400px);
}

table.mb-datatable-table {
	width: 100%;
	border-collapse: collapse;
	border-spacing: 0;
	font-size: var(--mb-datatable-font-size, 0.875rem);
}

.mb-datatable-thead,
.mb-datatable-tbody,
.mb-datatable-tfoot {
	background: var(--mb-datatable-table-background, transparent);
}

th.mb-datatable-column-header,
td.mb-datatable-column {
	padding: var(--mb-datatable-cell-padding, 0.625rem 0.75rem);
	text-align: left;
	border-bottom: 1px solid var(--mb-datatable-row-border-color, var(--mb-border-color, #e5e7eb));
	vertical-align: middle;
	position: relative;
}

.mb-datatable-show-gridlines th.mb-datatable-column-header,
.mb-datatable-show-gridlines td.mb-datatable-column {
	border-right: 1px solid var(--mb-datatable-gridline-color, var(--mb-border-color, #e5e7eb));
}

.mb-datatable-column-header-sortable {
	cursor: pointer;
	user-select: none;
}

.mb-datatable-column-header-content {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
}

.mb-datatable-sort-icon {
	font-size: 0.75rem;
	opacity: 0.8;
}

.mb-datatable-column-header-sorted {
	background: var(--mb-datatable-header-sorted-background, rgba(59, 130, 246, 0.08));
	color: var(--mb-datatable-header-sorted-color, inherit);
}

tr.mb-datatable-row {
	background: var(--mb-datatable-row-background, transparent);
}

.mb-datatable-striped-rows .mb-datatable-row:nth-child(even) {
	background: var(--mb-datatable-striped-row-background, rgba(0, 0, 0, 0.02));
}

.mb-datatable-row-hover tr.mb-datatable-row:hover,
tr.mb-datatable-row-hover:hover {
	background: var(--mb-datatable-row-hover-background, rgba(59, 130, 246, 0.06));
}

tr.mb-datatable-row-selected {
	background: var(--mb-datatable-row-selected-background, rgba(59, 130, 246, 0.14));
}

.mb-datatable-empty-message {
	text-align: center;
	padding: 1rem;
	color: var(--mb-datatable-empty-color, var(--mb-text-muted-color, #6b7280));
}

.mb-datatable-loading-overlay {
	position: absolute;
	inset: 0;
	background: var(--mb-datatable-loading-overlay-background, rgba(255, 255, 255, 0.72));
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
	font-weight: 600;
}

.mb-datatable-column-resizer {
	position: absolute;
	top: 0;
	right: -2px;
	width: 4px;
	height: 100%;
	cursor: col-resize;
	user-select: none;
}

.mb-datatable-filter-row th {
	padding-top: 0.375rem;
	padding-bottom: 0.5rem;
	background: var(--mb-datatable-filter-row-background, transparent);
}

.mb-datatable-filter-row input {
	width: 100%;
	height: 2rem;
	padding: 0 0.5rem;
	border: 1px solid var(--mb-datatable-filter-input-border-color, var(--mb-border-color, #d1d5db));
	border-radius: 0.375rem;
	background: var(--mb-datatable-filter-input-background, #fff);
	color: inherit;
}

.mb-datatable-filter-overlay,
.mb-datatable-column-filter-menu {
	display: none;
}

.mb-datatable-row-expansion {
	padding: var(--mb-datatable-expansion-padding, 0.75rem);
	background: var(--mb-datatable-expansion-background, rgba(0, 0, 0, 0.02));
}

.mb-datatable-size-small table.mb-datatable-table {
	font-size: 0.8125rem;
}

.mb-datatable-size-small th.mb-datatable-column-header,
.mb-datatable-size-small td.mb-datatable-column {
	padding: 0.45rem 0.6rem;
}

.mb-datatable-size-large table.mb-datatable-table {
	font-size: 0.95rem;
}

.mb-datatable-size-large th.mb-datatable-column-header,
.mb-datatable-size-large td.mb-datatable-column {
	padding: 0.8rem 1rem;
}
`;

export {};
