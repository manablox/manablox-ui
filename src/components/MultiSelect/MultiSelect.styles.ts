export const MULTISELECT_STYLES = `
.mb-multiselect {
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-height: 2.5rem;
	border: 1px solid var(--mb-multiselect-border-color);
	border-radius: var(--mb-multiselect-border-radius);
	background: var(--mb-multiselect-background);
	color: var(--mb-multiselect-color);
	box-shadow: var(--mb-multiselect-shadow);
	transition: border-color var(--mb-multiselect-transition-duration), box-shadow var(--mb-multiselect-transition-duration), background var(--mb-multiselect-transition-duration);
}

.mb-multiselect:hover:not(.mb-disabled) {
	border-color: var(--mb-multiselect-hover-border-color);
}

.mb-multiselect.mb-focused {
	border-color: var(--mb-multiselect-focus-border-color);
	box-shadow: var(--mb-multiselect-focus-ring-shadow);
}

.mb-multiselect.mb-invalid {
	border-color: var(--mb-multiselect-invalid-border-color);
}

.mb-multiselect.mb-disabled {
	background: var(--mb-multiselect-disabled-background);
	color: var(--mb-multiselect-disabled-color);
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-multiselect.mb-filled {
	background: var(--mb-multiselect-filled-background);
}

.mb-multiselect.mb-filled:hover:not(.mb-disabled) {
	background: var(--mb-multiselect-filled-hover-background);
}

.mb-multiselect.mb-filled.mb-focused {
	background: var(--mb-multiselect-filled-focus-background);
}

.mb-multiselect.mb-multiselect-sm {
	font-size: var(--mb-multiselect-sm-font-size);
	min-height: 2rem;
}

.mb-multiselect.mb-multiselect-lg {
	font-size: var(--mb-multiselect-lg-font-size);
	min-height: 3rem;
}

.mb-multiselect-trigger {
	display: inline-flex;
	align-items: center;
	flex: 1 1 auto;
	min-width: 0;
	width: 100%;
	background: transparent;
	border: 0;
	padding: var(--mb-multiselect-padding-y) var(--mb-multiselect-padding-x);
	text-align: left;
	gap: 0.5rem;
	cursor: pointer;
}

.mb-multiselect-label {
	display: inline-flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.375rem;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-multiselect-chip {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.125rem 0.45rem;
	border-radius: var(--mb-multiselect-chip-border-radius);
	background: var(--mb-highlight-background);
	color: var(--mb-highlight-color);
	max-width: 100%;
}

.mb-multiselect-chip-label {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-multiselect-chip-remove {
	border: 0;
	background: transparent;
	color: inherit;
	cursor: pointer;
	padding: 0;
	line-height: 1;
}

.mb-multiselect-controls {
	display: inline-flex;
	align-items: center;
}

.mb-multiselect-clear,
.mb-multiselect-dropdown {
	border: 0;
	background: transparent;
	width: var(--mb-multiselect-dropdown-width);
	height: 100%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.mb-multiselect-clear {
	color: var(--mb-multiselect-clear-icon-color);
	width: auto;
	padding: 0 0.25rem;
}

.mb-multiselect-dropdown {
	color: var(--mb-multiselect-dropdown-color);
}

.mb-multiselect-overlay {
	position: fixed;
	min-width: 10rem;
	background: var(--mb-multiselect-overlay-background);
	color: var(--mb-multiselect-overlay-color);
	border: 1px solid var(--mb-multiselect-overlay-border-color);
	border-radius: var(--mb-multiselect-overlay-border-radius);
	box-shadow: var(--mb-multiselect-overlay-shadow);
	overflow: hidden;
}

.mb-multiselect-header {
	padding: var(--mb-multiselect-list-header-padding);
	border-bottom: 1px solid var(--mb-multiselect-overlay-border-color);
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.mb-multiselect-filter {
	width: 100%;
	border: 1px solid var(--mb-multiselect-border-color);
	border-radius: var(--mb-border-radius-sm);
	padding: 0.4rem 0.5rem;
	font: inherit;
	color: inherit;
	background: transparent;
}

.mb-multiselect-items-wrapper {
	max-height: 200px;
	overflow: auto;
}

.mb-multiselect-list {
	list-style: none;
	margin: 0;
	padding: var(--mb-multiselect-list-padding);
	display: flex;
	flex-direction: column;
	gap: var(--mb-multiselect-list-gap);
}

.mb-multiselect-item-group {
	padding: var(--mb-multiselect-option-group-padding);
	background: var(--mb-multiselect-option-group-background);
	color: var(--mb-multiselect-option-group-color);
	font-weight: var(--mb-multiselect-option-group-font-weight);
	border-radius: var(--mb-multiselect-option-border-radius);
}

.mb-multiselect-item {
	display: flex;
	align-items: center;
	gap: var(--mb-multiselect-option-gap);
	padding: var(--mb-multiselect-option-padding);
	border-radius: var(--mb-multiselect-option-border-radius);
	color: var(--mb-multiselect-option-color);
	cursor: pointer;
	transition: background var(--mb-multiselect-transition-duration), color var(--mb-multiselect-transition-duration);
}

.mb-multiselect-item:hover,
.mb-multiselect-item.mb-highlighted {
	background: var(--mb-multiselect-option-focus-background);
	color: var(--mb-multiselect-option-focus-color);
}

.mb-multiselect-item.mb-selected {
	background: var(--mb-multiselect-option-selected-background);
	color: var(--mb-multiselect-option-selected-color);
}

.mb-multiselect-item.mb-selected.mb-highlighted {
	background: var(--mb-multiselect-option-selected-focus-background);
	color: var(--mb-multiselect-option-selected-focus-color);
}

.mb-multiselect-item-check {
	width: 1rem;
	display: inline-flex;
	justify-content: center;
}

.mb-multiselect-item[aria-disabled='true'] {
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-multiselect-empty-message {
	padding: var(--mb-multiselect-empty-message-padding);
	opacity: 0.75;
}
`;

export {};
