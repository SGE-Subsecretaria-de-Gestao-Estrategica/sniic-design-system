import * as d3 from "d3";
import { breakGlyph, type BreakGlyph } from "../breakGlyph";
import type { LineSegment } from "../types";
import type { CoverageDotsSpacing } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

/**
 * The value domain around the data (and the reference), padded and rounded
 * to the scale's ticks. It reaches zero only when the padded data does: the
 * point of the chart is to tell apart values that all sit near the top.
 * A pinned end replaces the derived one as is.
 */
export function coverageDomain(
  values: readonly number[],
  reference: number | undefined,
  paddingRatio: number,
  tickCount: number,
  pinned: readonly [number | undefined, number | undefined] = [undefined, undefined],
): [number, number] {
  const all = reference === undefined ? values : [...values, reference];
  if (!all.length) return [pinned[0] ?? 0, pinned[1] ?? 1];

  const [min, max] = d3.extent(all) as [number, number];
  const span = max - min || Math.abs(max) * 0.1 || 1;
  let lo = min - span * paddingRatio;
  let hi = max + span * paddingRatio;
  if (min >= 0 && lo < 0) lo = 0;

  [lo, hi] = d3.scaleLinear().domain([lo, hi]).nice(tickCount).domain() as [number, number];
  if (min >= 0 && lo < 0) lo = 0;

  const [pinnedLo, pinnedHi] = pinned;
  return [pinnedLo ?? lo, pinnedHi ?? hi];
}

/**
 * The torn-axis mark at the start of an axis that doesn't reach zero: the
 * chevron sits on the axis line, its left stub at x = 0. Only the segments
 * are used — the rotated label is the time axis's, not this one's.
 */
export function startBreak(axisY: number, size: number): BreakGlyph {
  return breakGlyph(size * 1.7, axisY + size * 0.7, size);
}

/** The axis line, starting where the break mark ends when there is one. */
export function axisLine(axisY: number, width: number, mark: BreakGlyph | null): LineSegment {
  const start = mark ? Math.max(...mark.segments.map((s) => Math.max(s.from.x, s.to.x))) : 0;
  return { from: { x: start, y: axisY }, to: { x: width, y: axisY } };
}

/**
 * The row thickness that makes the layout exactly `height` tall: the inverse
 * of the layout's stacking. Rows, the gaps between them and the gap under the
 * last one scale with the thickness; headers, block gaps, the reference's
 * label and the axis don't. `undefined` without rows.
 */
export function rowThicknessFor(
  height: number,
  counts: { rows: number; blocks: number; named: boolean; reference: boolean },
  spacing: Pick<
    CoverageDotsSpacing,
    "rowGapRatio" | "headerHeight" | "blockGap" | "referenceLabelHeight" | "axisHeight"
  >,
): number | undefined {
  if (counts.rows === 0) return undefined;
  const fixed =
    (counts.reference ? spacing.referenceLabelHeight : 0) +
    (counts.named ? counts.blocks * spacing.headerHeight : 0) +
    Math.max(0, counts.blocks - 1) * spacing.blockGap +
    spacing.axisHeight;
  return Math.max(0, (height - fixed) / (counts.rows * (1 + spacing.rowGapRatio)));
}
