import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { FILEUPLOAD_STYLES } from './FileUpload.styles.js';

type UploadMode = 'advanced' | 'basic';

type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

interface ManagedFile {
	id: string;
	file: File;
	progress: number;
	status: UploadStatus;
	error?: string;
	xhr?: XMLHttpRequest;
}

interface UploadDetail {
	files: File[];
	xhr: XMLHttpRequest;
}

function uid(): string {
	return Math.random().toString(36).slice(2, 10);
}

export class MbFileUpload extends MbBaseComponent {
	static readonly _componentName = 'mb-fileupload';
	static readonly _componentStyles = FILEUPLOAD_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['name', 'string'],
			['url', 'string'],
			['multiple', 'boolean'],
			['accept', 'string'],
			['max-file-size', 'number'],
			['max-files', 'number'],
			['mode', 'string'],
			['auto', 'boolean'],
			['choose-label', 'string'],
			['upload-label', 'string'],
			['cancel-label', 'string'],
			['choose-icon', 'string'],
			['upload-icon', 'string'],
			['cancel-icon', 'string'],
			['file-limit', 'number'],
			['disabled', 'boolean'],
			['invalid-file-size-message', 'string'],
			['invalid-file-type-message', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbFileUpload.attributeConverters.keys());
	}

	#files: ManagedFile[] = [];
	#dragOver = false;
	#inputId = `mb-fileupload-input-${uid()}`;

	get mode(): UploadMode {
		return this._str('mode', 'advanced') === 'basic' ? 'basic' : 'advanced';
	}
	get disabled(): boolean {
		return this._bool('disabled');
	}
	get name(): string {
		return this._str('name', 'files');
	}
	get url(): string {
		return this._str('url');
	}
	get multiple(): boolean {
		return this._bool('multiple');
	}
	get accept(): string {
		return this._str('accept');
	}
	get maxFileSize(): number {
		return Math.max(0, this._num('max-file-size', 0) ?? 0);
	}
	get maxFiles(): number {
		const fileLimit = this._num('file-limit', 0) ?? 0;
		const explicitMax = this._num('max-files', 0) ?? 0;
		return Math.max(0, fileLimit || explicitMax);
	}
	get auto(): boolean {
		return this._bool('auto');
	}
	get chooseLabel(): string {
		return this._str('choose-label', 'Choose');
	}
	get uploadLabel(): string {
		return this._str('upload-label', 'Upload');
	}
	get cancelLabel(): string {
		return this._str('cancel-label', 'Cancel');
	}
	get chooseIcon(): string {
		return this._str('choose-icon');
	}
	get uploadIcon(): string {
		return this._str('upload-icon');
	}
	get cancelIcon(): string {
		return this._str('cancel-icon');
	}
	get invalidFileSizeMessage(): string {
		return this._str('invalid-file-size-message', 'Invalid file size for {0}.');
	}
	get invalidFileTypeMessage(): string {
		return this._str('invalid-file-type-message', 'Invalid file type for {0}.');
	}

	upload(): void {
		void this.#uploadPending();
	}

	clear(): void {
		this.#files = [];
		this.emit('mb-clear');
		this._scheduleRender();
	}

	protected _render(): string {
		const wrapperClass = this.mode === 'basic' ? 'mb-fileupload-basic' : 'mb-fileupload-advanced';
		const disabled = this.disabled ? 'disabled' : '';
		const names = this.#files.map(entry => entry.file.name).join(', ');

		if (this.mode === 'basic') {
			return this._html`
				<div class="mb-fileupload">
					<div class="${wrapperClass}">
						<input id="${this.#inputId}" class="mb-fileupload-input" type="file" ${this.multiple ? 'multiple' : ''} accept="${this._escape(this.accept)}" ${disabled} hidden />
						<button type="button" class="mb-fileupload-btn" data-action="choose" ${disabled}>${this.#renderIcon(this.chooseIcon)}${this._escape(this.chooseLabel)}</button>
						<span class="mb-fileupload-filename">${this._escape(names || 'No file chosen')}</span>
					</div>
				</div>
			`;
		}

		const pendingCount = this.#files.filter(file => file.status === 'pending').length;
		const listContent = this.#renderFiles();
		const hasFiles = this.#files.length > 0;
		return this._html`
			<div class="mb-fileupload">
				<div class="${wrapperClass}">
					<input id="${this.#inputId}" class="mb-fileupload-input" type="file" ${this.multiple ? 'multiple' : ''} accept="${this._escape(this.accept)}" ${disabled} hidden />
					<div class="mb-fileupload-buttonbar">
						<button type="button" class="mb-fileupload-btn" data-action="choose" ${disabled}>${this.#renderIcon(this.chooseIcon)}${this._escape(this.chooseLabel)}</button>
						<button type="button" class="mb-fileupload-btn" data-action="upload" ${disabled || pendingCount === 0 ? 'disabled' : ''}>${this.#renderIcon(this.uploadIcon)}${this._escape(this.uploadLabel)}</button>
						<button type="button" class="mb-fileupload-btn" data-action="cancel" ${disabled || this.#files.length === 0 ? 'disabled' : ''}>${this.#renderIcon(this.cancelIcon)}${this._escape(this.cancelLabel)}</button>
					</div>
					<div class="mb-fileupload-content ${this.#dragOver ? 'mb-fileupload-highlight' : ''}" data-drop-zone>
						${hasFiles
							? `<slot name="content"><div class="mb-fileupload-files">${listContent}</div></slot>`
							: `<slot name="empty"><div class="mb-fileupload-empty">Drag and drop files here.</div></slot>`}
					</div>
				</div>
			</div>
		`;
	}

	protected _afterRender(): void {
		const root = this._qs<HTMLElement>('.mb-fileupload');
		const input = this._qs<HTMLInputElement>('input.mb-fileupload-input');
		if (!root || !input) return;

		const onButtonClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const button = target.closest<HTMLButtonElement>('button[data-action]');
			if (!button || this.disabled) return;
			const action = button.dataset.action;
			if (action === 'choose') input.click();
			if (action === 'upload') void this.#uploadPending();
			if (action === 'cancel') this.clear();
		};

		const onInputChange = (event: Event) => {
			const target = event.target as HTMLInputElement;
			const selected = target.files ? Array.from(target.files) : [];
			this.#addFiles(selected);
			target.value = '';
		};

		const onRemoveClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const button = target.closest<HTMLButtonElement>('button[data-remove-id]');
			if (!button) return;
			const id = button.dataset.removeId ?? '';
			this.#removeById(id);
		};

		const onDragOver = (event: DragEvent) => {
			if (this.mode !== 'advanced' || this.disabled) return;
			event.preventDefault();
			this.#dragOver = true;
			this._scheduleRender();
		};

		const onDragLeave = (event: DragEvent) => {
			if (this.mode !== 'advanced') return;
			const current = event.currentTarget as HTMLElement;
			const related = event.relatedTarget as Node | null;
			if (related && current.contains(related)) return;
			this.#dragOver = false;
			this._scheduleRender();
		};

		const onDrop = (event: DragEvent) => {
			if (this.mode !== 'advanced' || this.disabled) return;
			event.preventDefault();
			this.#dragOver = false;
			const dropped = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
			this.#addFiles(dropped);
		};

		root.addEventListener('click', onButtonClick);
		root.addEventListener('click', onRemoveClick);
		input.addEventListener('change', onInputChange);

		const dropZone = this._qs<HTMLElement>('[data-drop-zone]');
		if (dropZone) {
			dropZone.addEventListener('dragover', onDragOver);
			dropZone.addEventListener('dragleave', onDragLeave);
			dropZone.addEventListener('drop', onDrop);
		}

		this._addCleanup(() => root.removeEventListener('click', onButtonClick));
		this._addCleanup(() => root.removeEventListener('click', onRemoveClick));
		this._addCleanup(() => input.removeEventListener('change', onInputChange));
		if (dropZone) {
			this._addCleanup(() => dropZone.removeEventListener('dragover', onDragOver));
			this._addCleanup(() => dropZone.removeEventListener('dragleave', onDragLeave));
			this._addCleanup(() => dropZone.removeEventListener('drop', onDrop));
		}
	}

	#renderFiles(): string {
		return this.#files
			.map(entry => {
				const file = entry.file;
				const thumbnail = file.type.startsWith('image/') ? `<img class="mb-fileupload-file-thumbnail" src="${URL.createObjectURL(file)}" alt="${this._escape(file.name)}" />` : '<div class="mb-fileupload-file-thumbnail"></div>';
				const progress = entry.status === 'uploading' ? `<span class="mb-fileupload-file-progress">${entry.progress}%</span>` : `<span class="mb-fileupload-file-progress">${this._escape(entry.status)}</span>`;
				const error = entry.error ? `<span class="mb-fileupload-file-progress">${this._escape(entry.error)}</span>` : '';
				return `
					<div class="mb-fileupload-file" data-file-id="${entry.id}">
						${thumbnail}
						<div class="mb-fileupload-file-meta">
							<span class="mb-fileupload-file-name">${this._escape(file.name)}</span>
							<span class="mb-fileupload-file-size">${this._escape(this.#formatSize(file.size))}</span>
							${progress}
							${error}
						</div>
						<div></div>
						<button type="button" class="mb-fileupload-remove" data-remove-id="${entry.id}" ${entry.status === 'uploading' ? 'disabled' : ''}>✕</button>
					</div>
				`;
			})
			.join('');
	}

	#renderIcon(icon: string): string {
		return icon ? `<span aria-hidden="true">${this._escape(icon)}</span> ` : '';
	}

	#addFiles(nextFiles: File[]): void {
		if (!nextFiles.length) return;
		const validated: ManagedFile[] = [];

		for (const file of nextFiles) {
			const limit = this.maxFiles;
			if (limit > 0 && this.#files.length + validated.length >= limit) {
				this.emit('mb-error', { files: [file], message: `File limit (${limit}) exceeded.` });
				continue;
			}

			const sizeError = this.#validateFileSize(file);
			if (sizeError) {
				this.emit('mb-error', { files: [file], message: sizeError });
				continue;
			}

			const typeError = this.#validateFileType(file);
			if (typeError) {
				this.emit('mb-error', { files: [file], message: typeError });
				continue;
			}

			validated.push({ id: uid(), file, progress: 0, status: 'pending' });
		}

		if (!validated.length) return;

		if (!this.multiple && validated.length > 0) {
			const first = validated[0];
			if (first) {
				this.#files = [first];
			}
		} else {
			this.#files = [...this.#files, ...validated];
		}

		this.emit('mb-select', { files: validated.map(entry => entry.file) });
		this._scheduleRender();

		if (this.auto) {
			void this.#uploadPending();
		}
	}

	#validateFileSize(file: File): string | null {
		if (!this.maxFileSize || file.size <= this.maxFileSize) return null;
		return this.invalidFileSizeMessage.replace('{0}', file.name).replace('{1}', String(this.maxFileSize));
	}

	#validateFileType(file: File): string | null {
		const accept = this.accept.trim();
		if (!accept) return null;

		const allowed = accept
			.split(',')
			.map(type => type.trim())
			.filter(Boolean);

		const isAllowed = allowed.some(rule => {
			if (rule === '*/*') return true;
			if (rule.endsWith('/*')) {
				const prefix = rule.slice(0, -1);
				return file.type.startsWith(prefix);
			}
			if (rule.startsWith('.')) {
				return file.name.toLowerCase().endsWith(rule.toLowerCase());
			}
			return file.type === rule;
		});

		return isAllowed ? null : this.invalidFileTypeMessage.replace('{0}', file.name);
	}

	async #uploadPending(): Promise<void> {
		if (!this.url || this.disabled) return;
		const pending = this.#files.filter(entry => entry.status === 'pending');
		if (!pending.length) return;

		for (const entry of pending) {
			await this.#uploadOne(entry);
		}
	}

	#uploadOne(entry: ManagedFile): Promise<void> {
		entry.status = 'uploading';
		entry.progress = 0;
		this._scheduleRender();

		return new Promise(resolve => {
			const formData = new FormData();
			formData.append(this.name, entry.file, entry.file.name);

			const xhr = new XMLHttpRequest();
			entry.xhr = xhr;
			xhr.open('POST', this.url, true);

			xhr.upload.addEventListener('progress', event => {
				if (!event.lengthComputable) return;
				entry.progress = Math.round((event.loaded / event.total) * 100);
				this._scheduleRender();
			});

			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					entry.status = 'uploaded';
					entry.progress = 100;
					this.emit<UploadDetail>('mb-upload', { files: [entry.file], xhr });
				} else {
					entry.status = 'error';
					entry.error = `Upload failed (${xhr.status}).`;
					this.emit<UploadDetail>('mb-error', { files: [entry.file], xhr });
				}
				this._scheduleRender();
				resolve();
			});

			xhr.addEventListener('error', () => {
				entry.status = 'error';
				entry.error = 'Network error.';
				this.emit<UploadDetail>('mb-error', { files: [entry.file], xhr });
				this._scheduleRender();
				resolve();
			});

			xhr.send(formData);
		});
	}

	#removeById(id: string): void {
		const index = this.#files.findIndex(entry => entry.id === id);
		if (index < 0) return;
		const [removed] = this.#files.splice(index, 1);
		if (!removed) return;
		if (removed.status === 'uploading' && removed.xhr) {
			removed.xhr.abort();
		}
		this.emit('mb-remove', { file: removed.file });
		this._scheduleRender();
	}

	#formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
	}
}

export const defineFileUpload = createDefine('mb-fileupload', MbFileUpload);
export default MbFileUpload;
export {};
