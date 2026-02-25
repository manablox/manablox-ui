type ZIndexType = 'modal' | 'overlay' | 'menu' | 'tooltip' | 'notification';

const BASE_Z_INDEXES: Record<ZIndexType, number> = {
	modal: 1100,
	overlay: 1000,
	menu: 1000,
	tooltip: 1100,
	notification: 1200,
};

const counters = new Map<ZIndexType, number>();

/**
 * Get the next z-index for a given overlay type.
 */
export function nextZIndex(type: ZIndexType): number {
	const current = counters.get(type) ?? BASE_Z_INDEXES[type];
	const next = current + 1;
	counters.set(type, next);
	return next;
}

/**
 * Reset z-index counter for a type (for testing).
 */
export function resetZIndex(type: ZIndexType): void {
	counters.delete(type);
}

/**
 * Reset all z-index counters.
 */
export function resetAllZIndexes(): void {
	counters.clear();
}

export type { ZIndexType };
