<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  type SvgProps = {
    width: number;
    height: number;
    children?: Snippet;
    ref?: SVGSVGElement | null;
  } & Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "children" | "xmlns"
  >;

  let {
    width,
    height,
    children,
    viewBox,
    ref = $bindable(null),
    ...props
  }: SvgProps = $props();
</script>

<svg
  bind:this={ref}
  {width}
  {height}
  viewBox={viewBox || `0 0 ${width} ${height}`}
  xmlns="http://www.w3.org/2000/svg"
  {...props}
>
  {@render children?.()}
</svg>
