import resolveDomain from "$lib/core/utils/resolveDomain";
import { bandRows } from "../bandRows";
import { placeLeft, placeRight } from "../labels";
import { resolveSpacing } from "./defaults";
import { createValueScale, placeEndMarker, roundedEndClipPath } from "./geometry";
import { orderEntries, toEntries } from "./ordering";
import type {
  HorizontalBar,
  HorizontalBarsLayout,
  HorizontalBarsLayoutConfig,
} from "./types";

/**
 * Horizontal bars with a right-rounded end, an end marker and value /
 * category label positions. The only function that reads the config.
 */
export function horizontalBarsLayout<D>(
  data: D[],
  config: HorizontalBarsLayoutConfig<D>,
): HorizontalBarsLayout<D> {
  const spacing = resolveSpacing(config);
  const thickness = spacing.barThickness;
  const radius = config.cornerRadius ?? thickness / 2;
  const overhang = thickness * spacing.clipOverhangRatio;

  const entries = orderEntries(
    toEntries(data, config.getCategory, config.getValue),
    config.sort ?? "descending",
    config.categoryOrder,
  );

  const valueScale = createValueScale(
    resolveDomain(entries.map((e) => e.value), {
      pinned: config.maxValue !== undefined ? [0, config.maxValue] : undefined,
      includeZero: true,
      headroom: spacing.valueHeadroom,
    }),
    config.width,
  );
  const band = bandRows(entries.length, { thickness, gapRatio: spacing.barGapRatio });
  const height = band.height;

  const bars = entries.map((entry, index): HorizontalBar<D> => {
    const { y, cy } = band.rows[index];
    const length = valueScale(entry.value);
    return {
      ...entry,
      key: entry.category,
      index,
      y,
      cy,
      length,
      thickness,
      clipPath: roundedEndClipPath(y, length, thickness, radius, overhang),
      marker: placeEndMarker(length, cy, thickness, spacing.markerInset),
      valueLabel: placeRight({ x: length, y: cy }, spacing.valueLabelGap, 0, "middle"),
      categoryLabel: placeLeft({ x: 0, y: cy }, spacing.categoryLabelGap),
    };
  });

  return {
    bars,
    width: config.width,
    height,
    valueScale,
    baseline: { from: { x: 0, y: 0 }, to: { x: 0, y: height } },
  };
}
