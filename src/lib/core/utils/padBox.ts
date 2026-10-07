import type { Rect } from "$lib/core/layouts/types";

/** `padding` as `[horizontal, vertical]`. */
export function paddingPair(padding: number | readonly [number, number]): readonly [number, number] {
  return typeof padding === "number" ? [padding, padding] : padding;
}

/** `box` grown by `padding` on every side. */
export function padBox(box: Rect, padding: number | readonly [number, number]): Rect {
  const [px, py] = paddingPair(padding);
  return {
    x: box.x - px,
    y: box.y - py,
    width: box.width + px * 2,
    height: box.height + py * 2,
  };
}
