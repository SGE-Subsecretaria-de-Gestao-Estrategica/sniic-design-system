<script lang="ts">
  /**
   * A break in a chart's time axis — for a series with a genuine gap or a
   * methodology change the chart doesn't want read as real, measured
   * change (a missing year, a base-year swap). Draws a rotated label above
   * the axis and a torn-paper chevron glyph on it, at `x`. Lifted from
   * `FaixaLinhasChart`/`LinhaProporcaoChart` (Eixo 1), which each drew this
   * by hand identically.
   *
   * Only marks the axis — it doesn't draw the dashed "bridging" segment
   * through the gap in the series itself, since that's a `<path>` (or
   * `LinePath`) the chart already owns, with its own `stroke-dasharray`.
   */
  import Text from "../Text.svelte";

  interface Props {
    x: number;
    /** Y of the time axis; the chevron sits just above it. */
    axisY: number;
    label?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    letterSpacing?: number | string;
    /** Scales the chevron glyph and its gap from the axis and the label. */
    size?: number;
  }

  let {
    x,
    axisY,
    label = "QUEBRA",
    color = "#8F8F89",
    fontSize = 12,
    fontFamily,
    letterSpacing,
    size = 6,
  }: Props = $props();

  const chevronY = $derived(axisY - size * 0.7);
  // `textAnchor="start"` makes the label grow only upward, away from the
  // axis, once rotated — `"middle"` would extend it symmetrically and swing
  // half of it back down into the chevron/axis.
  const labelY = $derived(chevronY - size * 1.4);
</script>

<Text
  {x}
  y={labelY}
  angle={-90}
  textAnchor="start"
  {fontFamily}
  {fontSize}
  fontWeight={500}
  fill={color}
  text={label}
  {...letterSpacing !== undefined ? { "letter-spacing": letterSpacing } : {}}
/>
<g stroke={color} stroke-width={size * 0.23} stroke-linecap="round">
  <line x1={x - size * 1.7} y1={chevronY} x2={x - size * 0.7} y2={chevronY} />
  <line x1={x + size * 0.7} y1={chevronY} x2={x + size * 1.7} y2={chevronY} />
  <line x1={x - size * 0.5} y1={chevronY + size * 0.6} x2={x + size * 0.08} y2={chevronY - size * 0.6} />
  <line x1={x - size * 0.08} y1={chevronY + size * 0.6} x2={x + size * 0.5} y2={chevronY - size * 0.6} />
</g>
