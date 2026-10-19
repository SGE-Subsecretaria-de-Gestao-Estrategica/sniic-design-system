import * as d3 from "d3";
import padExtent from "./padExtent";

export type DomainOptions = {
  /**
   * Use these ends as is. An `undefined` end is derived from the data (and
   * padded) as if nothing were pinned.
   */
  pinned?: readonly [number | undefined, number | undefined];
  /** Stretch the domain to include 0 (bars, stems). */
  includeZero?: boolean;
  /** Multiply both ends (room for labels past the largest value). */
  headroom?: number;
  /** Widen both ends by this share of the range. */
  padding?: number;
};

/**
 * A value domain: the data extent, optionally zero-based, scaled by
 * `headroom` and padded, with any pinned end taking the place of the derived
 * one. Empty data gives [0, 0].
 */
export default function resolveDomain(
  values: readonly number[],
  { pinned, includeZero, headroom, padding }: DomainOptions = {},
): [number, number] {
  const [pinnedLo, pinnedHi] = pinned ?? [];
  if (pinnedLo !== undefined && pinnedHi !== undefined) return [pinnedLo, pinnedHi];
  let [lo, hi] = (d3.extent(values) as [number, number] | [undefined, undefined]).map(
    (v) => v ?? 0,
  ) as [number, number];
  if (includeZero) [lo, hi] = [Math.min(0, lo), Math.max(0, hi)];
  if (headroom !== undefined) [lo, hi] = [lo * headroom, hi * headroom];
  if (padding !== undefined) [lo, hi] = padExtent([lo, hi], padding);
  return [pinnedLo ?? lo, pinnedHi ?? hi];
}
