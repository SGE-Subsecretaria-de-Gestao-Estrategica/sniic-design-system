<script lang="ts">
  /**
   * The Cultura em Números bar: a thick stroke with a flat base and a fully
   * round tip, filled with a gradient that brightens toward the tip, and a dot
   * sitting concentric with the tip — the line charts' mark turned on its
   * side, so bars and lines read as one family.
   *
   * Takes its box like a `rect`; `capsuleBar` in `core/utils/shapeFactory.ts`
   * turns it into the path. Unset styles come from the theme's `capsule` role.
   */
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import { capsuleBar } from "$lib/core/utils/shapeFactory";
  import type { CapsuleBarProps } from "$lib/types/CapsuleBar";
  import Circle from "../markers/Circle.svelte";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    orientation = "horizontal",
    reverse = false,
    fill,
    fillOpacity,
    dot = true,
    dotFill,
    dotRatio,
    class: className,
    ...restProps
  }: CapsuleBarProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles({ fill, fillOpacity, dotFill, dotRatio }, theme?.capsule, DefaultTheme.capsule),
  );
  let stops = $derived(typeof style.fill === "string" ? [style.fill, style.fill] : style.fill);
  let shape = $derived(
    capsuleBar({ x, y, width, height, reverse, orientation, dotRatio: style.dotRatio }),
  );
</script>

{#if shape.length > 0 && shape.thickness > 0}
  <g class={["capsule-bar", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-clip">
        <rect {...shape.clip} />
      </clipPath>
      <linearGradient
        id="{uid}-fill"
        gradientUnits="userSpaceOnUse"
        x1={shape.gradient.from.x}
        y1={shape.gradient.from.y}
        x2={shape.gradient.to.x}
        y2={shape.gradient.to.y}
      >
        <stop offset="0" stop-color={stops[0]} />
        <stop offset="1" stop-color={stops[1]} />
      </linearGradient>
    </defs>

    <g clip-path="url(#{uid}-clip)" fill-opacity={style.fillOpacity}>
      <path d={shape.path} fill="url(#{uid}-fill)" />
      {#if dot}
        <Circle x={shape.dot.x} y={shape.dot.y} size={shape.dot.radius} fill={style.dotFill} />
      {/if}
    </g>
  </g>
{/if}
