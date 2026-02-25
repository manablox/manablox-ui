import { tabbable, focusable } from 'tabbable';

export interface FocusTrapOptions {
	/** Element to restore focus to when trap is deactivated */
	returnFocusTo?: HTMLElement;
	/** Focus this element on activation; defaults to first tabbable */
	initialFocus?: HTMLElement | boolean;
	/** Allow clicks outside to close */
	allowOutsideClick?: boolean;
}

export class FocusTrap {
	#container: HTMLElement;
	#options: FocusTrapOptions;
	#previouslyFocused: HTMLElement | null = null;
	#handleKeydown: (e: KeyboardEvent) => void;
	#active = false;

	constructor(container: HTMLElement, options: FocusTrapOptions = {}) {
		this.#container = container;
		this.#options = options;

		this.#handleKeydown = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			const tabbableEls = tabbable(this.#container);
			if (tabbableEls.length === 0) {
				e.preventDefault();
				return;
			}

			const first = tabbableEls[0];
			const last = tabbableEls[tabbableEls.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last?.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first?.focus();
				}
			}
		};
	}

	activate(): void {
		if (this.#active) return;
		this.#active = true;

		this.#previouslyFocused = document.activeElement as HTMLElement;

		document.addEventListener('keydown', this.#handleKeydown);

		// Set initial focus
		const { initialFocus } = this.#options;
		if (initialFocus === false) {
			// Don't move focus
		} else if (initialFocus instanceof HTMLElement) {
			initialFocus.focus();
		} else {
			const tabbableEls = tabbable(this.#container);
			const first = tabbableEls[0];
			if (first) {
				first.focus();
			} else {
				this.#container.focus();
			}
		}
	}

	deactivate(): void {
		if (!this.#active) return;
		this.#active = false;

		document.removeEventListener('keydown', this.#handleKeydown);

		// Restore focus
		const returnTo = this.#options.returnFocusTo ?? this.#previouslyFocused;
		if (returnTo && typeof returnTo.focus === 'function') {
			returnTo.focus();
		}
		this.#previouslyFocused = null;
	}

	get isActive(): boolean {
		return this.#active;
	}

	/** Get all currently tabbable elements in the container */
	getTabbableElements(): HTMLElement[] {
		return tabbable(this.#container) as HTMLElement[];
	}

	/** Get all currently focusable elements in the container */
	getFocusableElements(): HTMLElement[] {
		return focusable(this.#container) as HTMLElement[];
	}
}
