import type { Accessor } from "../types";
import type { PartitionEntry } from "./types";

/**
 * Normalises data through the accessors, dropping non-finite and negative
 * values — a part of a whole can't be less than nothing. An empty subpart, or
 * one equal to its part, is the part itself.
 */
export function toEntries<D>(
  data: D[],
  getPart: Accessor<D, string>,
  getValue: Accessor<D, number>,
  getCategory?: Accessor<D, string>,
  getSubpart?: Accessor<D, string>,
): PartitionEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    if (!Number.isFinite(value) || value < 0) return [];
    const part = getPart(d);
    const sub = getSubpart?.(d)?.trim();
    return [
      {
        data: d,
        category: getCategory ? getCategory(d) : "",
        part,
        subpart: sub && sub !== part ? sub : null,
        value,
      },
    ];
  });
}

export type PartGroup<D> = {
  part: string;
  value: number;
  /** Subparts in first-seen order, each summed; empty when the part isn't broken down. */
  subparts: { label: string; value: number }[];
  entries: PartitionEntry<D>[];
};

/** Entries by category (first-seen order), then by part (first-seen order). */
export function groupRows<D>(entries: PartitionEntry<D>[]) {
  const rows = new Map<string, Map<string, PartGroup<D>>>();
  for (const entry of entries) {
    let parts = rows.get(entry.category);
    if (!parts) rows.set(entry.category, (parts = new Map()));
    let group = parts.get(entry.part);
    if (!group) parts.set(entry.part, (group = { part: entry.part, value: 0, subparts: [], entries: [] }));
    group.value += entry.value;
    group.entries.push(entry);
    if (entry.subpart !== null) {
      const sub = group.subparts.find((s) => s.label === entry.subpart);
      if (sub) sub.value += entry.value;
      else group.subparts.push({ label: entry.subpart, value: entry.value });
    }
  }
  return [...rows].map(([category, parts]) => ({ category, parts: [...parts.values()] }));
}

/** Every part across rows, in first-seen order. */
export function uniqueParts<D>(entries: PartitionEntry<D>[]): string[] {
  return [...new Set(entries.map((e) => e.part))];
}
