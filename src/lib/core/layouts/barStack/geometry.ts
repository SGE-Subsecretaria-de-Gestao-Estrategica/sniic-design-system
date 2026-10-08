import coerceNumber from "$lib/core/utils/coerceNumber";
import type { PositionScale, Rect } from "../types";

// Pure helpers: every input is an argument, no defaults or config reads.

/** Where a scale puts `value`, `0` when it has no position for it. */
export function scaled(scale: PositionScale, value: unknown): number {
  return (coerceNumber(scale(value)) as number | undefined) ?? 0;
}

/** A rect spanning `[start, end]` along the value axis and a band across it. */
export function barRect(
  horizontal: boolean,
  bandPos: number,
  thickness: number,
  start: number,
  end: number,
): Rect {
  // min/abs rather than end-start, so negative values render too.
  const origin = Math.min(start, end);
  const extent = Math.abs(end - start);
  return horizontal
    ? { x: origin, y: bandPos, width: extent, height: thickness }
    : { x: bandPos, y: origin, width: thickness, height: extent };
}
