import { uniqueId } from '../utils/UniqueId.js';
import type { ToastMessage, ToastState } from './types.js';
import type { Subscriber, Unsubscribe } from './types.js';

export class ToastService {
	static #instance: ToastService;

	#messages: ToastMessage[] = [];
	#subscribers: Set<Subscriber<ToastState>> = new Set();

	private constructor() {}

	static instance(): ToastService {
		if (!ToastService.#instance) {
			ToastService.#instance = new ToastService();
		}
		return ToastService.#instance;
	}

	/**
	 * Add a toast message. Returns the generated (or provided) message id.
	 */
	add(message: ToastMessage): string {
		const id = message.id ?? uniqueId('mb-toast-msg');
		const msg: ToastMessage = { life: 3000, closable: true, ...message, id };

		this.#messages = [...this.#messages, msg];
		this.#notify();

		// Auto-remove after life duration unless sticky
		if (!msg.sticky && msg.life && msg.life > 0) {
			setTimeout(() => this.remove(id), msg.life);
		}

		return id;
	}

	/**
	 * Remove a toast message by id.
	 */
	remove(id: string): void {
		this.#messages = this.#messages.filter(m => m.id !== id);
		this.#notify();
	}

	/**
	 * Remove all toast messages, optionally filtered by group.
	 */
	clear(group?: string): void {
		if (group) {
			this.#messages = this.#messages.filter(m => m.group !== group);
		} else {
			this.#messages = [];
		}
		this.#notify();
	}

	/**
	 * Subscribe to state changes. Returns an unsubscribe function.
	 */
	subscribe(listener: Subscriber<ToastState>): Unsubscribe {
		this.#subscribers.add(listener);
		// Immediately call with current state
		listener(this.#getState());
		return () => this.#subscribers.delete(listener);
	}

	#getState(): ToastState {
		return { messages: [...this.#messages] };
	}

	#notify(): void {
		const state = this.#getState();
		this.#subscribers.forEach(fn => fn(state));
	}
}

/** Convenience singleton accessor */
export const toastService = ToastService.instance();
