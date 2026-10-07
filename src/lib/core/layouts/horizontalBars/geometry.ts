import * as d3 from "d3";
import { generateRoundedRect } from "$lib/core/utils/shapeFactory";
import type { HorizontalBarMarker } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

export function createValueScale(domain: readonly [number, number], width: number) {
  return d3.scaleLinear().domain(domain).range([0, width]);
}

/** Right-rounded shape extended `overhang` px left of the baseline. */
export function roundedEndClipPath(
  y: number,
  length: number,
  thickness: number,
  radius: number,
  overhang: number,
) {
  return generateRoundedRect(-overhang, y, length + overhang, thickness, "right", radius);
}

/** Circle sitting inside the bar's rounded end. */
export function placeEndMarker(
  length: number,
  cy: number,
  thickness: number,
  inset: number,
): HorizontalBarMarker {
  return {
    x: length - thickness / 2,
    y: cy,
    radius: Math.max(0, thickness / 2 - inset),
  };
}
