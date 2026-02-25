export const SELECT_STYLES = `
.mb-select {
	display: inline-flex;
	align-items: center;
	min-height: 2.5rem;
	width: 100%;
	border: 1px solid var(--mb-select-border-color);
	border-radius: var(--mb-select-border-radius);
	background: var(--mb-select-background);
	color: var(--mb-select-color);
	box-shadow: var(--mb-select-shadow);
	transition: border-color var(--mb-select-transition-duration), box-shadow var(--mb-select-transition-duration), background var(--mb-select-transition-duration);
}

.mb-select-trigger {
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-height: inherit;
	background: transparent;
	border: 0;
	padding: 0;
	color: inherit;
	cursor: pointer;
	text-align: left;
}

.mb-select:hover:not(.mb-disabled) {
	border-color: var(--mb-select-hover-border-color);
}

.mb-select.mb-focused {
	border-color: var(--mb-select-focus-border-color);
	box-shadow: var(--mb-select-focus-ring-shadow);
}

.mb-select.mb-invalid {
	border-color: var(--mb-select-invalid-border-color);
}

.mb-select.mb-disabled {
	background: var(--mb-select-disabled-background);
	color: var(--mb-select-disabled-color);
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-select.mb-filled {
	background: var(--mb-select-filled-background);
}

.mb-select.mb-filled:hover:not(.mb-disabled) {
	background: var(--mb-select-filled-hover-background);
}

.mb-select.mb-filled.mb-focused {
	background: var(--mb-select-filled-focus-background);
}

.mb-select.mb-select-sm {
	font-size: var(--mb-select-sm-font-size);
	min-height: 2rem;
}

.mb-select.mb-select-lg {
	font-size: var(--mb-select-lg-font-size);
	min-height: 3rem;
}

.mb-select-label {
	flex: 1 1 auto;
	display: flex;
	align-items: center;
	min-width: 0;
	width: 100%;
	padding: var(--mb-select-padding-y) var(--mb-select-padding-x);
	color: inherit;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	background: transparent;
	border: 0;
	outline: 0;
	font: inherit;
}

.mb-select-label::placeholder {
	color: var(--mb-select-placeholder-color);
}

.mb-select.mb-invalid .mb-select-label::placeholder {
	color: var(--mb-select-invalid-placeholder-color);
}

.mb-select-dropdown {
	flex: 0 0 var(--mb-select-dropdown-width);
	width: var(--mb-select-dropdown-width);
	height: 100%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: 0;
	color: var(--mb-select-dropdown-color);
	cursor: pointer;
}

.mb-select-dropdown-icon,
.mb-select-clear-icon,
.mb-select-check {
	font-size: 0.85rem;
	line-height: 1;
}

.mb-select-clear {
	border: 0;
	background: transparent;
	color: var(--mb-select-clear-icon-color);
	cursor: pointer;
	padding: 0.25rem;
}

.mb-select-overlay {
	position: fixed;
	min-width: 10rem;
	background: var(--mb-select-overlay-background);
	color: var(--mb-select-overlay-color);
	border: 1px solid var(--mb-select-overlay-border-color);
	border-radius: var(--mb-select-overlay-border-radius);
	box-shadow: var(--mb-select-overlay-shadow);
	overflow: hidden;
	z-index: 1;
}

.mb-select-header {
	padding: var(--mb-select-list-header-padding);
	border-bottom: 1px solid var(--mb-select-overlay-border-color);
}

.mb-select-filter {
	width: 100%;
	border: 1px solid var(--mb-select-border-color);
	border-radius: var(--mb-border-radius-sm);
	padding: 0.4rem 0.5rem;
	background: var(--mb-select-background);
	color: var(--mb-select-color);
	font: inherit;
}

.mb-select-items-wrapper {
	max-height: 200px;
	overflow: auto;
}

.mb-select-list {
	list-style: none;
	margin: 0;
	padding: var(--mb-select-list-padding);
	display: flex;
	flex-direction: column;
	gap: var(--mb-select-list-gap);
}

.mb-select-item-group {
	padding: var(--mb-select-option-group-padding);
	background: var(--mb-select-option-group-background);
	color: var(--mb-select-option-group-color);
	font-weight: var(--mb-select-option-group-font-weight);
	border-radius: var(--mb-select-option-border-radius);
}

.mb-select-item {
	padding: var(--mb-select-option-padding);
	border-radius: var(--mb-select-option-border-radius);
	color: var(--mb-select-option-color);
	cursor: pointer;
	transition: background var(--mb-select-transition-duration), color var(--mb-select-transition-duration);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.mb-select-item:hover,
.mb-select-item.mb-highlighted {
	background: var(--mb-select-option-focus-background);
	color: var(--mb-select-option-focus-color);
}

.mb-select-item.mb-selected {
	background: var(--mb-select-option-selected-background);
	color: var(--mb-select-option-selected-color);
}

.mb-select-item.mb-selected.mb-highlighted {
	background: var(--mb-select-option-selected-focus-background);
	color: var(--mb-select-option-selected-focus-color);
}

.mb-select-item-label {
	flex: 1 1 auto;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-select-item[aria-disabled='true'] {
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-select-empty-message {
	padding: var(--mb-select-empty-message-padding);
	color: var(--mb-select-option-color);
	opacity: 0.75;
}
`;

export {};
