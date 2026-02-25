let counter = 0;

/**
 * Generate a unique ID string, optionally with a prefix.
 * e.g., uniqueId('mb-dialog') => 'mb-dialog-1'
 */
export function uniqueId(prefix = 'mb'): string {
	return `${prefix}-${++counter}`;
}

/**
 * Reset counter — for testing only
 */
export function _resetCounter(): void {
	counter = 0;
}
