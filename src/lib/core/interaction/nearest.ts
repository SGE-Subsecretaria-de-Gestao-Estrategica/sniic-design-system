/**
 * Nearest-position lookup for hover layers.
 *
 * A crosshair should snap to the closest data position, not demand that the
 * reader land on the mark. These helpers take the already-projected pixel
 * positions so they work for any scale (time, band, linear) without the caller
 * handing over the scale itself.
 */

/**
 * Index of the position closest to `pointer`, or `null` when there is nothing
 * to snap to. Positions do not need to be sorted.
 */
export function nearestIndex(positions: number[], pointer: number): number | null {
	if (positions.length === 0) return null;

	let best = 0;
	let bestDistance = Math.abs(positions[0] - pointer);

	for (let i = 1; i < positions.length; i++) {
		const distance = Math.abs(positions[i] - pointer);
		if (distance < bestDistance) {
			best = i;
			bestDistance = distance;
		}
	}

	return best;
}

/**
 * Same as {@link nearestIndex}, but returns `null` when the pointer is further
 * than `maxDistance` pixels from every position. Use it for per-mark hovering
 * (bubbles, dots) where "nothing is hovered" is a valid state; a full-width
 * crosshair wants the unbounded version.
 */
export function nearestIndexWithin(
	positions: number[],
	pointer: number,
	maxDistance: number
): number | null {
	const index = nearestIndex(positions, pointer);
	if (index === null) return null;
	return Math.abs(positions[index] - pointer) <= maxDistance ? index : null;
}

/** Distance from a pointer to a point, for 2D nearest-mark lookups. */
export function distance(ax: number, ay: number, bx: number, by: number): number {
	return Math.hypot(ax - bx, ay - by);
}

/**
 * Index of the mark closest to a 2D pointer within `maxDistance` pixels.
 * Bubble and scatter layouts need this: their marks share x positions, so the
 * 1D lookup above cannot separate them.
 */
export function nearestPoint(
	points: { x: number; y: number }[],
	pointerX: number,
	pointerY: number,
	maxDistance = Infinity
): number | null {
	let best: number | null = null;
	let bestDistance = maxDistance;

	for (let i = 0; i < points.length; i++) {
		const d = distance(points[i].x, points[i].y, pointerX, pointerY);
		if (d <= bestDistance) {
			best = i;
			bestDistance = d;
		}
	}

	return best;
}
