import * as d3 from "d3";
import type { SortOrder } from "$lib/core/layouts/types";
import applyExplicitOrder from "./applyExplicitOrder";

/**
 * Orders `keys` by `valueOf` (stable; keys without a value keep their order
 * after the ranked ones), then puts `explicitOrder` on top.
 */
export default function orderKeys<K>(
  keys: readonly K[],
  valueOf: (key: K) => number | undefined,
  sort: SortOrder,
  explicitOrder?: readonly K[],
): K[] {
  let ordered = [...keys];
  if (sort !== "none") {
    const compare = sort === "descending" ? d3.descending : d3.ascending;
    const ranked = ordered.filter((k) => valueOf(k) !== undefined);
    const unranked = ordered.filter((k) => valueOf(k) === undefined);
    ordered = [...d3.sort(ranked, (a, b) => compare(valueOf(a)!, valueOf(b)!)), ...unranked];
  }
  return explicitOrder ? applyExplicitOrder(ordered, explicitOrder) : ordered;
}
