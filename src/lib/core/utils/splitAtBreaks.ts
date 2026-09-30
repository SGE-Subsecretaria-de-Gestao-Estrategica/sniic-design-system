/**
 * Splits items sorted by x into runs, cutting wherever an axis break falls
 * between two consecutive items. `breaks` are pixel positions (`x0`, the
 * right edge of the segment before each break).
 */
export default function splitAtBreaks<T extends { x: number }>(
  items: readonly T[],
  breaks: readonly { x0: number }[],
): T[][] {
  const runs: T[][] = [];
  let current: T[] = [];
  items.forEach((item, i) => {
    const prev = items[i - 1];
    const crossesBreak =
      prev !== undefined && breaks.some((b) => prev.x <= b.x0 && item.x > b.x0);
    if (crossesBreak) {
      runs.push(current);
      current = [];
    }
    current.push(item);
  });
  if (current.length) runs.push(current);
  return runs;
}
