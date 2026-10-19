import * as d3 from "d3";
import type { Accessor, XValue } from "../types";

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
