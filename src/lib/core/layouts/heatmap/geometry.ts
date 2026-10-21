import * as d3 from "d3";

// Pure helpers: every input is an argument, no defaults or config reads.

/** `count` equal bands filling `length`, `gap` between neighbours. */
export function bandSize(length: number, count: number, gap: number): number {
  if (count <= 0) return 0;
  return Math.max(0, (length - gap * (count - 1)) / count);
}

/** A quantize scale cutting `domain` into `steps` steps (0 = lowest). */
export function createStepScale(domain: readonly [number, number], steps: number) {
  return d3
    .scaleQuantize<number>()
    .domain([domain[0], domain[1]])
    .range(d3.range(steps));
}

/** `value` on [0, 1] over `domain`; 0 when the domain is a single value. */
export function normalise(value: number, [min, max]: readonly [number, number]) {
  return max === min ? 0 : (value - min) / (max - min);
}
