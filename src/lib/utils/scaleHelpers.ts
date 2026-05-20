import type { ScaleLinear } from 'd3';

/**
 * Returns grid-line positions from a linear scale's tick values.
 */
export function gridPositions(
	scale: ScaleLinear<number, number>,
	count = 5,
): number[] {
	return scale.ticks(count).map((v) => scale(v));
}

/**
 * Returns Y-axis tick objects from a linear scale.
 */
export function yLinearTicks(
	scale: ScaleLinear<number, number>,
	count = 5,
	format?: (v: number) => string | number,
): Array<{ value: string | number; y: number }> {
	const fmt = format ?? ((v: number) => v);
	return scale.ticks(count).map((v) => ({ value: fmt(v), y: scale(v) }));
}

/**
 * Returns X-axis tick objects from a linear scale.
 */
export function xLinearTicks(
	scale: ScaleLinear<number, number>,
	count = 5,
	format?: (v: number) => string | number,
): Array<{ value: string | number; x: number }> {
	const fmt = format ?? ((v: number) => v);
	return scale.ticks(count).map((v) => ({ value: fmt(v), x: scale(v) }));
}

/**
 * Computes height and innerHeight for data-driven row-based layouts
 * (e.g. horizontal bar charts where each row has a fixed height).
 */
export function computeDynamicHeight(
	dataLength: number,
	rowHeight: number,
	margin: { top: number; bottom: number },
): { height: number; innerHeight: number } {
	const innerHeight = dataLength * rowHeight;
	return {
		height: innerHeight + margin.top + margin.bottom,
		innerHeight,
	};
}
