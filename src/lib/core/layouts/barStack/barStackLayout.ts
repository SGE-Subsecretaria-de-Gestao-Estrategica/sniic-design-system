import * as d3 from "d3";
import coerceNumber from "$lib/core/utils/coerceNumber";
import getScaleBandwidth from "$lib/core/utils/getScaleBandwidth";
import type { StringLike } from "$lib/types/Base";
import type { BarScale, BarStackLayoutConfig, BarStackSeries } from "$lib/types/Bar";

/**
 * One series per key, each a rect per category, stacked with `d3.stack`
 * along the value scale. The only function that reads the config.
 */
export function barStackLayout<
  Datum,
  Key extends StringLike = string,
  XScale extends BarScale = BarScale,
  YScale extends BarScale = BarScale,
>(
  data: Datum[],
  config: BarStackLayoutConfig<Datum, Key, XScale, YScale>,
): BarStackSeries<Key>[] {
  const { keys = [], category, value, color, horizontal = false, order, offset } = config;

  const stack = d3.stack<Datum, Key>().keys(keys);
  if (value) stack.value((d, key) => value(d, key));
  if (order) stack.order(order);
  if (offset) stack.offset(offset);

  // The band scale carries the categories; the other carries the values.
  const bandScale = horizontal ? config.yScale : config.xScale;
  const valueScale = horizontal ? config.xScale : config.yScale;
  const bandwidth = getScaleBandwidth(bandScale);

  return stack(data).map((s, seriesIndex) => {
    const key = s.key as Key;
    const seriesColor = color?.(key, seriesIndex, keys);
    return {
      key,
      index: seriesIndex,
      color: seriesColor,
      bars: s.map((point, pointIndex) => {
        const bandPos = coerceNumber(bandScale(category(data[pointIndex]) as never)) ?? 0;
        const start = coerceNumber(valueScale(point[0] as never)) ?? 0;
        const end = coerceNumber(valueScale(point[1] as never)) ?? 0;
        // min/abs rather than end-start, so negative stacks render too.
        const extent = Math.abs(end - start);
        const origin = Math.min(start, end);
        return {
          key,
          index: pointIndex,
          x: horizontal ? origin : bandPos,
          y: horizontal ? bandPos : origin,
          width: horizontal ? extent : bandwidth,
          height: horizontal ? bandwidth : extent,
          color: seriesColor,
          value: point[1] - point[0],
        };
      }),
    };
  });
}
