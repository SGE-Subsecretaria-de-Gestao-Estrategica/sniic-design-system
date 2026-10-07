<script lang="ts">
  /**
   * A break in a chart's time axis — for a series with a genuine gap or a
   * methodology change the chart doesn't want read as real, measured
   * change (a missing year, a base-year swap). Draws a rotated label above
   * the axis and a torn-paper chevron glyph on it, at `x`.
   *
   * Only marks the axis — it doesn't draw the dashed "bridging" segment
   * through the gap in the series itself, since that's a `<path>` (or
   * `LinePath`) the chart already owns, with its own `stroke-dasharray`.
   *
   * Unset styles come from the theme's `timelineBreak` role and `breakLabel`
   * text role.
   */
  import { breakGlyph } from "$lib/core/layouts/breakGlyph";
  import { getChartTheme, resolveTimelineBreak } from "$lib/core/theme";
  import type { TimelineBreakProps } from "$lib/types/TimelineBreak";
  import Text from "../Text.svelte";

  let { x, axisY, label, color, fontSize, fontFamily, letterSpacing, size }: TimelineBreakProps =
    $props();

  const theme = getChartTheme();

  let style = $derived(resolveTimelineBreak({ stroke: color, size, label }, theme));
  let glyph = $derived(breakGlyph(x, axisY, style.size));
</script>

<!-- `textAnchor="start"` grows the rotated label upward only, away from the
     axis — `"middle"` would swing half of it back down into the chevron. -->
<Text
  variant="breakLabel"
  x={glyph.label.x}
  y={glyph.label.y}
  angle={-90}
  textAnchor="start"
  {fontFamily}
  {fontSize}
  fill={color}
  text={style.label}
  {...letterSpacing !== undefined ? { "letter-spacing": letterSpacing } : {}}
/>
<g stroke={style.stroke} stroke-width={glyph.strokeWidth} stroke-linecap="round">
  {#each glyph.segments as { from, to }, i (i)}
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
  {/each}
</g>
