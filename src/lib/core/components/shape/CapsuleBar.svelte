<script lang="ts">
  /**
   * The Cultura em Números bar: a thick stroke with a flat base and a fully
   * round tip, filled with a gradient that brightens toward the tip, and a dot
   * sitting concentric with the tip — the line charts' mark turned on its
   * side, so bars and lines read as one family.
   *
   * Draws the geometry `capsuleBarLayout` computes; colours come from the
   * theme's `capsule` role unless given.
   */
  import { getChartTheme, resolveCapsule } from "$lib/core/theme";
  import type { CapsuleBarProps } from "$lib/types/CapsuleBar";
  import Circle from "../markers/Circle.svelte";

  let {
    layout,
    fill,
    fillOpacity,
    dot = true,
    dotFill,
    class: className,
    ...restProps
  }: CapsuleBarProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();

  let style = $derived(resolveCapsule({ fill, fillOpacity, dotFill }, theme));
</script>

{#if layout.length > 0 && layout.thickness > 0}
  <g class={["capsule-bar", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-clip">
        <rect {...layout.clip} />
      </clipPath>
      <linearGradient
        id="{uid}-fill"
        gradientUnits="userSpaceOnUse"
        x1={layout.gradient.from.x}
        y1={layout.gradient.from.y}
        x2={layout.gradient.to.x}
        y2={layout.gradient.to.y}
      >
        <stop offset="0" stop-color={style.stops[0]} />
        <stop offset="1" stop-color={style.stops[1]} />
      </linearGradient>
    </defs>

    <g clip-path="url(#{uid}-clip)" fill-opacity={style.fillOpacity}>
      <path d={layout.path} fill="url(#{uid}-fill)" />
      {#if dot}
        <Circle x={layout.dot.x} y={layout.dot.y} size={layout.dot.radius} fill={style.dotFill} />
      {/if}
    </g>
  </g>
{/if}
