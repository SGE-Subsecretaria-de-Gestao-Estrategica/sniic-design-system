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
    BarGroupProps,
    BarScale,
    ComputedBarGroup,
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
    groupScale,
    groupPadding = 0.1,
    rx,
    ry,
    top = 0,
    left = 0,
    className,
    children,
  }: BarGroupProps<Datum, Key, XScale, YScale> = $props();

  const theme = getChartTheme();

  /** The band scale carries the categories; the other carries the values. */
  let bandScale = $derived(horizontal ? yScale : xScale);
  let valueScale = $derived(horizontal ? xScale : yScale);
  let bandwidth = $derived(getScaleBandwidth(bandScale));

  let innerScale = $derived(
    groupScale ??
      d3
        .scaleBand<string>()
        .domain(keys.map(String))
        .range([0, bandwidth])
        .padding(groupPadding),
  );

  /** Bars grow from the zero line, so a negative value extends the other way. */
  let baseline = $derived(coerceNumber(valueScale(0 as never)) ?? 0);

  let getValue = $derived(
    value ??
      ((d: Datum, key: Key) => Number((d as Record<string, unknown>)[String(key)] ?? 0)),
  );

  let barGroups = $derived(
    data.map((datum, index): ComputedBarGroup<Key> => {
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
          const thickness = innerScale.bandwidth();

          return {
            key,
            index: keyIndex,
            x: horizontal ? origin : bandPos + withinGroup,
            y: horizontal ? bandPos + withinGroup : origin,
            width: horizontal ? extent : thickness,
            height: horizontal ? thickness : extent,
            color: color?.(key, keyIndex, keys) ?? getCategoricalColor(keyIndex, theme),
            value: v,
          };
        }),
      };
    }),
  );
</script>

<Group class={["bar-group", className]} {top} {left}>
  {#if children}
    {@render children({ barGroups })}
  {:else}
    {#each barGroups as group (group.index)}
      {#each group.bars as bar (`${group.index}-${String(bar.key)}`)}
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
