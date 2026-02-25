import { uniqueId } from '../utils/UniqueId.js';
import type { ConfirmOptions, ConfirmState } from './types.js';
import type { Subscriber, Unsubscribe } from './types.js';

export class ConfirmService {
	static #instance: ConfirmService;

	#state: ConfirmState = { visible: false, options: null };
	#subscribers: Set<Subscriber<ConfirmState>> = new Set();

	private constructor() {}

	static instance(): ConfirmService {
		if (!ConfirmService.#instance) {
			ConfirmService.#instance = new ConfirmService();
		}
		return ConfirmService.#instance;
	}

	/**
	 * Show a confirm dialog/popup. Returns the generated request key.
	 */
	require(options: ConfirmOptions): string {
		const key = options.key ?? uniqueId('mb-confirm');
		this.#state = {
			visible: true,
			options: { ...options, key },
		};
		this.#notify();
		return key;
	}

	/**
	 * Close the confirm dialog. Calls onHide if provided.
	 */
	close(): void {
		const prev = this.#state.options;
		this.#state = { visible: false, options: null };
		this.#notify();
		prev?.onHide?.();
	}

	/**
	 * Subscribe to state changes. Returns an unsubscribe function.
	 */
	subscribe(listener: Subscriber<ConfirmState>): Unsubscribe {
		this.#subscribers.add(listener);
		listener(this.#state);
		return () => this.#subscribers.delete(listener);
	}

	#notify(): void {
		this.#subscribers.forEach(fn => fn({ ...this.#state }));
	}
}

export const confirmService = ConfirmService.instance();
