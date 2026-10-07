import * as d3 from "d3";
import type { AxisBreak, XValue } from "../types";
import type { AxisSegment, SegmentScale } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

/**
 * Splits `width` into one range per segment, proportional to each segment's
 * span, leaving `breakWidth` between consecutive segments.
 */
export function computeSegmentRanges(
  spans: number[],
  width: number,
  breakWidth: number,
): [number, number][] {
  const usable = width - Math.max(0, spans.length - 1) * breakWidth;
  const total = d3.sum(spans);
  let start = 0;
  return spans.map((span) => {
    const size = total > 0 ? (usable * span) / total : usable / spans.length;
    const range: [number, number] = [start, start + size];
    start += size + breakWidth;
    return range;
  });
}

export function createSegmentScale(
  domain: [XValue, XValue],
  range: [number, number],
): SegmentScale {
  return domain[0] instanceof Date
    ? d3.scaleTime().domain(domain as [Date, Date]).range(range)
    : d3.scaleLinear().domain(domain as [number, number]).range(range);
}

/** Index of the last segment starting at or before `x` (0 before the first). */
export function findSegment(segments: AxisSegment[], x: XValue) {
  return Math.max(0, segments.filter((s) => +s.domain[0] <= +x).length - 1);
}

export function breaksBetween(segments: AxisSegment[]): AxisBreak[] {
  return segments.slice(1).map((s, i) => ({
    index: i,
    x0: segments[i].range[1],
    x1: s.range[0],
  }));
}
