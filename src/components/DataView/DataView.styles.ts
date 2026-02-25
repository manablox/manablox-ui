export const DATAVIEW_STYLES = `
:host {
	display: block;
}

.mb-dataview {
	display: flex;
	flex-direction: column;
	gap: var(--mb-dataview-gap, 0.75rem);
	background: var(--mb-dataview-background, transparent);
	color: var(--mb-dataview-color, inherit);
	border: var(--mb-dataview-border-width, 0) solid var(--mb-dataview-border-color, transparent);
	border-radius: var(--mb-dataview-border-radius, 0);
	padding: var(--mb-dataview-padding, 0);
}

.mb-dataview-header,
.mb-dataview-footer {
	padding: var(--mb-dataview-section-padding, 0.75rem 0);
	background: var(--mb-dataview-section-background, transparent);
	color: var(--mb-dataview-section-color, inherit);
}

.mb-dataview-content {
	display: flex;
	flex-direction: column;
	gap: var(--mb-dataview-content-gap, 0.75rem);
}

.mb-dataview[data-layout='grid'] .mb-dataview-content {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(var(--mb-dataview-grid-min-width, 14rem), 1fr));
	gap: var(--mb-dataview-grid-gap, 0.75rem);
}

.mb-dataview-grid-item,
.mb-dataview-list-item {
	border: var(--mb-dataview-item-border-width, 1px) solid var(--mb-dataview-item-border-color, var(--mb-border-color, #e5e7eb));
	background: var(--mb-dataview-item-background, var(--mb-surface-ground, #fff));
	border-radius: var(--mb-dataview-item-border-radius, 0.5rem);
	padding: var(--mb-dataview-item-padding, 0.75rem);
	min-height: var(--mb-dataview-item-min-height, 3rem);
}

.mb-dataview-empty-message {
	text-align: center;
	padding: var(--mb-dataview-empty-padding, 1rem);
	color: var(--mb-dataview-empty-color, var(--mb-text-muted-color, #6b7280));
	border: var(--mb-dataview-item-border-width, 1px) dashed var(--mb-dataview-item-border-color, var(--mb-border-color, #e5e7eb));
	border-radius: var(--mb-dataview-item-border-radius, 0.5rem);
}
`;

export {};
