<script lang="ts">
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { BarProps } from "$lib/types/Bar";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    rx,
    ry,
    class: className,
    innerRef = $bindable(null),
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    ...restProps
  }: BarProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        fill,
        fillOpacity,
        stroke,
        strokeWidth,
        strokeOpacity,
        rx,
        ry,
      },
      theme?.bar,
      DefaultTheme.bar,
    ),
  );

  // A rect with a negative dimension is invalid SVG and throws in some
  // renderers; clamping keeps a mid-transition or out-of-domain value harmless.
  let safeWidth = $derived(Math.max(0, width));
  let safeHeight = $derived(Math.max(0, height));
</script>

<rect
  bind:this={innerRef}
  class={["bar", className]}
  {x}
  {y}
  width={safeWidth}
  height={safeHeight}
  rx={style.rx}
  ry={style.ry}
  fill={style.fill}
  fill-opacity={style.fillOpacity}
  stroke={style.stroke}
  stroke-width={style.strokeWidth}
  stroke-opacity={style.strokeOpacity}
  {...restProps}
/>
