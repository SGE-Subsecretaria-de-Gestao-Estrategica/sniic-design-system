<script lang="ts">
  /**
   * Two values joined: a thick round-capped stroke from `from` to `to`, with a
   * dot on each end — a two-point slice of the line charts' mark. The start
   * dot is the ordinary marker; the end dot is the emphasised last point, in
   * the accent colour and larger, so the direction of change reads without
   * an arrow.
   *
   * The stroke's round caps reach half its width past each dot, so equal
   * values still draw a visible pill rather than vanishing; the stroke length
   * between the dots is the difference itself.
   *
   * Every default comes from the theme (`line`, `marker.circle`, `palette`),
   * so a pillar theme restyles it with the rest of the chart.
   */
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";
  import type { DumbbellProps } from "$lib/types/Dumbbell";

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

  let resolved = $derived.by(() => {
    const line = { ...DefaultTheme.line, ...theme?.line };
    const marker = { ...DefaultTheme.marker.circle, ...theme?.marker?.circle };
    const palette = { ...DefaultTheme.palette, ...theme?.palette };
    const startSize = fromSize ?? Number(marker.size ?? 5);
    return {
      stroke: stroke ?? String(line.stroke ?? palette.primary),
      strokeWidth: strokeWidth ?? Number(line.strokeWidth ?? 12),
      fromFill: fromFill ?? String(marker.fill ?? palette.primaryVariant),
      toFill: toFill ?? String(palette.accent),
      fromSize: startSize,
      toSize: toSize ?? startSize * 1.6,
    };
  });
</script>

<g class={["dumbbell", className]} {...restProps}>
  {#if showStroke}
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={resolved.stroke}
      stroke-width={resolved.strokeWidth}
      stroke-opacity={strokeOpacity}
      stroke-linecap="round"
    />
  {/if}
  {#if showFrom}
    <circle cx={from.x} cy={from.y} r={resolved.fromSize} fill={resolved.fromFill} />
  {/if}
  {#if showTo}
    <circle cx={to.x} cy={to.y} r={resolved.toSize} fill={resolved.toFill} />
  {/if}
</g>
