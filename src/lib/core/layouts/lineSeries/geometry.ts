import * as d3 from "d3";

// Pure helpers: every input is an argument, no defaults or config reads.
// (x-axis segments and scales live in `segmentedAxis`.)

/** Linear y scale for a plot of `height` whose top is at `top`. */
export function createYScale(
  domain: readonly [number, number],
  height: number,
  top = 0,
) {
  return d3.scaleLinear().domain(domain).range([top + height, top]);
}
