import * as d3 from "d3";
import type { SegmentScale } from "../segmentedAxis";
import type { XValue } from "../types";

// Pure helpers: every input is an argument, no defaults or config reads.

/**
 * Column centres, one list per segment. Columns are evenly spaced (they are
 * steps, not a time scale); each segment keeps half a plateau inside at both
 * ends, and consecutive segments are `breakWidth` apart, plateau edge to
 * plateau edge. Returns the step too, since the plateau is a share of it.
 */
export function columnPositions(
  counts: readonly number[],
  width: number,
  plateau: number,
  breakWidth: number,
): { xs: number[][]; step: number } {
  const breaks = Math.max(0, counts.length - 1);
  const units = d3.sum(counts, (n) => n - 1 + 2 * plateau);
  const usable = Math.max(0, width - breaks * breakWidth);
  if (units <= 0) {
    // One column without plateaus: the centre of the plot.
    return { xs: counts.map((n) => d3.range(n).map(() => width / 2)), step: 0 };
  }
  const step = usable / units;
  const half = step * plateau;
  let start = 0;
  const xs = counts.map((n) => {
    const segment = d3.range(n).map((i) => start + half + i * step);
    start += (n - 1) * step + 2 * half + breakWidth;
    return segment;
  });
  return { xs, step };
}

/**
 * A scale through every column of a segment: piecewise linear between
 * consecutive columns, so `GridColumns` and `Axis` land on them.
 */
export function columnScale(ticks: readonly XValue[], xs: readonly number[]): SegmentScale {
  // A continuous scale needs two stops; one column maps onto itself.
  const domain = ticks.length > 1 ? [...ticks] : [ticks[0], ticks[0]];
  const range = xs.length > 1 ? [...xs] : [xs[0], xs[0]];
  return domain[0] instanceof Date
    ? d3.scaleTime().domain(domain as Date[]).range(range)
    : d3.scaleLinear().domain(domain as number[]).range(range);
}

export type RibbonPoint = { x: number; y0: number; y1: number };

const ribbonArea = d3
  .area<RibbonPoint>()
  .x((p) => p.x)
  .y0((p) => p.y0)
  .y1((p) => p.y1)
  .curve(d3.curveBumpX);

/** Flat where two points share their band, one S-bend between plateaus. */
export function ribbonPath(points: readonly RibbonPoint[]): string {
  return ribbonArea([...points]) ?? "";
}

/**
 * Tops of label blocks, each `blocks[i]` tall and centred on its anchor
 * (top-to-bottom order), then pushed apart by at least `gap` and kept above
 * `bottom`.
 */
export function spreadBlocks(
  anchors: readonly number[],
  blocks: readonly number[],
  gap: number,
  bottom: number,
): number[] {
  const tops = anchors.map((a, i) => a - blocks[i] / 2);
  for (let i = 1; i < tops.length; i++) {
    tops[i] = Math.max(tops[i], tops[i - 1] + blocks[i - 1] + gap);
  }
  for (let i = tops.length - 1; i >= 0; i--) {
    const limit = i === tops.length - 1 ? bottom : tops[i + 1] - gap;
    tops[i] = Math.min(tops[i], limit - blocks[i]);
  }
  return tops;
}

export type Band = { y0: number; y1: number };

/**
 * How far into a bend a text box between `top` and `bottom` stays clear:
 * inside its own band and out of every other one. Every edge of a bend moves
 * on the same `curveBumpX` easing, so each edge is `start + (end - start) · s`
 * for the same share `s` of the move; the answer is the largest such `s`,
 * up to `cap` (half the bend leaves the other half to the next column's
 * value). `own` and each of `others` are a ribbon's band at the start and at
 * the end of the bend.
 */
export function clearShare(
  own: readonly [Band, Band],
  others: readonly (readonly [Band, Band])[],
  top: number,
  bottom: number,
  cap = 0.5,
): number {
  if (top < own[0].y0 || bottom > own[0].y1) return 0;
  let share = cap;
  // Own edges: the top must stay above the box, the bottom below it.
  const dTop = own[1].y0 - own[0].y0;
  if (dTop > 0) share = Math.min(share, (top - own[0].y0) / dTop);
  const dBottom = own[1].y1 - own[0].y1;
  if (dBottom < 0) share = Math.min(share, (own[0].y1 - bottom) / -dBottom);
  // Another band overlaps the box once its top is above the box's bottom and its bottom below the box's top.
  for (const [from, to] of others) {
    if (from.y1 - from.y0 <= 0 && to.y1 - to.y0 <= 0) continue;
    let low = 0;
    let high = Infinity;
    const bound = (start: number, delta: number, limit: number, below: boolean) => {
      // `below`: needs start + delta·s < limit; otherwise > limit.
      if (delta === 0) {
        if (below ? start >= limit : start <= limit) high = -Infinity;
        return;
      }
      const at = (limit - start) / delta;
      if (below === delta > 0) high = Math.min(high, at);
      else low = Math.max(low, at);
    };
    bound(from.y0, to.y0 - from.y0, bottom, true);
    bound(from.y1, to.y1 - from.y1, top, false);
    if (low < high) share = Math.min(share, low);
  }
  return Math.max(0, share);
}

/** Horizontal distance into a `curveBumpX` bend of `length` at which a share of its vertical move is reached. */
export function bendReach(share: number, length: number): number {
  if (share <= 0 || length <= 0) return 0;
  // y follows 3t² − 2t³ and x follows 1.5·t(1 − t) + t³ along the curve's parameter.
  if (share >= 1) return length;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const t = (lo + hi) / 2;
    if (3 * t * t - 2 * t * t * t < share) lo = t;
    else hi = t;
  }
  const t = lo;
  return length * (1.5 * t * (1 - t) + t * t * t);
}

/** How far a value may run into a bend: sharing it with the next column's value, or alone in it. */
export type BendReach = { shared: number; alone: number };

/**
 * Where a value goes and how wide it may be, given which bends it has to
 * itself. Sharing both, it stays on its column; otherwise it centres on the
 * room it has, shifting towards the free bend (or, at the end of a segment,
 * inwards). `padding` comes off the width.
 */
export function placeValue(
  slot: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    labelFits: boolean;
    labelReach: { left: BendReach | null; right: BendReach | null };
  },
  alone: { left: boolean; right: boolean },
  padding: number,
): { x: number; y: number; room: number } {
  const y = (slot.y0 + slot.y1) / 2;
  if (!slot.labelFits) return { x: (slot.x0 + slot.x1) / 2, y, room: 0 };
  const { left, right } = slot.labelReach;
  const l = left && (alone.left ? left.alone : left.shared);
  const r = right && (alone.right ? right.alone : right.shared);
  const centred = left && right && !alone.left && !alone.right;
  const [start, end] = centred
    ? [slot.x0 - Math.min(l!, r!), slot.x1 + Math.min(l!, r!)]
    : [slot.x0 - (l ?? 0), slot.x1 + (r ?? 0)];
  return { x: (start + end) / 2, y, room: Math.max(0, end - start - padding) };
}
