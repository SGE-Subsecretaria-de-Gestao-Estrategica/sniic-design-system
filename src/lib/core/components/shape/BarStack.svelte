<script
  lang="ts"
  generics="Datum, Key extends StringLike = string, XScale extends BarScale = BarScale, YScale extends BarScale = BarScale"
>
  import * as d3 from "d3";
  import coerceNumber from "$lib/core/utils/coerceNumber";
  import getScaleBandwidth from "$lib/core/utils/getScaleBandwidth";
  import { getCategoricalColor, getChartTheme } from "$lib/core/theme";
  import type { StringLike } from "$lib/types/Base";
  import type {
    BarScale,
    BarStackProps,
    ComputedBarStack,
  } from "$lib/types/Bar";
  import Group from "../Group.svelte";
  import Bar from "./Bar.svelte";

  let {
    data = [],
    keys = [],
    category,
    value,
    color,
    horizontal = false,
    xScale,
    yScale,
    order,
    offset,
    rx,
    ry,
    top = 0,
    left = 0,
    className,
    children,
  }: BarStackProps<Datum, Key, XScale, YScale> = $props();

  const theme = getChartTheme();

  let series = $derived.by(() => {
    const stack = d3.stack<Datum, Key>().keys(keys);
    if (value) stack.value((d, key) => value(d, key));
    if (order) stack.order(order);
    if (offset) stack.offset(offset);
    return stack(data);
  });

  /** The band scale carries the categories; the other carries the values. */
  let bandScale = $derived(horizontal ? yScale : xScale);
  let valueScale = $derived(horizontal ? xScale : yScale);
  let bandwidth = $derived(getScaleBandwidth(bandScale));

  let barStacks = $derived(
    series.map((s, seriesIndex): ComputedBarStack<Key> => {
      const key = s.key as Key;
      const seriesColor =
        color?.(key, seriesIndex, keys) ??
        getCategoricalColor(seriesIndex, theme);

      return {
        key,
        index: seriesIndex,
        color: seriesColor,
        bars: s.map((point, pointIndex) => {
          const datum = data[pointIndex];
          const bandPos = coerceNumber(bandScale(category(datum) as never)) ?? 0;
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
    }),
  );
</script>

<Group class={["bar-stack", className]} {top} {left}>
  {#if children}
    {@render children({ barStacks })}
  {:else}
    {#each barStacks as stack (stack.key)}
      {#each stack.bars as bar (`${String(stack.key)}-${bar.index}`)}
        <Bar
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.color}
          {rx}
          {ry}
        />
      {/each}
    {/each}
  {/if}
</Group>
