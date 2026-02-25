export const LISTBOX_STYLES = `
:host {
	display: block;
}

.mb-listbox {
	display: inline-flex;
	flex-direction: column;
	width: 100%;
	border: 1px solid var(--mb-listbox-border-color);
	border-radius: var(--mb-listbox-border-radius);
	background: var(--mb-listbox-background);
	color: var(--mb-listbox-color);
	box-shadow: var(--mb-listbox-shadow);
	overflow: hidden;
	transition: border-color var(--mb-listbox-transition-duration), box-shadow var(--mb-listbox-transition-duration), background var(--mb-listbox-transition-duration);
}

.mb-listbox.mb-invalid {
	border-color: var(--mb-listbox-invalid-border-color);
}

.mb-listbox.mb-disabled {
	background: var(--mb-listbox-disabled-background);
	color: var(--mb-listbox-disabled-color);
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-listbox-header {
	padding: var(--mb-listbox-list-header-padding);
	border-bottom: 1px solid var(--mb-listbox-border-color);
}

.mb-listbox-filter {
	width: 100%;
	border: 1px solid var(--mb-listbox-border-color);
	border-radius: var(--mb-border-radius-sm);
	padding: 0.4rem 0.5rem;
	background: transparent;
	color: inherit;
	font: inherit;
}

.mb-listbox-items-wrapper {
	max-height: 14rem;
	overflow: auto;
}

.mb-listbox-list {
	list-style: none;
	margin: 0;
	padding: var(--mb-listbox-list-padding);
	display: flex;
	flex-direction: column;
	gap: var(--mb-listbox-list-gap);
	outline: none;
}

.mb-listbox-item-group {
	padding: var(--mb-listbox-option-group-padding);
	background: var(--mb-listbox-option-group-background);
	color: var(--mb-listbox-option-group-color);
	font-weight: var(--mb-listbox-option-group-font-weight);
	border-radius: var(--mb-listbox-option-border-radius);
}

.mb-listbox-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: var(--mb-listbox-option-padding);
	border-radius: var(--mb-listbox-option-border-radius);
	color: var(--mb-listbox-option-color);
	cursor: pointer;
	transition: background var(--mb-listbox-transition-duration), color var(--mb-listbox-transition-duration);
}

.mb-listbox-item:hover,
.mb-listbox-item.mb-highlighted {
	background: var(--mb-listbox-option-focus-background);
	color: var(--mb-listbox-option-focus-color);
}

.mb-listbox-item.mb-selected {
	background: var(--mb-listbox-option-selected-background);
	color: var(--mb-listbox-option-selected-color);
}

.mb-listbox-item.mb-selected.mb-highlighted {
	background: var(--mb-listbox-option-selected-focus-background);
	color: var(--mb-listbox-option-selected-focus-color);
}

.mb-listbox-item[aria-disabled='true'] {
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-listbox-empty-message {
	padding: var(--mb-listbox-empty-message-padding);
	opacity: 0.75;
}
`;

export {};
