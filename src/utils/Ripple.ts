export const RIPPLE_CSS = `
.mb-ripple {
	position: relative;
	overflow: hidden;
}

.mb-ink {
	display: block;
	position: absolute;
	border-radius: 100%;
	transform: scale(0);
	background: rgba(255, 255, 255, 0.5);
	pointer-events: none;
}

.mb-ink.mb-ink-active {
	animation: mb-ripple 0.4s linear;
}

@keyframes mb-ripple {
	100% {
		opacity: 0;
		transform: scale(2.5);
	}
}
`;

export function ensureRippleStyles(): void {
	// No-op for Shadow DOM migration compatibility.
}

/**
 * Attach ripple pointer effect to an element.
 * Returns a cleanup function to detach.
 */
export function attachRipple(el: HTMLElement): () => void {
	el.classList.add('mb-ripple');

	const handler = (e: PointerEvent) => {
		const rect = el.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height);
		const x = e.clientX - rect.left - size / 2;
		const y = e.clientY - rect.top - size / 2;

		const ink = document.createElement('span');
		ink.className = 'mb-ink';
		ink.style.cssText = `width:${size}px;height:${size}px;top:${y}px;left:${x}px`;
		el.appendChild(ink);

		// Force reflow
		void ink.offsetWidth;
		ink.classList.add('mb-ink-active');

		const cleanup = () => {
			ink.removeEventListener('animationend', cleanup);
			ink.remove();
		};
		ink.addEventListener('animationend', cleanup);
	};

	el.addEventListener('pointerdown', handler);

	return () => {
		el.removeEventListener('pointerdown', handler);
		el.classList.remove('mb-ripple');
	};
}
