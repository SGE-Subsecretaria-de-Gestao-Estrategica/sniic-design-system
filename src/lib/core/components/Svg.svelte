<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  type SvgProps = {
    width: number;
    height: number;
    children?: Snippet;
  } & Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "children" | "xmlns"
  >;

  let { width, height, children, viewBox, ...props }: SvgProps = $props();
</script>

<svg
  {width}
  {height}
  viewBox={viewBox || `0 0 ${width} ${height}`}
  xmlns="http://www.w3.org/2000/svg"
  {...props}
>
  {@render children?.()}
</svg>
