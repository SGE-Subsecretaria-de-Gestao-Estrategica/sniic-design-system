<script lang="ts">
  import { orange, teal, typography } from '../../tokens.js';

  /**
   * SVG molecule — place inside a chart's inner <g transform="translate(marginLeft, marginTop)">.
   * Renders a bordered label box with a two-segment connector line and a circle highlight
   * around the annotated data point.
   */
  import type { Snippet } from 'svelte';

  interface Props {
    /** Coordinates of the annotated data point (inner chart space). */
    pointX: number;
    pointY: number;
    /** Top-left position of the annotation box (inner chart space). */
    boxX: number;
    boxY: number;
    title: string;
    showTitle?: boolean;
    subtitle?: string;
    /** Color of the connector line and point circle. */
    color?: string;
    /** Width of the annotation box in px. Ignored when fullWidth is true. */
    boxWidth?: number;
    /** When true, the box stretches from boxX to the right edge of the inner chart area. Requires innerWidth. */
    fullWidth?: boolean;
    /** Total inner chart width (required when fullWidth is true). */
    innerWidth?: number;
    /** Height override for the annotation box (required when using children). */
    boxHeight?: number;
    /** Radius of the highlight ring drawn around the data point. */
    circleRadius?: number;
    fontFamily?: string;
    /** Optional slotted content rendered inside the box via foreignObject. */
    children?: Snippet;
  }

  let {
    pointX,
    pointY,
    boxX,
    boxY,
    title,
    showTitle = true,
    subtitle = '',
    color = orange,
    boxWidth = 220,
    fullWidth = false,
    innerWidth,
    boxHeight: boxHeightProp,
    circleRadius = 16,
    fontFamily = typography.chartValueFontFamily,
    children,
  }: Props = $props();

  // Layout constants
  const pad = 14;
  const titleSize = typography.sizes.md;
  const subtitleSize = typography.sizes.sm;
  const lineHeight = subtitleSize * 1.5;
  const titleHeight = titleSize * 1.4;

  // Split subtitle into lines to support manual wrapping (\n or passed as array)
  const subtitleLines = $derived(subtitle ? subtitle.split('\n') : []);
  const autoBoxHeight = $derived(
    pad * 2 + (showTitle ? titleHeight : 0) + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)
  );
  const boxHeight = $derived(boxHeightProp ?? autoBoxHeight);

  // Effective box width: full inner width (from boxX to right edge) or fixed px value
  const effectiveBoxWidth = $derived(fullWidth && innerWidth != null ? innerWidth - boxX : boxWidth);

  // Box center
  const boxCX = $derived(boxX + effectiveBoxWidth / 2);
  const boxCY = $derived(boxY + boxHeight / 2);

  // Connector anchor: center of the nearest horizontal side
  const anchorX = $derived(pointX >= boxCX ? boxX + effectiveBoxWidth : boxX);
  const anchorY = $derived(boxCY);

  // Elbow bend: go horizontally from anchor, then angle toward point
  const elbowX = $derived(pointX >= boxCX ? anchorX + (pointX - anchorX) * 0.4 : anchorX + (pointX - anchorX) * 0.4);
</script>

<!-- Connector line: two-segment elbow -->
<polyline
  points="{anchorX},{anchorY} {elbowX},{anchorY} {pointX},{pointY}"
  fill="none"
  stroke={color}
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>

<!-- Highlight ring at data point -->
<circle
  cx={pointX}
  cy={pointY}
  r={circleRadius}
  fill="none"
  stroke={color}
  stroke-width="1.5"
/>

<!-- Box background -->
<rect
  x={boxX}
  y={boxY}
  width={effectiveBoxWidth}
  height={boxHeight}
  fill="var(--chart-bg, #ffffff)"
  stroke={teal}
  stroke-width="1"
  rx="2"
/>

<!-- Title -->
{#if showTitle}
  <text
    x={boxX + pad}
    y={boxY + pad + titleSize}
    font-size={titleSize}
    font-weight="700"
    fill={teal}
    font-family={fontFamily}
  >{title}</text>
{/if}

<!-- Subtitle lines -->
{#each subtitleLines as line, i (i)}
  <text
    x={boxX + pad}
    y={boxY + pad + (showTitle ? titleHeight + 6 : 0) + i * lineHeight + subtitleSize}
    font-size={subtitleSize}
    fill="var(--chart-fg-strong, #000000)"
    opacity="0.55"
    font-family={fontFamily}
  >{line}</text>
{/each}

{#if children}
  <foreignObject
    x={boxX}
    y={boxY + pad + (showTitle ? titleHeight : 0) + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)}
    width={effectiveBoxWidth}
    height={boxHeight - pad - titleHeight - (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)}
  >
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
      {@render children()}
    </div>
  </foreignObject>
{/if}
