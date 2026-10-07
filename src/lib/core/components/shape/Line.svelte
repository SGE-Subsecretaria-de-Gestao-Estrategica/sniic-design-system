<script lang="ts">
  import type { AddSVGProps } from "$lib/types/Base";
  import type { LineProps } from "$lib/types/Line";
  import { getChartTheme, resolveBaseline } from "$lib/core/theme";

  let {
    from = { x: 0, y: 0 },
    to = { x: 1, y: 1 },
    fill = "transparent",
    class: className,
    role,
    innerRef = $bindable(null),
    stroke,
    strokeWidth,
    strokeDasharray,
    strokeOpacity,
    ...restProps
  }: AddSVGProps<LineProps, SVGLineElement> = $props();

  const theme = getChartTheme();

  // With a role, unset stroke props come from the theme; without, as given.
  let stroked = $derived(
    role === "baseline"
      ? resolveBaseline({ stroke, strokeWidth: strokeWidth as number | undefined }, theme)
      : { stroke, strokeWidth },
  );

  let isRectilinear = $derived(from.x === to.x || from.y === to.y);
</script>

<line
  stroke-linecap="round"
  {...restProps}
  stroke={stroked.stroke}
  stroke-width={stroked.strokeWidth}
  stroke-dasharray={strokeDasharray}
  stroke-opacity={strokeOpacity}
  bind:this={innerRef}
  class={["line", className]}
  x1={from.x}
  y1={from.y}
  x2={to.x}
  y2={to.y}
  {fill}
  shape-rendering={isRectilinear ? "crispEdges" : "auto"}
/>
