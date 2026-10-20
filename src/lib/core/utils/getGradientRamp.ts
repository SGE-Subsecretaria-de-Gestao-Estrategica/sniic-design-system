import * as d3 from "d3";

export type GradientStops = { from: string; to: string };

/**
 * `count` colours evenly spaced along `colors`, first and last included —
 * the stops `getGradientRamp` builds its gradients from.
 */
export function getGradientStops(
  count: number,
  colors: readonly string[],
): string[] {
  if (count <= 0 || colors.length === 0) return [];
  if (count === 1) return [colors[0]];
  return d3.quantize(d3.interpolateRgbBasis([...colors]), count);
}

/**
 * Samples `colors` into `count` consecutive two-stop gradients, so that item
 * `i` flows into item `i + 1`. The first item is a solid color.
 */
export default function getGradientRamp(
  count: number,
  colors: readonly string[],
): GradientStops[] {
  if (count <= 0 || colors.length === 0) return [];
  const ramp = getGradientStops(count + 1, colors);
  return d3.range(count).map((i) =>
    i === 0
      ? { from: ramp[0], to: ramp[0] }
      : { from: ramp[i + 1], to: ramp[i] },
  );
}
