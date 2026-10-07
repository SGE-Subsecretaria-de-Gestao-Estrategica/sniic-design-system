import resolveDomain from "$lib/core/utils/resolveDomain";
import { bandRows } from "../bandRows";
import { placeLeft, placeOnSide, placeRight } from "../labels";
import { resolveSpacing } from "./defaults";
import { createValueScale, strapBetween, strapThickness } from "./geometry";
import { groupRows, orderCategories, toEntries, uniqueGroups } from "./ordering";
import type {
  RangeMarker,
  RangeRow,
  RangeRowsLayout,
  RangeRowsLayoutConfig,
  RangeRowsSpacing,
  RangeRowsEntry,
} from "./types";

function placeMarkers<D>(
  entries: RangeRowsEntry<D>[],
  cy: number,
  x: (value: number) => number,
  spacing: RangeRowsSpacing,
): RangeMarker<D>[] {
  const r = spacing.markerRadius;
  const gap = r + spacing.valueLabelGap;
  return entries.map((entry, i) => {
    const isMin = i === 0;
    const isMax = i === entries.length - 1;
    const centre = { x: x(entry.value), y: cy };
    return {
      ...entry,
      key: `${entry.category}::${entry.group}`,
      index: i,
      ...centre,
      radius: r,
      isMin,
      isMax,
      label: isMax
        ? placeRight(centre, gap, 0, "middle")
        : isMin
          ? placeLeft(centre, gap)
          : placeOnSide(centre, "above", gap),
    };
  });
}

/**
 * One row per category with a marker per group on a shared value axis, a
 * strap from the smallest to the largest value (dumbbell / range plot), value
 * and category labels and a gridline. The only function that reads the config.
 */
export function rangeRowsLayout<D>(
  data: D[],
  config: RangeRowsLayoutConfig<D>,
): RangeRowsLayout<D> {
  const spacing = resolveSpacing(config);
  const entries = toEntries(data, config.getCategory, config.getGroup, config.getValue);

  const byCategory = groupRows(entries);
  const categories = orderCategories(byCategory, config.sort ?? "descending", config.categoryOrder);

  const valueScale = createValueScale(
    resolveDomain(entries.map((e) => e.value), {
      pinned: config.valueDomain,
      padding: spacing.domainPaddingRatio,
    }),
    config.width,
    spacing.insetStart,
    spacing.insetEnd,
  );

  const band = bandRows(categories.length, {
    thickness: spacing.rowThickness,
    gapRatio: spacing.rowGapRatio,
  });
  const strapHeight = strapThickness(spacing.markerRadius, spacing.strapInset);

  const rows = categories.map((category, index): RangeRow<D> => {
    const { y, cy } = band.rows[index];
    const markers = placeMarkers(byCategory.get(category)!, cy, valueScale, spacing);
    const min = markers[0];
    const max = markers[markers.length - 1];
    return {
      key: category,
      category,
      index,
      y,
      cy,
      markers,
      min,
      max,
      leader: max.group,
      spread: max.value - min.value,
      strap: strapBetween(min.x, max.x, cy, strapHeight),
      gridline: { from: { x: 0, y: cy }, to: { x: config.width, y: cy } },
      label: placeLeft({ x: 0, y: cy }, spacing.categoryLabelGap),
    };
  });

  return {
    rows,
    groups: uniqueGroups(entries),
    valueScale,
    width: config.width,
    height: band.height,
  };
}
