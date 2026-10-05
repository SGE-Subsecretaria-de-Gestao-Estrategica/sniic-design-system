import type { LineSeriesPoint } from "$lib/core/layouts/lineSeries";
import type { SegmentedAxis } from "$lib/core/layouts/segmentedAxis";
import * as d3 from "d3";
import type { XValue } from "$lib/core/layouts/types";
import {
  readChoice,
  VALUE_LABELS,
  type ValueLabels,
} from "../../registry/options";
import type { JsonValue } from "../../spec/types";

/** Radius of a line's last marker (the regular ones come from the theme). */
export const END_MARKER_SIZE = 8;

/** Whether the "valueLabels" option asks for a label on every point. */
export function showsAllValues(
  options: Record<string, JsonValue>,
  fallback: ValueLabels,
): boolean {
  return readChoice(options, "valueLabels", VALUE_LABELS, fallback) === "all";
}

/** `showValues` for `<LineSeries>`: every point, or only the ends of each segment. */
export function showsValue(
  options: Record<string, JsonValue>,
  fallback: ValueLabels,
) {
  const all = showsAllValues(options, fallback);
  return (point: LineSeriesPoint<unknown>) =>
    all || point.isSegmentStart || point.isSegmentEnd;
}

/**
 * Keys of the items that open or close a segment of `axis`: what a panel
 * under the line labels when the line labels only its segment ends.
 */
export function segmentEndKeys(
  items: readonly { key: string; xValue: XValue }[],
  axis: SegmentedAxis,
): Set<string> {
  const ends = new Map<
    number,
    { first: (typeof items)[number]; last: (typeof items)[number] }
  >();
  for (const item of items) {
    const segment = axis.segmentOf(item.xValue);
    const current = ends.get(segment);
    if (!current) ends.set(segment, { first: item, last: item });
    else {
      if (+item.xValue < +current.first.xValue) current.first = item;
      if (+item.xValue > +current.last.xValue) current.last = item;
    }
  }
  return new Set(
    [...ends.values()].flatMap(({ first, last }) => [first.key, last.key]),
  );
}

const YEAR = d3.timeFormat("%Y");
const MONTH = d3.timeFormat("%m/%Y");
const DAY = d3.timeFormat("%d/%m/%Y");

/**
 * Labels for the ticks of an x axis. Dates are written in numbers, as fine
 * as the ticks need (years, months or days), so no month or weekday name
 * shows up in English; numbers are written as they are (years).
 */
export function tickLabeller(
  ticks: readonly XValue[],
): (value: XValue) => string {
  const dates = ticks.filter((t): t is Date => t instanceof Date);
  if (!dates.length) return (value) => String(value);
  const format = dates.some((d) => d.getDate() !== 1)
    ? DAY
    : dates.some((d) => d.getMonth() !== 0)
      ? MONTH
      : YEAR;
  return (value) => (value instanceof Date ? format(value) : String(value));
}
