import type { LineSeriesPoint } from "$lib/core/layouts/lineSeries";
import type { SegmentedAxis } from "$lib/core/layouts/segmentedAxis";
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

export { tickLabeller } from "../../encoding/keys";
