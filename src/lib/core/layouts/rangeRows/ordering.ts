import * as d3 from "d3";
import orderKeys from "$lib/core/utils/orderKeys";
import type { Accessor } from "$lib/types/Accessor";
import type { SortOrder } from "../types";
import type { RangeRowsEntry } from "./types";

/** Normalises data through the accessors, dropping non-finite values. */
export function toEntries<D>(
  data: D[],
  getCategory: Accessor<D, string>,
  getGroup: Accessor<D, string>,
  getValue: Accessor<D, number>,
): RangeRowsEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    return Number.isFinite(value)
      ? [{ data: d, category: getCategory(d), group: getGroup(d), value }]
      : [];
  });
}

/** Entries grouped by category, each sorted by value (ascending). */
export function groupRows<D>(entries: RangeRowsEntry<D>[]) {
  return d3.rollup(
    entries,
    (v) => d3.sort(v, (a, b) => d3.ascending(a.value, b.value)),
    (e) => e.category,
  );
}

/** Categories by their largest value (`sort`), then the explicit order on top. */
export function orderCategories<D>(
  rows: Map<string, RangeRowsEntry<D>[]>,
  sort: SortOrder,
  explicitOrder?: readonly string[],
): string[] {
  return orderKeys([...rows.keys()], (c) => rows.get(c)!.at(-1)!.value, sort, explicitOrder);
}

export function uniqueGroups<D>(entries: RangeRowsEntry<D>[]): string[] {
  return [...new Set(entries.map((e) => e.group))];
}
