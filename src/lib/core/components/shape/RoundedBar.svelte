<script lang="ts">
  /**
   * A bar/segment shape with independently roundable corners — for a
   * stacked-column segment (top corners only, flush with its neighbour
   * below), a legend/value pill (`radius` = half the height, one or both
   * ends rounded), or any rect a plain `<rect rx>` can't draw because it
   * only rounds all four corners alike. See `roundedRect` in
   * `core/utils/shapeFactory.ts` for the path math.
   */
  import { roundedRect } from "$lib/core/utils/shapeFactory";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { RoundedBarProps } from "$lib/types/RoundedRect";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    radius = 0,
    corners,
    class: className,
    innerRef = $bindable(null),
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    ...restProps
  }: RoundedBarProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      { fill, fillOpacity, stroke, strokeWidth, strokeOpacity },
      theme?.bar,
      DefaultTheme.bar,
    ),
  );

  let d = $derived(roundedRect({ x, y, width, height, radius, corners }));
</script>

<path
  bind:this={innerRef}
  class={["rounded-bar", className]}
  {d}
  fill={style.fill}
  fill-opacity={style.fillOpacity}
  stroke={style.stroke}
  stroke-opacity={style.strokeOpacity}
  stroke-width={style.strokeWidth}
  {...restProps}
/>
