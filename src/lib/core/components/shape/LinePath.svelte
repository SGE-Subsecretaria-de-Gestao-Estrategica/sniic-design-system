<script lang="ts" generics="Datum">
  import type { AddSVGProps } from "$lib/types/Base";
  import type { LinePathProps } from "$lib/types/Line";
  import { line } from "$lib/core/utils/shapeFactory";
  import { getChartTheme, resolveThemeStyles } from "$lib/core/context/theme";
  import { DEFAULT_LINE_THEME } from "$lib/constants/theme";

  let {
    children,
    data = [],
    x,
    y,
    className,
    innerRef = $bindable(null),

    curve,
    defined,
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
        defined,
        fill,
        stroke,
        fillOpacity,
        strokeWidth,
        strokeOpacity,
      },
      theme?.line,
      DEFAULT_LINE_THEME,
    ),
  );

  let path = $derived(
    line<Datum>({ x, y, defined: style.defined, curve: style.curve }),
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
