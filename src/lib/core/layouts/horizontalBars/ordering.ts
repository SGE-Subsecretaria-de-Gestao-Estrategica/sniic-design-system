import * as d3 from "d3";
import orderKeys from "$lib/core/utils/orderKeys";
import type { Accessor } from "$lib/types/Accessor";
import type { HorizontalBarsEntry, SortOrder } from "./types";

/** Normalises data through the accessors, dropping non-finite values. */
export function toEntries<D>(
  data: D[],
  getCategory: Accessor<D, string>,
  getValue: Accessor<D, number>,
): HorizontalBarsEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    return Number.isFinite(value) ? [{ data: d, category: getCategory(d), value }] : [];
  });
}

/** By value (`sort`), then the explicit order (if any) on top of it. */
export function orderEntries<D>(
  entries: HorizontalBarsEntry<D>[],
  sort: SortOrder,
  explicitOrder?: readonly string[],
): HorizontalBarsEntry<D>[] {
  const byCategory = d3.index(entries, (e) => e.category);
  return orderKeys(
    entries.map((e) => e.category),
    (c) => byCategory.get(c)!.value,
    sort,
    explicitOrder,
  ).map((c) => byCategory.get(c)!);
}
