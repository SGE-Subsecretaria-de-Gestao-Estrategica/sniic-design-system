import type { CellValue, Row } from "../data/types";
import type { Filter } from "../spec/types";

/** A cell as a filter sees it: its text, `""` when empty. */
export function filterValue(value: CellValue | undefined): string {
  if (value === null || value === undefined) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

/** The distinct values of `column`, in the order they first appear. */
export function filterValues(rows: readonly Row[], column: string): string[] {
  return [...new Set(rows.map((row) => filterValue(row[column])))];
}

/** The rows every filter keeps, and how many were left out. */
export function filterRows(
  rows: readonly Row[],
  filters: readonly Filter[],
): { rows: Row[]; filtered: number } {
  const active = filters
    .filter((f) => f.exclude.length)
    .map((f) => ({ column: f.column, exclude: new Set(f.exclude) }));
  if (!active.length) return { rows: [...rows], filtered: 0 };
  const kept = rows.filter((row) =>
    active.every((f) => !f.exclude.has(filterValue(row[f.column]))),
  );
  return { rows: kept, filtered: rows.length - kept.length };
}
