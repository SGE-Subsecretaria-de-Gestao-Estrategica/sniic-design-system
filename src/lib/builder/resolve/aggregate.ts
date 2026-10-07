import type { CellValue, Row } from "../data/types";
import type { Aggregation } from "../spec/types";

const keyOf = (value: CellValue) =>
  value instanceof Date ? `d:${+value}` : `${typeof value}:${value}`;

const COMBINE: Record<Aggregation, (values: number[]) => number> = {
  sum: (values) => values.reduce((a, b) => a + b, 0),
  mean: (values) => values.reduce((a, b) => a + b, 0) / values.length,
  count: (values) => values.length,
  first: (values) => values[0],
};

/**
 * Combines rows that share the same values in `keys`, applying `how` to each
 * column in `measures`. Other columns keep the first row's value. `combined`
 * counts the rows merged away.
 */
export function aggregateRows(
  rows: readonly Row[],
  keys: readonly string[],
  measures: readonly string[],
  how: Aggregation,
): { rows: Row[]; combined: number } {
  if (!keys.length) return { rows: [...rows], combined: 0 };

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = keys.map((k) => keyOf(row[k])).join("|");
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }
  if (groups.size === rows.length) return { rows: [...rows], combined: 0 };

  const combine = COMBINE[how];
  const result = [...groups.values()].map((group) => {
    if (group.length === 1) return group[0];
    const row = { ...group[0] };
    for (const measure of measures) {
      row[measure] = combine(group.map((r) => r[measure] as number));
    }
    return row;
  });
  return { rows: result, combined: rows.length - result.length };
}
