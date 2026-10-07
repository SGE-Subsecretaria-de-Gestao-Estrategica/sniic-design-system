import * as d3 from "d3";
import type { Accessor } from "$lib/types/Accessor";
import type { XValue } from "../types";
import type { DifferenceStemsEntry } from "./types";

/**
 * Pairs the two series by x and computes minuend − subtrahend, sorted by x.
 * An x missing either series (or with a non-finite value) is dropped.
 */
export function toEntries<D>(
  data: D[],
  getX: Accessor<D, XValue>,
  getSeries: Accessor<D, string>,
  getValue: Accessor<D, number>,
  minuend: string,
  subtrahend: string,
): DifferenceStemsEntry<D>[] {
  const byX = d3.group(data, (d) => +getX(d));
  const entries = [...byX.values()].flatMap((rows) => {
    const a = rows.find((d) => getSeries(d) === minuend);
    const b = rows.find((d) => getSeries(d) === subtrahend);
    if (!a || !b) return [];
    const value = getValue(a) - getValue(b);
    return Number.isFinite(value)
      ? [{ xValue: getX(a), data: { minuend: a, subtrahend: b }, value }]
      : [];
  });
  return d3.sort(entries, (e) => +e.xValue);
}
