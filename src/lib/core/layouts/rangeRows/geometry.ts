import * as d3 from "d3";
import type { RangeStrap } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

export function createValueScale(
  domain: readonly [number, number],
  width: number,
  insetStart: number,
  insetEnd: number,
) {
  return d3.scaleLinear().domain(domain).range([insetStart, width - insetEnd]);
}

/** Band between the min and max markers, centred on the row. */
export function strapBetween(x0: number, x1: number, cy: number, thickness: number): RangeStrap {
  return { x: x0, y: cy - thickness / 2, width: Math.max(0, x1 - x0), height: thickness };
}

/** Strap thickness: the marker's diameter minus an inset on each side. */
export function strapThickness(markerRadius: number, inset: number) {
  return Math.max(0, 2 * (markerRadius - inset));
}
