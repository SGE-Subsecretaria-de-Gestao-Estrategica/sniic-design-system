import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import type { Accessor } from "../types";
import type { HeatmapEntry } from "./types";

/** Normalises data through the accessors, dropping non-finite values. */
export function toEntries<D>(
  data: D[],
  getRow: Accessor<D, string>,
  getColumn: Accessor<D, string>,
  getValue: Accessor<D, number>,
): HeatmapEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    if (!Number.isFinite(value)) return [];
    return [{ data: d, row: getRow(d), column: getColumn(d), value }];
  });
}

/** Distinct keys in data order, the listed ones first. */
export function orderedKeys(
  keys: readonly string[],
  explicitOrder?: readonly string[],
): string[] {
  return applyExplicitOrder([...new Set(keys)], explicitOrder ?? []);
}

/**
 * The entry of each row × column pair, by `row\u0000column`. One datum per
 * pair: a repeated pair keeps the first (aggregate before).
 */
export function indexEntries<D>(
  entries: readonly HeatmapEntry<D>[],
): Map<string, HeatmapEntry<D>> {
  const byPair = new Map<string, HeatmapEntry<D>>();
  for (const entry of entries) {
    const pair = pairKey(entry.row, entry.column);
    if (!byPair.has(pair)) byPair.set(pair, entry);
  }
  return byPair;
}

export function pairKey(row: string, column: string): string {
  return `${row}\u0000${column}`;
}
