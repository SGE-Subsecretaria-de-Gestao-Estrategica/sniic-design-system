import * as d3 from "d3";

// Pure helpers: every input is an argument, no defaults or config reads.
// (x-axis segments and scales live in `segmentedAxis`.)

export function createYScale(domain: readonly [number, number], height: number) {
  return d3.scaleLinear().domain(domain).range([height, 0]);
}
