import * as d3 from "d3";
import type { Accessor } from "$lib/types/Accessor";
import type { XValue } from "../types";
import type { BubbleRowEntry } from "./types";

/** Normalises data through the accessors (dropping non-finite values), sorted by x. */
export function toEntries<D>(
  data: D[],
  getX: Accessor<D, XValue>,
  getValue: Accessor<D, number>,
): BubbleRowEntry<D>[] {
  const entries = data.flatMap((d) => {
    const xValue = getX(d);
    const value = getValue(d);
    if (!Number.isFinite(+xValue) || !Number.isFinite(value)) return [];
    return [{ data: d, xValue, value }];
  });
  return d3.sort(entries, (a, b) => d3.ascending(+a.xValue, +b.xValue));
}
