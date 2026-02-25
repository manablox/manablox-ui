export const TREESELECT_STYLES = `
.mb-treeselect {
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-height: 2.5rem;
	border: 1px solid var(--mb-treeselect-border-color, #cbd5e1);
	border-radius: var(--mb-treeselect-border-radius, 0.5rem);
	background: var(--mb-treeselect-bg, #fff);
	color: var(--mb-treeselect-color, #111827);
}

.mb-treeselect-label-container {
	flex: 1 1 auto;
	min-width: 0;
	padding: 0.5rem 0.75rem;
}

.mb-treeselect-label,
.mb-treeselect-placeholder {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-treeselect-placeholder {
	color: var(--mb-treeselect-placeholder-color, #64748b);
}

.mb-treeselect-chip-items {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
}

.mb-treeselect-chip {
	background: var(--mb-treeselect-chip-bg, #e2e8f0);
	border-radius: 999px;
	padding: 0.15rem 0.5rem;
	font-size: 0.75rem;
}

.mb-treeselect-dropdown {
	width: 2.25rem;
	height: 100%;
	border: 0;
	background: transparent;
	color: inherit;
	cursor: pointer;
}

.mb-treeselect-overlay {
	position: fixed;
	min-width: 16rem;
	border-radius: 0.5rem;
	border: 1px solid var(--mb-treeselect-overlay-border-color, #d1d5db);
	background: var(--mb-treeselect-overlay-bg, #fff);
	box-shadow: var(--mb-treeselect-overlay-shadow, 0 10px 25px rgba(0, 0, 0, 0.12));
	display: flex;
	flex-direction: column;
}

.mb-treeselect-tree-container {
	overflow: auto;
	padding: 0.25rem;
}

.mb-treeselect-tree,
.mb-treeselect-tree ul {
	list-style: none;
	margin: 0;
	padding-left: 0.5rem;
}

.mb-treeselect-node-content {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.25rem 0.375rem;
	border-radius: 0.375rem;
	cursor: pointer;
}

.mb-treeselect-node-content:hover {
	background: var(--mb-treeselect-node-hover-bg, #eff6ff);
}

.mb-treeselect-footer {
	border-top: 1px solid var(--mb-treeselect-overlay-border-color, #e5e7eb);
	padding: 0.5rem 0.625rem;
	font-size: 0.75rem;
	color: var(--mb-treeselect-footer-color, #475569);
}

.mb-treeselect-empty-message {
	padding: 0.75rem;
	color: var(--mb-treeselect-empty-color, #64748b);
}

.mb-treeselect-filter {
	margin: 0.5rem;
	width: calc(100% - 1rem);
	min-height: 2rem;
	border: 1px solid var(--mb-treeselect-filter-border-color, #cbd5e1);
	border-radius: 0.375rem;
	padding: 0.35rem 0.5rem;
	font: inherit;
}

.mb-treeselect-disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	pointer-events: none;
}

.mb-treeselect-invalid {
	border-color: var(--mb-treeselect-invalid-border-color, #ef4444);
}
`;

export {};
