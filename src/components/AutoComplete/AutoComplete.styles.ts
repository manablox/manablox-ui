export const AUTOCOMPLETE_STYLES = `
.mb-autocomplete {
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-height: 2.5rem;
	border: 1px solid var(--mb-autocomplete-border-color);
	border-radius: var(--mb-autocomplete-border-radius);
	background: var(--mb-autocomplete-background);
	color: var(--mb-autocomplete-color);
	box-shadow: var(--mb-autocomplete-shadow);
	transition: border-color var(--mb-autocomplete-transition-duration), box-shadow var(--mb-autocomplete-transition-duration), background var(--mb-autocomplete-transition-duration);
}

.mb-autocomplete:hover:not(.mb-disabled) {
	border-color: var(--mb-autocomplete-hover-border-color);
}

.mb-autocomplete.mb-focused {
	border-color: var(--mb-autocomplete-focus-border-color);
	box-shadow: var(--mb-autocomplete-focus-ring-shadow);
}

.mb-autocomplete.mb-invalid {
	border-color: var(--mb-autocomplete-invalid-border-color);
}

.mb-autocomplete.mb-disabled {
	background: var(--mb-autocomplete-disabled-background);
	color: var(--mb-autocomplete-disabled-color);
	opacity: var(--mb-disabled-opacity);
	pointer-events: none;
}

.mb-autocomplete-input,
.mb-autocomplete-multiple-input {
	flex: 1 1 auto;
	min-width: 0;
	width: 100%;
	border: 0;
	outline: 0;
	background: transparent;
	color: inherit;
	font: inherit;
	padding: var(--mb-autocomplete-padding-y) var(--mb-autocomplete-padding-x);
}

.mb-autocomplete-input::placeholder,
.mb-autocomplete-multiple-input::placeholder {
	color: var(--mb-autocomplete-placeholder-color);
}

.mb-autocomplete-controls {
	display: inline-flex;
	align-items: stretch;
}

.mb-autocomplete-dropdown,
.mb-autocomplete-clear {
	border: 0;
	background: transparent;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--mb-autocomplete-dropdown-color);
}

.mb-autocomplete-dropdown {
	width: var(--mb-autocomplete-dropdown-width);
}

.mb-autocomplete-clear {
	padding: 0 0.25rem;
	width: auto;
}

.mb-autocomplete-multiple {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	flex-wrap: wrap;
	padding: 0.25rem;
	flex: 1 1 auto;
}

.mb-autocomplete-chip {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.125rem 0.45rem;
	border-radius: var(--mb-autocomplete-chip-border-radius);
	background: var(--mb-highlight-background);
	color: var(--mb-highlight-color);
}

.mb-autocomplete-chip-remove {
	border: 0;
	background: transparent;
	color: inherit;
	padding: 0;
	cursor: pointer;
	line-height: 1;
}

.mb-autocomplete-overlay {
	position: fixed;
	min-width: 10rem;
	background: var(--mb-autocomplete-overlay-background);
	color: var(--mb-autocomplete-overlay-color);
	border: 1px solid var(--mb-autocomplete-overlay-border-color);
	border-radius: var(--mb-autocomplete-overlay-border-radius);
	box-shadow: var(--mb-autocomplete-overlay-shadow);
	overflow: hidden;
}

.mb-autocomplete-items-wrapper {
	max-height: 200px;
	overflow: auto;
}

.mb-autocomplete-list {
	list-style: none;
	margin: 0;
	padding: var(--mb-autocomplete-list-padding);
	display: flex;
	flex-direction: column;
	gap: var(--mb-autocomplete-list-gap);
}

.mb-autocomplete-item-group {
	padding: var(--mb-autocomplete-option-group-padding);
	background: var(--mb-autocomplete-option-group-background);
	color: var(--mb-autocomplete-option-group-color);
	font-weight: var(--mb-autocomplete-option-group-font-weight);
	border-radius: var(--mb-autocomplete-option-border-radius);
}

.mb-autocomplete-item {
	padding: var(--mb-autocomplete-option-padding);
	border-radius: var(--mb-autocomplete-option-border-radius);
	color: var(--mb-autocomplete-option-color);
	cursor: pointer;
	transition: background var(--mb-autocomplete-transition-duration), color var(--mb-autocomplete-transition-duration);
}

.mb-autocomplete-item:hover,
.mb-autocomplete-item.mb-highlighted {
	background: var(--mb-autocomplete-option-focus-background);
	color: var(--mb-autocomplete-option-focus-color);
}

.mb-autocomplete-item.mb-selected {
	background: var(--mb-autocomplete-option-selected-background);
	color: var(--mb-autocomplete-option-selected-color);
}

.mb-autocomplete-item.mb-selected.mb-highlighted {
	background: var(--mb-autocomplete-option-selected-focus-background);
	color: var(--mb-autocomplete-option-selected-focus-color);
}

.mb-autocomplete-empty-message {
	padding: var(--mb-autocomplete-empty-message-padding);
	opacity: 0.75;
}
`;

export {};
