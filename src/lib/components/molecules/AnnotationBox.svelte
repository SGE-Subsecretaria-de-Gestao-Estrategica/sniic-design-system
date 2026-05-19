<script lang="ts">
  import { orange, teal, white, black, typography } from '../../tokens.js';

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
    subtitle?: string;
    /** Color of the connector line and point circle. */
    color?: string;
    /** Width of the annotation box in px. */
    boxWidth?: number;
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
    subtitle = '',
    color = orange,
    boxWidth = 220,
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
    pad * 2 + titleHeight + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)
  );
  const boxHeight = $derived(boxHeightProp ?? autoBoxHeight);

  // Box center
  const boxCX = $derived(boxX + boxWidth / 2);
  const boxCY = $derived(boxY + boxHeight / 2);

  // Connector anchor: center of the nearest horizontal side
  const anchorX = $derived(pointX >= boxCX ? boxX + boxWidth : boxX);
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
  width={boxWidth}
  height={boxHeight}
  fill={white}
  stroke={teal}
  stroke-width="1"
  rx="2"
/>

<!-- Title -->
<text
  x={boxX + pad}
  y={boxY + pad + titleSize}
  font-size={titleSize}
  font-weight="700"
  fill={teal}
  font-family={fontFamily}
>{title}</text>

<!-- Subtitle lines -->
{#each subtitleLines as line, i (i)}
  <text
    x={boxX + pad}
    y={boxY + pad + titleHeight + 6 + i * lineHeight + subtitleSize}
    font-size={subtitleSize}
    fill={black}
    opacity="0.55"
    font-family={fontFamily}
  >{line}</text>
{/each}

{#if children}
  <foreignObject
    x={boxX}
    y={boxY + pad + titleHeight + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)}
    width={boxWidth}
    height={boxHeight - pad - titleHeight - (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)}
  >
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
      {@render children()}
    </div>
  </foreignObject>
{/if}
