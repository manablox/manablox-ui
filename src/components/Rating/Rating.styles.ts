export const RATING_STYLES = `
:root {
	--mb-rating-gap: 0.35rem;
	--mb-rating-icon-size: 1.25rem;
	--mb-rating-on-color: #f59e0b;
	--mb-rating-off-color: #c7c7c7;
	--mb-rating-cancel-color: #9a9a9a;
	--mb-rating-focus-ring: rgba(91, 157, 249, 0.28);
	--mb-rating-disabled-opacity: 0.6;
}

.mb-rating {
	display: inline-flex;
	align-items: center;
	gap: var(--mb-rating-gap);
	user-select: none;
}

.mb-rating.mb-disabled,
.mb-rating.mb-readonly {
	opacity: var(--mb-rating-disabled-opacity);
}

.mb-rating-item,
.mb-rating-cancel {
	border: 0;
	background: transparent;
	padding: 0.1rem;
	margin: 0;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	color: var(--mb-rating-off-color);
	border-radius: 4px;
}

.mb-rating-item:focus-visible,
.mb-rating-cancel:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--mb-rating-focus-ring);
}

.mb-rating-item.mb-active {
	color: var(--mb-rating-on-color);
}

.mb-rating-cancel {
	color: var(--mb-rating-cancel-color);
	margin-right: 0.15rem;
}

.mb-rating.mb-invalid .mb-rating-item,
.mb-rating.mb-invalid .mb-rating-cancel {
	color: var(--mb-form-field-invalid-color, #e53935);
}

.mb-rating-icon {
	width: var(--mb-rating-icon-size);
	height: var(--mb-rating-icon-size);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-rating-icon-size);
}

.mb-rating-icon svg {
	width: 100%;
	height: 100%;
	display: block;
}

.mb-rating.mb-disabled .mb-rating-item,
.mb-rating.mb-disabled .mb-rating-cancel,
.mb-rating.mb-readonly .mb-rating-item,
.mb-rating.mb-readonly .mb-rating-cancel {
	cursor: default;
}
`;

export {};
