export const FILEUPLOAD_STYLES = `
.mb-fileupload {
	display: flex;
	flex-direction: column;
	gap: var(--mb-fileupload-gap, 0.75rem);
	color: var(--mb-fileupload-color, inherit);
}

.mb-fileupload-basic,
.mb-fileupload-advanced {
	border: var(--mb-fileupload-border-width, 1px) solid var(--mb-fileupload-border-color, var(--mb-border-color, #e5e7eb));
	border-radius: var(--mb-fileupload-border-radius, 0.5rem);
	background: var(--mb-fileupload-background, var(--mb-surface-ground, #fff));
}

.mb-fileupload-basic {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: var(--mb-fileupload-basic-padding, 0.75rem);
}

.mb-fileupload-buttonbar {
	display: flex;
	gap: var(--mb-fileupload-button-gap, 0.5rem);
	padding: var(--mb-fileupload-buttonbar-padding, 0.75rem);
	border-bottom: var(--mb-fileupload-border-width, 1px) solid var(--mb-fileupload-border-color, var(--mb-border-color, #e5e7eb));
}

.mb-fileupload-content {
	padding: var(--mb-fileupload-content-padding, 0.75rem);
	min-height: var(--mb-fileupload-content-min-height, 7rem);
	border: var(--mb-fileupload-dropzone-border-width, 2px) dashed var(--mb-fileupload-dropzone-border-color, var(--mb-border-color, #d1d5db));
	border-radius: var(--mb-fileupload-dropzone-border-radius, 0.5rem);
	margin: 0.75rem;
}

.mb-fileupload-highlight {
	border-color: var(--mb-fileupload-highlight-color, var(--mb-primary-color, #3b82f6));
	background: var(--mb-fileupload-highlight-background, rgba(59, 130, 246, 0.06));
}

.mb-fileupload-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: var(--mb-fileupload-empty-min-height, 4.5rem);
	text-align: center;
	color: var(--mb-fileupload-empty-color, var(--mb-text-muted-color, #6b7280));
}

.mb-fileupload-files {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.mb-fileupload-file {
	display: grid;
	grid-template-columns: auto 1fr auto auto;
	gap: 0.5rem;
	align-items: center;
	padding: var(--mb-fileupload-file-padding, 0.5rem);
	border: 1px solid var(--mb-fileupload-file-border-color, var(--mb-border-color, #e5e7eb));
	border-radius: var(--mb-fileupload-file-border-radius, 0.375rem);
	background: var(--mb-fileupload-file-background, var(--mb-surface-ground, #fff));
}

.mb-fileupload-file-thumbnail {
	width: var(--mb-fileupload-thumbnail-size, 2.5rem);
	height: var(--mb-fileupload-thumbnail-size, 2.5rem);
	object-fit: cover;
	border-radius: 0.25rem;
	background: var(--mb-fileupload-thumbnail-background, #f3f4f6);
}

.mb-fileupload-file-meta {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.mb-fileupload-file-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-fileupload-file-size,
.mb-fileupload-file-progress {
	font-size: 0.75rem;
	color: var(--mb-fileupload-file-meta-color, var(--mb-text-muted-color, #6b7280));
}

.mb-fileupload-filename {
	font-size: 0.875rem;
	color: var(--mb-fileupload-filename-color, var(--mb-text-muted-color, #6b7280));
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.mb-fileupload-btn,
.mb-fileupload-remove {
	height: var(--mb-fileupload-button-height, 2rem);
	padding: 0 0.75rem;
	border: 1px solid var(--mb-fileupload-button-border-color, var(--mb-border-color, #d1d5db));
	background: var(--mb-fileupload-button-background, #fff);
	color: var(--mb-fileupload-button-color, inherit);
	border-radius: 0.375rem;
	cursor: pointer;
}

.mb-fileupload-remove {
	padding: 0 0.5rem;
}

.mb-fileupload-btn:disabled,
.mb-fileupload-remove:disabled {
	opacity: var(--mb-disabled-opacity, 0.6);
	cursor: not-allowed;
}
`;

export {};
