import rangeSpan from "$lib/core/utils/rangeSpan";
import { resolveSpacing } from "./defaults";
import { barFromBaseline, createGroupScale, scaled } from "./geometry";
import type { BarGroupItem, BarGroupLayout, BarGroupLayoutConfig } from "./types";

/**
 * One group per category, a rect per key side by side within the category's
 * band, each growing from the zero line — so a negative value extends the
 * other way. The only function that reads the config.
 */
export function barGroupLayout<D, K extends string = string>(
  data: D[],
  config: BarGroupLayoutConfig<D, K>,
): BarGroupLayout<D, K> {
  const spacing = resolveSpacing(config);
  const { keys, getCategory, horizontal = false } = config;
  const getValue =
    config.getValue ?? ((d: D, key: K) => Number((d as Record<string, unknown>)[key] ?? 0));

  // The band scale carries the categories; the other carries the values.
  const bandScale = horizontal ? config.yScale : config.xScale;
  const valueScale = horizontal ? config.xScale : config.yScale;

  const groupScale =
    config.groupScale ?? createGroupScale(keys, bandScale.bandwidth?.() ?? 0, spacing.groupPadding);
  const thickness = groupScale.bandwidth();
  const baseline = scaled(valueScale, 0);

  return {
    width: rangeSpan(config.xScale),
    height: rangeSpan(config.yScale),
    groups: data.map((datum, index): BarGroupItem<D, K> => {
      const category = getCategory(datum);
      const bandPos = scaled(bandScale, category);
      return {
        key: category,
        index,
        data: datum,
        category,
        x0: horizontal ? 0 : bandPos,
        y0: horizontal ? bandPos : 0,
        bars: keys.map((series, keyIndex) => {
          const value = getValue(datum, series);
          return {
            key: `${category}:${series}`,
            index: keyIndex,
            data: datum,
            series,
            category,
            value,
            ...barFromBaseline(
              horizontal,
              bandPos + (groupScale(series) ?? 0),
              thickness,
              baseline,
              scaled(valueScale, value),
            ),
          };
        }),
      };
    }),
  };
}
