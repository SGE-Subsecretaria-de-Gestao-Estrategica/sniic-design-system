import * as d3 from "d3";
import padExtent from "./padExtent";

export type DomainOptions = {
  /** Use this domain as is. */
  pinned?: readonly [number, number];
  /** Stretch the domain to include 0 (bars, stems). */
  includeZero?: boolean;
  /** Multiply both ends (room for labels past the largest value). */
  headroom?: number;
  /** Widen both ends by this share of the range. */
  padding?: number;
};

/**
 * A value domain: the pinned one, or the data extent, optionally zero-based,
 * scaled by `headroom` and padded. Empty data gives [0, 0].
 */
export default function resolveDomain(
  values: readonly number[],
  { pinned, includeZero, headroom, padding }: DomainOptions = {},
): [number, number] {
  if (pinned) return [pinned[0], pinned[1]];
  let [lo, hi] = (d3.extent(values) as [number, number] | [undefined, undefined]).map(
    (v) => v ?? 0,
  ) as [number, number];
  if (includeZero) [lo, hi] = [Math.min(0, lo), Math.max(0, hi)];
  if (headroom !== undefined) [lo, hi] = [lo * headroom, hi * headroom];
  return padding !== undefined ? padExtent([lo, hi], padding) : [lo, hi];
}
