import * as d3 from "d3";
import type { Accessor } from "../types";
import type { XValue } from "../types";

/** How many breaks `x` comes after (its raw segment number). */
export function countBreaksBefore(x: XValue, breaksAfter: readonly XValue[]) {
  return breaksAfter.filter((b) => +x > +b).length;
}

/**
 * The distinct, finite x values of the data, grouped by raw segment number
 * and sorted; segments without values are dropped.
 */
export function valuesBySegment<D>(
  data: D[],
  getX: Accessor<D, XValue>,
  breaksAfter: readonly XValue[],
): XValue[][] {
  const xs = data.map(getX).filter((x) => Number.isFinite(+x));
  const grouped = d3.group(xs, (x) => countBreaksBefore(x, breaksAfter));
  return d3.sort([...grouped.keys()]).map((i) => {
    const unique = d3.rollup(grouped.get(i)!, (v) => v[0], (x) => +x);
    return d3.sort([...unique.values()], (x) => +x);
  });
}
