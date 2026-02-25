export const TRISTATECHECKBOX_STYLES = `
:host {
	display: inline-block;
}

.mb-tristatecheckbox {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.mb-tristatecheckbox-label {
	display: inline-flex;
	align-items: center;
	margin-inline-start: var(--mb-tristatecheckbox-label-gap, 0.5rem);
}

.mb-tristatecheckbox-label:empty {
	display: none;
}

.mb-tristatecheckbox .mb-tristatecheckbox-box {
	width: var(--mb-checkbox-width, 1.25rem);
	height: var(--mb-checkbox-height, 1.25rem);
	border-radius: var(--mb-checkbox-border-radius, 0.25rem);
	border: 1px solid var(--mb-checkbox-border-color, #cbd5e1);
	background: var(--mb-checkbox-background, #ffffff);
	color: var(--mb-checkbox-icon-color, #ffffff);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-checkbox-icon-size, 0.75rem);
	transition: all var(--mb-tristatecheckbox-transition-duration, 120ms);
}

.mb-tristatecheckbox-checked .mb-tristatecheckbox-box,
.mb-tristatecheckbox-indeterminate .mb-tristatecheckbox-box {
	background: var(--mb-checkbox-checked-background, var(--mb-primary-color, #3b82f6));
	border-color: var(--mb-checkbox-checked-border-color, var(--mb-primary-color, #3b82f6));
}

.mb-tristatecheckbox.mb-disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	cursor: default;
	pointer-events: none;
}

.mb-tristatecheckbox.mb-invalid .mb-tristatecheckbox-box {
	border-color: var(--mb-tristatecheckbox-invalid-border-color, var(--mb-red-500, #ef4444));
}

.mb-tristatecheckbox-indeterminate-icon {
	line-height: 1;
}
`;

export {};
