/**
 * Widens `[min, max]` by `ratio` of its range on both ends. A zero-width
 * extent is padded by `ratio` of its value (or by 1 when that is 0 too).
 */
export default function padExtent(
  extent: readonly [number, number],
  ratio: number,
): [number, number] {
  const pad = (extent[1] - extent[0]) * ratio || Math.abs(extent[0]) * ratio || 1;
  return [extent[0] - pad, extent[1] + pad];
}
