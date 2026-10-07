import * as d3 from "d3";
import coerceNumber from "$lib/core/utils/coerceNumber";
import getScaleBandwidth from "$lib/core/utils/getScaleBandwidth";
import type { StringLike } from "$lib/types/Base";
import type { BarGroupLayoutConfig, BarGroupRow, BarScale } from "$lib/types/Bar";

export const BAR_GROUP_DEFAULTS = { groupPadding: 0.1 } as const;

/**
 * One group per category, a rect per key side by side within the category's
 * band, each growing from the zero line — so a negative value extends the
 * other way. The only function that reads the config.
 */
export function barGroupLayout<
  Datum,
  Key extends StringLike = string,
  XScale extends BarScale = BarScale,
  YScale extends BarScale = BarScale,
>(
  data: Datum[],
  config: BarGroupLayoutConfig<Datum, Key, XScale, YScale>,
): BarGroupRow<Key>[] {
  const { keys = [], category, color, horizontal = false } = config;
  const getValue =
    config.value ??
    ((d: Datum, key: Key) => Number((d as Record<string, unknown>)[String(key)] ?? 0));

  // The band scale carries the categories; the other carries the values.
  const bandScale = horizontal ? config.yScale : config.xScale;
  const valueScale = horizontal ? config.xScale : config.yScale;

  const innerScale =
    config.groupScale ??
    d3
      .scaleBand<string>()
      .domain(keys.map(String))
      .range([0, getScaleBandwidth(bandScale)])
      .padding(config.groupPadding ?? BAR_GROUP_DEFAULTS.groupPadding);
  const thickness = innerScale.bandwidth();
  const baseline = coerceNumber(valueScale(0 as never)) ?? 0;

  return data.map((datum, index) => {
    const bandPos = coerceNumber(bandScale(category(datum) as never)) ?? 0;
    return {
      index,
      x0: horizontal ? 0 : bandPos,
      y0: horizontal ? bandPos : 0,
      bars: keys.map((key, keyIndex) => {
        const v = getValue(datum, key);
        const scaled = coerceNumber(valueScale(v as never)) ?? 0;
        const extent = Math.abs(scaled - baseline);
        const origin = Math.min(scaled, baseline);
        const withinGroup = innerScale(String(key)) ?? 0;
        return {
          key,
          index: keyIndex,
          x: horizontal ? origin : bandPos + withinGroup,
          y: horizontal ? bandPos + withinGroup : origin,
          width: horizontal ? extent : thickness,
          height: horizontal ? thickness : extent,
          color: color?.(key, keyIndex, keys),
          value: v,
        };
      }),
    };
  });
}
