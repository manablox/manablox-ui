import { uniqueId } from '../utils/UniqueId.js';
import type { DynamicDialogInstance, DynamicDialogState } from './types.js';
import type { Subscriber, Unsubscribe } from './types.js';

export class DynamicDialogService {
	static #instance: DynamicDialogService;

	#dialogs: DynamicDialogInstance[] = [];
	#subscribers: Set<Subscriber<DynamicDialogState>> = new Set();

	private constructor() {}

	static instance(): DynamicDialogService {
		if (!DynamicDialogService.#instance) {
			DynamicDialogService.#instance = new DynamicDialogService();
		}
		return DynamicDialogService.#instance;
	}

	/**
	 * Open a dynamic dialog by custom element tag name or constructor.
	 * @param tagNameOrCtor tag name (string like 'mb-my-content') or CustomElementConstructor
	 * @param props properties to pass to the content element
	 * @returns the dialog key for closing it later
	 */
	open(
		tagNameOrCtor: string | CustomElementConstructor,
		props: Record<string, unknown> = {}
	): string {
		const key = uniqueId('mb-dyndialog');
		const tagName =
			typeof tagNameOrCtor === 'string'
				? tagNameOrCtor
				: customElements.getName(tagNameOrCtor) ?? 'div';

		const instance: DynamicDialogInstance = {
			key,
			tagName,
			props,
			visible: true,
		};

		this.#dialogs = [...this.#dialogs, instance];
		this.#notify();
		return key;
	}

	/**
	 * Close and remove a dynamic dialog by key.
	 */
	close(key: string): void {
		this.#dialogs = this.#dialogs.filter(d => d.key !== key);
		this.#notify();
	}

	/**
	 * Close all open dynamic dialogs.
	 */
	closeAll(): void {
		this.#dialogs = [];
		this.#notify();
	}

	/**
	 * Subscribe to state changes. Returns unsubscribe function.
	 */
	subscribe(listener: Subscriber<DynamicDialogState>): Unsubscribe {
		this.#subscribers.add(listener);
		listener(this.#getState());
		return () => this.#subscribers.delete(listener);
	}

	#getState(): DynamicDialogState {
		return { dialogs: [...this.#dialogs] };
	}

	#notify(): void {
		const state = this.#getState();
		this.#subscribers.forEach(fn => fn(state));
	}
}

export const dynamicDialogService = DynamicDialogService.instance();
