import { resolveSpacing } from "./defaults";
import {
  breaksBetween,
  computeSegmentRanges,
  createSegmentScale,
  findSegment,
} from "./geometry";
import { valuesBySegment } from "./ordering";
import type {
  AxisSegment,
  SegmentedAxis,
  SegmentedAxisLayoutConfig,
} from "./types";
import type { XValue } from "../types";

/**
 * A continuous x axis (dates or numbers), optionally broken into segments
 * (e.g. the RAIS methodology break). Each segment gets a width proportional
 * to its span and its own scale; the piecewise `xScale` maps any value.
 * Share it between stacked panels. The only function that reads the config.
 */
export function segmentedAxisLayout<D>(
  data: D[],
  config: SegmentedAxisLayoutConfig<D>,
): SegmentedAxis {
  const spacing = resolveSpacing(config);
  const values = valuesBySegment(data, config.getX, config.breaksAfter ?? []);
  const ranges = computeSegmentRanges(
    values.map((v) => +v[v.length - 1] - +v[0]),
    config.width,
    config.width * spacing.breakWidthRatio,
  );

  const segments: AxisSegment[] = values.map((ticks, index) => {
    const domain: [XValue, XValue] = [ticks[0], ticks[ticks.length - 1]];
    return { index, domain, range: ranges[index], scale: createSegmentScale(domain, ranges[index]), ticks };
  });

  const segmentOf = (x: XValue) => findSegment(segments, x);

  return {
    segments,
    breaks: breaksBetween(segments),
    xScale: (x) => (segments.length ? segments[segmentOf(x)].scale(x as never) : 0),
    segmentOf,
    width: config.width,
  };
}
