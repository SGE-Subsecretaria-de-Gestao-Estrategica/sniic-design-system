import { formatCompactNumber, formatLocale } from "$lib/core/format";
import type { NumberFormat } from "./types";

export const DEFAULT_FORMAT: NumberFormat = {
  decimals: null,
  compact: false,
  percent: false,
  prefix: "",
  suffix: "",
};

export const PERCENT_SUFFIX = "%";

/**
 * The change for switching `percent` on or off: turning it on puts "%" in an
 * empty suffix (the user may then edit it, e.g. to "pp"); turning it off
 * removes that "%" again.
 */
export function togglePercent(
  format: NumberFormat,
  percent: boolean,
): Partial<NumberFormat> {
  if (percent) return { percent, suffix: format.suffix || PERCENT_SUFFIX };
  return {
    percent,
    suffix: format.suffix === PERCENT_SUFFIX ? "" : format.suffix,
  };
}

/** pt-BR number formatter for value labels. */
export function createFormatter(
  format: NumberFormat,
): (value: number) => string {
  const { decimals, compact, percent, prefix, suffix } = format;
  const plain = formatLocale.format(decimals === null ? "," : `,.${decimals}f`);
  const number = compact
    ? (value: number) => formatCompactNumber(value, decimals ?? 0)
    : plain;
  const factor = percent ? 100 : 1;
  return (value) => `${prefix}${number(value * factor)}${suffix}`;
}
