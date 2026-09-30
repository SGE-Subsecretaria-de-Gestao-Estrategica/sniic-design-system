import * as d3 from "d3";
import type { LineSegment } from "../types";

// Pure helpers: every input is an argument, no defaults or config reads.

/** Value → [0, 1] over `domain`, clamped; 0.5 when the domain is a single value. */
export function createNormalizer(domain: readonly [number, number]) {
  const scale = d3.scaleLinear().domain(domain).range([0, 1]).clamp(true);
  return (value: number) => (domain[0] === domain[1] ? 0.5 : scale(value));
}

/** Radius whose *area* grows linearly from `minRadius` to `maxRadius` with `t`. */
export function areaRadius(t: number, minRadius: number, maxRadius: number) {
  return Math.sqrt(minRadius ** 2 + t * (maxRadius ** 2 - minRadius ** 2));
}

/** A horizontal line through the first and last x of each run, and bridges between runs. */
export function connectRuns(runs: { x: number }[][], y: number) {
  const baseline: LineSegment[] = runs.map((run) => ({
    from: { x: run[0].x, y },
    to: { x: run[run.length - 1].x, y },
  }));
  const bridges: LineSegment[] = baseline.slice(1).map((segment, i) => ({
    from: baseline[i].to,
    to: segment.from,
  }));
  return { baseline, bridges };
}
