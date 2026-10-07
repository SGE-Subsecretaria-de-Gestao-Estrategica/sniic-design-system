import * as d3 from "d3";
import type {
  AxisExtent,
  BubbleColumnsEntry,
  CellLookup,
} from "./types";

export function createRadiusScale(maxRadius: number) {
  return d3.scaleSqrt().domain([0, 1]).range([0, maxRadius]);
}

export function createCellLookup<D>(entries: BubbleColumnsEntry<D>[]): CellLookup<D> {
  const index = d3.index(entries, (e) => e.group, (e) => e.category);
  return (group, category) => index.get(group)?.get(category);
}

export function radiusAt<D>(cell: CellLookup<D>, group: string, category: string) {
  return cell(group, category)?.radius ?? 0;
}

export function maxRadiusInRow<D>(
  groups: string[],
  category: string | undefined,
  cell: CellLookup<D>,
) {
  if (category === undefined) return 0;
  return d3.max(groups, (g) => radiusAt(cell, g, category)) ?? 0;
}

export function computeRowPositions(count: number, step: number): number[] {
  return d3.range(count).map((i) => i * step);
}

export function computeColumnPositions(count: number, halfWidth: number, gap: number) {
  const xs = d3.range(count).map((i) => halfWidth + i * (2 * halfWidth + gap));
  const width = count * 2 * halfWidth + Math.max(0, count - 1) * gap;
  return { xs, width };
}

export function computeAxisExtent(
  firstRadius: number,
  lastRadius: number,
  lastRowY: number,
  overhang: number,
): AxisExtent {
  return {
    top: -(firstRadius + overhang),
    bottom: lastRowY + lastRadius + overhang,
  };
}

/** Small bubbles can't hold their label: it goes under them. */
export function isLabelOutside(radius: number, smallRadiusThreshold: number) {
  return radius <= smallRadiusThreshold;
}
