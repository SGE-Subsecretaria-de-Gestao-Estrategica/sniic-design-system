import * as d3 from "d3";
import rangeSpan from "$lib/core/utils/rangeSpan";
import { barRect, scaled } from "./geometry";
import type { BarStackLayout, BarStackLayoutConfig } from "./types";

/**
 * One series per key, each a rect per category, stacked with `d3.stack`
 * along the value scale. The only function that reads the config.
 */
export function barStackLayout<D, K extends string = string>(
  data: D[],
  config: BarStackLayoutConfig<D, K>,
): BarStackLayout<D, K> {
  const { keys, getCategory, horizontal = false, order, offset } = config;
  const getValue =
    config.getValue ?? ((d: D, key: K) => Number((d as Record<string, unknown>)[key] ?? 0));

  const stack = d3
    .stack<D, K>()
    .keys(keys)
    .value((d, key) => getValue(d, key));
  if (order) stack.order(order);
  if (offset) stack.offset(offset);

  // The band scale carries the categories; the other carries the values.
  const bandScale = horizontal ? config.yScale : config.xScale;
  const valueScale = horizontal ? config.xScale : config.yScale;
  const thickness = bandScale.bandwidth?.() ?? 0;

  return {
    width: rangeSpan(config.xScale),
    height: rangeSpan(config.yScale),
    series: stack(data).map((s, index) => {
      const series = s.key as K;
      return {
        key: series,
        index,
        bars: s.map((point, pointIndex) => {
          const datum = data[pointIndex];
          const category = getCategory(datum);
          return {
            key: `${series}:${category}`,
            index: pointIndex,
            data: datum,
            series,
            category,
            value: point[1] - point[0],
            ...barRect(
              horizontal,
              scaled(bandScale, category),
              thickness,
              scaled(valueScale, point[0]),
              scaled(valueScale, point[1]),
            ),
          };
        }),
      };
    }),
  };
}
