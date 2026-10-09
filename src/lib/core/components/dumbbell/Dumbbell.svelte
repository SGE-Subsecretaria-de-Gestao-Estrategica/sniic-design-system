<script lang="ts">
  /**
   * Two values joined: a thick round-capped `Line` from `from` to `to`, with a
   * `Circle` on each end — a two-point slice of the line charts' mark. The
   * end dot is the emphasised last point, in the accent colour and larger, so
   * the direction of change reads without an arrow.
   *
   * The stroke's round caps reach half its width past each dot, so equal
   * values still draw a visible pill rather than vanishing.
   *
   * Unset styles come from the theme's `dumbbell` role.
   */
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import type { DumbbellProps } from "$lib/types/Dumbbell";
  import Circle from "../markers/Circle.svelte";
  import Line from "../shape/Line.svelte";

  let {
    from,
    to,
    stroke,
    strokeWidth,
    strokeOpacity,
    fromFill,
    toFill,
    fromSize,
    toSize,
    showFrom = true,
    showTo = true,
    showStroke = true,
    class: className,
    ...restProps
  }: DumbbellProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      { stroke, strokeWidth, strokeOpacity, fromFill, toFill, fromSize, toSize },
      theme?.dumbbell,
      DefaultTheme.dumbbell,
    ),
  );
</script>

<g class={["dumbbell", className]} {...restProps}>
  {#if showStroke}
    <Line
      {from}
      {to}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      strokeOpacity={style.strokeOpacity}
      shape-rendering="auto"
    />
  {/if}
  {#if showFrom}
    <Circle x={from.x} y={from.y} size={style.fromSize} fill={style.fromFill} />
  {/if}
  {#if showTo}
    <Circle x={to.x} y={to.y} size={style.toSize} fill={style.toFill} />
  {/if}
</g>
