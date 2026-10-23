import orderKeys from "$lib/core/utils/orderKeys";
import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import type { Accessor, SortOrder } from "../types";
import type { CoverageDotsEntry } from "./types";

/** Normalises data through the accessors, dropping non-finite values. */
export function toEntries<D>(
  data: D[],
  getCategory: Accessor<D, string>,
  getValue: Accessor<D, number>,
  getGroup?: Accessor<D, string>,
): CoverageDotsEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    return Number.isFinite(value)
      ? [{ data: d, category: getCategory(d), group: getGroup ? getGroup(d) : "", value }]
      : [];
  });
}

/**
 * Entries split into blocks — in the data's order, `groupOrder` first — and
 * each block's rows ordered by value (`sort`), `categoryOrder` first.
 */
export function orderBlocks<D>(
  entries: CoverageDotsEntry<D>[],
  sort: SortOrder,
  categoryOrder?: readonly string[],
  groupOrder?: readonly string[],
): { group: string; rows: CoverageDotsEntry<D>[] }[] {
  const groups = [...new Set(entries.map((e) => e.group))];
  const ordered = groupOrder ? applyExplicitOrder(groups, groupOrder) : groups;

  return ordered.map((group) => {
    // One row per category: a repeated one keeps its last value.
    const byCategory = new Map(
      entries.filter((e) => e.group === group).map((e) => [e.category, e]),
    );
    const categories = orderKeys(
      [...byCategory.keys()],
      (c) => byCategory.get(c)?.value,
      sort,
      categoryOrder,
    );
    return { group, rows: categories.map((c) => byCategory.get(c)!) };
  });
}
