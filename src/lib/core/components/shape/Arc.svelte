<script lang="ts" generics="Datum">
  import type { ArcProps } from "$lib/types/Arc";
  import { arc } from "$lib/core/utils/shapeFactory";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";

  let {
    children,
    data,
    startAngle = 0,
    endAngle = 2 * Math.PI,
    innerRadius = 0,
    outerRadius = 100,
    padAngle,
    padRadius,
    cornerRadius,
    className,
    innerRef = $bindable(null),

    fill,
    stroke,
    fillOpacity,
    strokeWidth,
    strokeOpacity,
    ...restProps
  }: ArcProps<Datum> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        fill,
        stroke,
        fillOpacity,
        strokeWidth,
        strokeOpacity,
        cornerRadius,
        padAngle,
      },
      theme?.arc,
      DefaultTheme.arc,
    ),
  );

  let path = $derived(
    arc<Datum>({
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      padRadius,
      cornerRadius: style.cornerRadius,
      padAngle: style.padAngle,
    }),
  );

  // The generator ignores its argument when every accessor is a constant,
  // so a datum is only needed when accessors were passed.
  let datum = $derived((data ?? ({} as Datum)) as Datum);
</script>

{#if children}
  {@render children({ arc: path, centroid: path.centroid(datum) })}
{:else}
  <path
    bind:this={innerRef}
    class={["arc", className]}
    d={path(datum) || ""}
    fill={style.fill}
    stroke={style.stroke}
    fill-opacity={style.fillOpacity}
    stroke-opacity={style.strokeOpacity}
    stroke-width={style.strokeWidth}
    {...restProps}
  />
{/if}
