<script lang="ts" generics="Datum">
  import type { AddSVGProps } from "$lib/types/Base";
  import type { LinePathProps } from "$lib/types/Line";
  import { line } from "$lib/core/utils/shapeFactory";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";

  let {
    children,
    data = [],
    x = (d: any) => d.x ?? 0,
    y = (d: any) => d.y ?? 0,
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
  }: AddSVGProps<LinePathProps<Datum>, SVGPathElement> = $props();

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
      theme?.line,
      DefaultTheme.line,
    ),
  );

  let path = $derived(
    line<Datum>({ x, y, defined: defined, curve: style.curve }),
  );
</script>

<path
  bind:this={innerRef}
  class={["linepath", className]}
  d={path(data) || ""}
  stroke-linecap="round"
  fill={style.fill}
  stroke={style.stroke}
  fill-opacity={style.fillOpacity}
  stroke-opacity={style.strokeOpacity}
  stroke-width={style.strokeWidth}
  {...restProps}
/>
