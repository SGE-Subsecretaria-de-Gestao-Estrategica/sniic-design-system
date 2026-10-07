import type { FormatLocaleObject } from "d3";
import { formatLocale } from "../formatters";

export type ThresholdFormatterConfig = {
  /** d3-format specifier for regular values */
  specifier: string;
  /** d3-format specifier for values whose magnitude is below `smallThreshold` */
  smallSpecifier: string;
  smallThreshold: number;
};

/**
 * Returns a formatter that switches specifier by magnitude, e.g. to show one
 * decimal place only for small percentages.
 */
export function createThresholdFormatter(
  { specifier, smallSpecifier, smallThreshold }: ThresholdFormatterConfig,
  locale: FormatLocaleObject = formatLocale,
) {
  const regular = locale.format(specifier);
  const small = locale.format(smallSpecifier);
  return (value: number): string =>
    Math.abs(value) < smallThreshold ? small(value) : regular(value);
}
