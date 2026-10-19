import * as d3 from "d3";
import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import type { Accessor, XValue } from "../types";
import type { RankDirection } from "./types";

/** Series keys: `order` first (those present in the data), then the rest as they first appear. */
export function seriesKeys<D>(
  data: readonly D[],
  getSeries: Accessor<D, string>,
  order: readonly string[] = [],
): string[] {
  const present = [...new Set(data.map(getSeries))];
  return [...order.filter((k) => present.includes(k)), ...present.filter((k) => !order.includes(k))];
}

/** The row of each series at each x, by `+x`. A repeated pair keeps its first row. */
export function rowsByColumn<D>(
  data: readonly D[],
  getX: Accessor<D, XValue>,
  getSeries: Accessor<D, string>,
): Map<number, Map<string, D>> {
  return d3.rollup(
    data,
    (rows) => rows[0],
    (d) => +getX(d),
    getSeries,
  );
}

/** The fixed stack, top to bottom: `order` first (those in `series`), then series order. */
export function fixedStackOrder(
  series: readonly string[],
  order: readonly string[] = [],
): string[] {
  return applyExplicitOrder(series, order);
}

type StackEntry = { series: string; seriesIndex: number; value: number };

/**
 * One column's stack, top to bottom. Ranked (`direction` set), by value,
 * a tie keeping the earlier series higher; not ranked (`null`), in
 * `fixedOrder`.
 */
export function stackColumn<E extends StackEntry>(
  entries: readonly E[],
  direction: RankDirection | null,
  fixedOrder: readonly string[],
): E[] {
  if (!direction) {
    const position = new Map(fixedOrder.map((s, i) => [s, i]));
    const at = (e: E) => position.get(e.series) ?? Infinity;
    return [...entries].sort((a, b) => at(a) - at(b));
  }
  const sign = direction === "largestOnTop" ? -1 : 1;
  return [...entries].sort(
    (a, b) => sign * (a.value - b.value) || a.seriesIndex - b.seriesIndex,
  );
}
