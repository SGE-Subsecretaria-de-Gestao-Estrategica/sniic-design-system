import type { XValue } from "$lib/core/layouts/types";
import { readToggle } from "./options";
import type { OptionDef } from "./types";
import type { JsonValue } from "../spec/types";

/** RAIS changed its methodology after this year: the series before and after aren't comparable. */
export const RAIS_BREAK_YEAR = 2021;

export const RAIS_BREAK_OPTION = {
  id: "raisBreak",
  label: `Quebra da série da RAIS (depois de ${RAIS_BREAK_YEAR})`,
  step: "style",
  kind: "toggle",
} as const satisfies OptionDef<never>;

/**
 * `breaksAfter` for a line layout while the option is on. Works for an x
 * axis of dates or of years as numbers; a side of the break without data
 * simply makes no segment.
 */
export function raisBreaksAfter<D>(
  options: Record<string, JsonValue>,
  rows: readonly D[],
  getX: (row: D) => XValue,
): XValue[] | undefined {
  if (!readToggle(options, RAIS_BREAK_OPTION.id) || !rows.length)
    return undefined;
  return [
    getX(rows[0]) instanceof Date
      ? new Date(RAIS_BREAK_YEAR, 11, 31)
      : RAIS_BREAK_YEAR,
  ];
}
