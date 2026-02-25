import type { DynamicDialogInstance } from '../../core/types.js';
import type { Unsubscribe } from '../../services/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { dynamicDialogService } from '../../services/DynamicDialogService.js';
import { DYNAMIC_DIALOG_STYLES } from './DynamicDialog.styles.js';

interface DynamicDialogEntry {
	dialogEl: HTMLElement;
	contentEl: HTMLElement;
	cleanup: () => void;
}

export class MbDynamicDialog extends MbBaseComponent {
	protected static readonly _componentName = 'mb-dynamicdialog';
	protected static readonly _componentStyles = DYNAMIC_DIALOG_STYLES;

	#unsubscribe: Unsubscribe | null = null;
	#entries = new Map<string, DynamicDialogEntry>();

	constructor() {
		super();
	}

	connectedCallback(): void {
		super.connectedCallback();

		this.#unsubscribe = dynamicDialogService.subscribe(state => {
			this.#sync(state.dialogs);
		});

		this._addCleanup(() => {
			this.#unsubscribe?.();
			this.#unsubscribe = null;
		});
		this._addCleanup(() => this.#teardown());
	}

	disconnectedCallback(): void {
		this.#teardown();
		super.disconnectedCallback();
	}

	protected _render(): string {
		return '';
	}

	#sync(dialogs: DynamicDialogInstance[]): void {
		const nextKeys = new Set(dialogs.map(dialog => dialog.key));

		for (const [key, entry] of this.#entries) {
			if (!nextKeys.has(key)) {
				entry.cleanup();
				entry.dialogEl.remove();
				this.#entries.delete(key);
			}
		}

		for (const dialog of dialogs) {
			const existing = this.#entries.get(dialog.key);
			if (existing) {
				this.#updateEntry(existing, dialog);
				continue;
			}
			this.#createEntry(dialog);
		}
	}

	#createEntry(instance: DynamicDialogInstance): void {
		const dialogEl = document.createElement('mb-dialog');
		dialogEl.setAttribute('visible', String(instance.visible));
		dialogEl.setAttribute('modal', 'true');
		dialogEl.setAttribute('closable', 'true');
		dialogEl.setAttribute('dismissable-mask', 'false');
		dialogEl.setAttribute('close-on-escape', 'true');
		dialogEl.setAttribute('draggable', 'false');
		dialogEl.setAttribute('data-mb-dynamicdialog-key', instance.key);

		const contentEl = document.createElement(instance.tagName);
		Object.assign(contentEl as unknown as Record<string, unknown>, instance.props);
		dialogEl.appendChild(contentEl);

		const onUpdateVisible = (event: Event) => {
			const customEvent = event as CustomEvent<{ value?: boolean }>;
			if (customEvent.detail?.value === false) {
				dynamicDialogService.close(instance.key);
			}
		};

		const onHide = () => {
			dynamicDialogService.close(instance.key);
		};

		dialogEl.addEventListener('mb-update:visible', onUpdateVisible as EventListener);
		dialogEl.addEventListener('mb-hide', onHide);

		const cleanup = () => {
			dialogEl.removeEventListener('mb-update:visible', onUpdateVisible as EventListener);
			dialogEl.removeEventListener('mb-hide', onHide);
		};

		this.#entries.set(instance.key, { dialogEl, contentEl, cleanup });
		this.appendChild(dialogEl);
	}

	#updateEntry(entry: DynamicDialogEntry, instance: DynamicDialogInstance): void {
		entry.dialogEl.setAttribute('visible', String(instance.visible));

		if (entry.contentEl.tagName.toLowerCase() !== instance.tagName.toLowerCase()) {
			const replacement = document.createElement(instance.tagName);
			Object.assign(replacement as unknown as Record<string, unknown>, instance.props);
			entry.contentEl.replaceWith(replacement);
			entry.contentEl = replacement;
			return;
		}

		Object.assign(entry.contentEl as unknown as Record<string, unknown>, instance.props);
	}

	#teardown(): void {
		for (const [, entry] of this.#entries) {
			entry.cleanup();
			entry.dialogEl.remove();
		}
		this.#entries.clear();
	}
}
