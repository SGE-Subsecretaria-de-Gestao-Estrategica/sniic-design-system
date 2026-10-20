// Pure helpers: every input is an argument, no defaults or config reads.

/** Width of each of `count` columns sharing `width` with `gap` between them. */
export function columnWidth(count: number, width: number, gap: number): number {
  return count === 0 ? 0 : Math.max(0, (width - gap * (count - 1)) / count);
}

/** The rows' band height that, under the headers, fills `height`: the inverse of the table's height. */
export function bandHeightFor(height: number, headerHeight: number): number {
  return Math.max(0, height - headerHeight);
}
