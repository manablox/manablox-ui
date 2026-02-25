import {
	computePosition,
	autoUpdate,
	offset,
	flip,
	shift,
	arrow as arrowMiddleware,
	type Placement,
	type AutoUpdateOptions,
	type ComputePositionConfig,
	type Middleware,
} from '@floating-ui/dom';

export type { Placement };

export interface PositionOptions {
	/** Placement of the floating element relative to the reference */
	placement?: Placement;
	/** Offset from the reference element in px */
	offsetDistance?: number;
	/** Offset along the side axis */
	offsetSkid?: number;
	/** Whether to flip placement if not enough space */
	flip?: boolean;
	/** Whether to shift to stay in viewport */
	shift?: boolean;
	/** Shift padding from viewport edge */
	shiftPadding?: number;
	/** Arrow element (optional) */
	arrowEl?: HTMLElement | null;
	/** Whether to auto-update position on scroll/resize/reposition */
	autoUpdate?: boolean;
	/** Auto-update options */
	autoUpdateOptions?: Partial<AutoUpdateOptions>;
}

export interface PositionResult {
	x: number;
	y: number;
	placement: Placement;
	arrowX?: number;
	arrowY?: number;
}

type CleanupFn = () => void;

/**
 * Compute and apply position once.
 */
export async function applyPosition(
	referenceEl: HTMLElement | Element,
	floatingEl: HTMLElement,
	options: PositionOptions = {}
): Promise<PositionResult> {
	const {
		placement = 'bottom',
		offsetDistance = 4,
		offsetSkid = 0,
		flip: doFlip = true,
		shift: doShift = true,
		shiftPadding = 8,
		arrowEl,
	} = options;

	const middleware: Middleware[] = [
		offset({ mainAxis: offsetDistance, crossAxis: offsetSkid }),
	];

	if (doFlip) middleware.push(flip());
	if (doShift) middleware.push(shift({ padding: shiftPadding }));
	if (arrowEl) middleware.push(arrowMiddleware({ element: arrowEl }));

	const config: ComputePositionConfig = { placement, middleware };

	const result = await computePosition(referenceEl, floatingEl, config);

	Object.assign(floatingEl.style, {
		position: 'absolute',
		left: `${result.x}px`,
		top: `${result.y}px`,
	});

	const arrowData = result.middlewareData.arrow;
	const arrowX = arrowData?.x;
	const arrowY = arrowData?.y;

	if (arrowEl && arrowData) {
		if (arrowX != null) arrowEl.style.left = `${arrowX}px`;
		if (arrowY != null) arrowEl.style.top = `${arrowY}px`;
	}

	return {
		x: result.x,
		y: result.y,
		placement: result.placement,
		arrowX,
		arrowY,
	};
}

/**
 * Apply position and start auto-update loop.
 * Returns a cleanup function to stop auto-updating.
 */
export function startAutoPosition(
	referenceEl: HTMLElement | Element,
	floatingEl: HTMLElement,
	options: PositionOptions = {}
): CleanupFn {
	const updateFn = () => void applyPosition(referenceEl, floatingEl, options);

	const cleanup = autoUpdate(
		referenceEl,
		floatingEl,
		updateFn,
		options.autoUpdateOptions
	);

	void applyPosition(referenceEl, floatingEl, options);

	return cleanup;
}

/**
 * Get the opposite placement (for arrow direction).
 */
export function getOppositePlacement(placement: Placement): string {
	const map: Record<string, string> = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left',
	};
	const side = placement.split('-')[0] ?? '';
	return map[side] ?? side;
}
