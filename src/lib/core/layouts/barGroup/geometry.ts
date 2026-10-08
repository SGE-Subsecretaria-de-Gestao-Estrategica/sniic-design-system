import * as d3 from "d3";
import coerceNumber from "$lib/core/utils/coerceNumber";
import type { PositionScale, Rect } from "../types";

// Pure helpers: every input is an argument, no defaults or config reads.

/** Where a scale puts `value`, `0` when it has no position for it. */
export function scaled(scale: PositionScale, value: unknown): number {
  return (coerceNumber(scale(value)) as number | undefined) ?? 0;
}

/** Splits one category's band among the series keys. */
export function createGroupScale(keys: readonly string[], bandwidth: number, padding: number) {
  return d3.scaleBand<string>().domain(keys).range([0, bandwidth]).padding(padding);
}

/** A rect growing from the baseline to `end` along the value axis, so a negative value extends the other way. */
export function barFromBaseline(
  horizontal: boolean,
  bandPos: number,
  thickness: number,
  baseline: number,
  end: number,
): Rect {
  const origin = Math.min(baseline, end);
  const extent = Math.abs(end - baseline);
  return horizontal
    ? { x: origin, y: bandPos, width: extent, height: thickness }
    : { x: bandPos, y: origin, width: thickness, height: extent };
}
