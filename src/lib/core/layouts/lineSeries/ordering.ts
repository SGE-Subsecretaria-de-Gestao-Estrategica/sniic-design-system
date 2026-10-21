import * as d3 from "d3";
import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import type { Accessor } from "../types";
import type { XValue } from "../types";
import type { LineSeriesEntry } from "./types";

/** Key used when no `getSeries` accessor is given. */
export const SINGLE_SERIES = "series";

/** Key of the one panel when no `getPanel` accessor is given. */
export const SINGLE_PANEL = "panel";

/** Normalises data through the accessors, dropping non-finite x or y. */
export function toEntries<D>(
  data: D[],
  getX: Accessor<D, XValue>,
  getY: Accessor<D, number>,
  getSeries?: Accessor<D, string>,
  getPanel?: Accessor<D, string>,
): LineSeriesEntry<D>[] {
  return data.flatMap((d) => {
    const xValue = getX(d);
    const yValue = getY(d);
    if (!Number.isFinite(+xValue) || !Number.isFinite(yValue)) return [];
    return [
      {
        data: d,
        series: getSeries?.(d) ?? SINGLE_SERIES,
        panel: getPanel?.(d) ?? SINGLE_PANEL,
        xValue,
        yValue,
      },
    ];
  });
}

/** Entries grouped by series (explicit order first) and sorted by x. */
export function groupSeries<D>(
  entries: LineSeriesEntry<D>[],
  explicitOrder?: readonly string[],
): [string, LineSeriesEntry<D>[]][] {
  const grouped = d3.group(entries, (e) => e.series);
  const keys = applyExplicitOrder([...grouped.keys()], explicitOrder ?? []);
  return keys.map((key) => [
    key,
    d3.sort(grouped.get(key)!, (a, b) => d3.ascending(+a.xValue, +b.xValue)),
  ]);
}

/**
 * Entries grouped by panel (explicit order first, then data order). Without
 * panels there is always one group, even with no entries.
 */
export function groupPanels<D>(
  entries: LineSeriesEntry<D>[],
  paneled: boolean,
  explicitOrder?: readonly string[],
): [string, LineSeriesEntry<D>[]][] {
  if (!paneled) return [[SINGLE_PANEL, entries]];
  const grouped = d3.group(entries, (e) => e.panel);
  const keys = applyExplicitOrder([...grouped.keys()], explicitOrder ?? []);
  return keys.map((key) => [key, grouped.get(key)!]);
}
