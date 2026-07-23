<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue, SVGAttributes } from "svelte/elements";

  type GroupProps = {
    top?: number;
    left?: number;
    transform?: string;
    class?: ClassValue;
    children?: Snippet;
    ref?: SVGGElement | null;
  };

  let {
    top = 0,
    left = 0,
    transform,
    class: className,
    children,
    ref = $bindable(null),
    ...props
  }: GroupProps & Omit<SVGAttributes<SVGGElement>, keyof GroupProps> = $props();
</script>

<g
  {...props}
  bind:this={ref}
  class={className}
  transform={transform || `translate(${left}, ${top})`}
>
  {@render children?.()}
</g>
