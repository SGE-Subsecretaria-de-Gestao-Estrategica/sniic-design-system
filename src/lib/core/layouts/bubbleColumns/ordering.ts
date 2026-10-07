import * as d3 from "d3";
import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import orderKeys from "$lib/core/utils/orderKeys";
import type { BubbleColumnsEntry } from "./types";

type Entry = Pick<BubbleColumnsEntry<unknown>, "group" | "category" | "value">;

const unique = <T>(values: T[]): T[] => [...new Set(values)];

/**
 * Categories by the main group's value (descending); categories the main
 * group lacks keep their data order after it. Explicit order on top.
 */
export function orderCategories(
  entries: Entry[],
  mainGroup: string,
  explicitOrder?: readonly string[],
): string[] {
  const inGroup = d3.index(
    entries.filter((e) => e.group === mainGroup),
    (e) => e.category,
  );
  if (!inGroup.size) {
    throw new Error(`bubbleColumnsLayout: main group "${mainGroup}" not found in data`);
  }
  return orderKeys(
    unique(entries.map((e) => e.category)),
    (c) => inGroup.get(c)?.value,
    "descending",
    explicitOrder,
  );
}

export function orderGroups(
  entries: Entry[],
  mainGroup: string,
  explicitOrder?: readonly string[],
): string[] {
  const present = unique(entries.map((e) => e.group));
  if (explicitOrder) return explicitOrder.filter((g) => present.includes(g));
  return applyExplicitOrder(present, [mainGroup]);
}
