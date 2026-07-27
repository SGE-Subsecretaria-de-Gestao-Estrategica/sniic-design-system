<script lang="ts">
  import type { AddSVGProps } from "$lib/types/Base";
  import type { LineProps } from "$lib/types/Line";

  let {
    from = { x: 0, y: 0 },
    to = { x: 1, y: 1 },
    fill = "transparent",
    class: className,
    innerRef = $bindable(null),
    stroke,
    strokeWidth,
    strokeDasharray,
    strokeOpacity,
    ...restProps
  }: AddSVGProps<LineProps, SVGLineElement> = $props();

  let isRectilinear = $derived(from.x === to.x || from.y === to.y);
</script>

<line
  {...restProps}
  {stroke}
  stroke-width={strokeWidth}
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
