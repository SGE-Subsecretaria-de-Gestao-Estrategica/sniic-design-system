<script lang="ts" generics="Scale extends GridScale">
  import coerceNumber from "$lib/core/utils/coerceNumber";
  import getScaleBandwidth from "$lib/core/utils/getScaleBandwidth";
  import getTicks from "$lib/core/utils/getTicks";
  import Point from "$lib/entities/Point";
  import Group from "../Group.svelte";
  import Line from "../shape/Line.svelte";
  import type { AllGridColumnsProps, GridScale } from "$lib/types/Grid";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";

  let {
    top = 0,
    left = 0,
    scale,
    height,
    stroke,
    strokeWidth,
    strokeDasharray,
    strokeOpacity,
    className,
    numTicks,
    offset,
    tickValues,
    children,
    ...restProps
  }: AllGridColumnsProps<Scale> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        stroke,
        strokeWidth,
        strokeDasharray,
        numTicks,
      },
      theme?.grid,
      DefaultTheme.grid,
    ),
  );

  let ticks = $derived(tickValues ?? getTicks(scale, style.numTicks));
  let scaleOffset = $derived((offset ?? 0) + getScaleBandwidth(scale) / 2);
  let tickLines = $derived(
    ticks.map((d, index) => {
      const x = (coerceNumber(scale(d)) ?? 0) + scaleOffset;
      return {
        index,
        from: new Point({ x, y: 0 }),
        to: new Point({ x, y: height }),
      };
    }),
  );
</script>

<Group class={["columns", className]} {top} {left}>
  {#if children}
    {@render children({ lines: tickLines })}
  {:else}
    {#each tickLines as { from, to, index } (`column-line-${index}`)}
      <Line
        {from}
        {to}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        {strokeOpacity}
        {...restProps}
      />
    {/each}
  {/if}
</Group>
