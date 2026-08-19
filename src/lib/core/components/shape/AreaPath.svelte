<script lang="ts" generics="Datum">
  import type { AddSVGProps } from "$lib/types/Base";
  import type { AreaPathProps } from "$lib/types/Area";
  import { area } from "$lib/core/utils/shapeFactory";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";

  let {
    children,
    data = [],
    x,
    x0,
    x1,
    y,
    y0,
    y1,
    className,
    innerRef = $bindable(null),

    curve,
    defined = () => true,
    fill,
    stroke,
    fillOpacity,
    strokeWidth,
    strokeOpacity,
    ...restProps
  }: AddSVGProps<AreaPathProps<Datum>, SVGPathElement> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        curve,
        fill,
        stroke,
        fillOpacity,
        strokeWidth,
        strokeOpacity,
      },
      theme?.area,
      DefaultTheme.area,
    ),
  );

  let path = $derived(
    area<Datum>({ x, x0, x1, y, y0, y1, defined, curve: style.curve }),
  );
</script>

{#if children}
  {@render children(path)}
{:else}
  <path
    bind:this={innerRef}
    class={["areapath", className]}
    d={path(data) || ""}
    stroke-linecap="round"
    fill={style.fill}
    stroke={style.stroke}
    fill-opacity={style.fillOpacity}
    stroke-opacity={style.strokeOpacity}
    stroke-width={style.strokeWidth}
    {...restProps}
  />
{/if}
