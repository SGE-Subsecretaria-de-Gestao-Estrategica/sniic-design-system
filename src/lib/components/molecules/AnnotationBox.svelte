<script lang="ts">
  import { orange, teal, typography } from '../../tokens.js';
  import { measureTextWidth } from '../../utils/labelHelpers.js';

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
    /** Caps the effective box width. Defaults to innerWidth/2 when innerWidth is provided. */
    maxBoxWidth?: number;
    /** When true, the box stretches from boxX to the right edge of the inner chart area. Requires innerWidth. */
    fullWidth?: boolean;
    /** Total inner chart width (required when fullWidth is true or to enable default maxBoxWidth). */
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
    maxBoxWidth,
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

  // Word-wrap a single string to fit within maxWidth px, returns array of lines
  function wrapText(text: string, maxWidth: number, fontSize: number, fontWeight = 400): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (current && measureTextWidth(test, fontSize, fontFamily, fontWeight) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [''];
  }

  // Effective box width: respect fullWidth, boxWidth, and maxBoxWidth cap
  const rawBoxWidth = $derived(fullWidth && innerWidth != null ? innerWidth - boxX : boxWidth);
  const resolvedMaxBoxWidth = $derived(maxBoxWidth ?? (innerWidth != null ? innerWidth / 2 : undefined));
  const effectiveBoxWidth = $derived(
    resolvedMaxBoxWidth != null ? Math.min(rawBoxWidth, resolvedMaxBoxWidth) : rawBoxWidth
  );

  const textWidth = $derived(effectiveBoxWidth - pad * 2);

  // Wrap title and subtitle to fit the box
  const titleLines = $derived(showTitle ? wrapText(title, textWidth, titleSize, 700) : []);
  const subtitleLines = $derived(
    subtitle ? subtitle.split('\n').flatMap(line => wrapText(line, textWidth, subtitleSize)) : []
  );

  const titleBlockHeight = $derived(showTitle ? titleLines.length * titleHeight : 0);
  const autoBoxHeight = $derived(
    pad * 2 + titleBlockHeight + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)
  );
  const boxHeight = $derived(boxHeightProp ?? autoBoxHeight);

  // Box center
  const boxCX = $derived(boxX + effectiveBoxWidth / 2);
  const boxCY = $derived(boxY + boxHeight / 2);

  // Connector anchor: center of the nearest horizontal side
  const anchorX = $derived(pointX >= boxCX ? boxX + effectiveBoxWidth : boxX);
  const anchorY = $derived(boxCY);

  // Elbow bend: go horizontally from anchor, then angle toward point
  const elbowX = $derived(anchorX + (pointX - anchorX) * 0.4);
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
  rx="0"
/>

<!-- Title (may wrap to multiple lines) -->
{#each titleLines as line, i (i)}
  <text
    x={boxX + pad}
    y={boxY + pad + titleSize + i * titleHeight}
    font-size={titleSize}
    font-weight="700"
    fill={teal}
    font-family={fontFamily}
  >{line}</text>
{/each}

<!-- Subtitle lines -->
{#each subtitleLines as line, i (i)}
  <text
    x={boxX + pad}
    y={boxY + pad + titleBlockHeight + (showTitle ? 6 : 0) + i * lineHeight + subtitleSize}
    font-size={subtitleSize}
    fill="var(--chart-fg-strong, #000000)"
    opacity="0.55"
    font-family={fontFamily}
  >{line}</text>
{/each}

{#if children}
  <foreignObject
    x={boxX}
    y={boxY + pad + titleBlockHeight + (showTitle && subtitleLines.length > 0 ? 6 : 0) + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight : 0)}
    width={effectiveBoxWidth}
    height={boxHeight - pad - titleBlockHeight - (subtitleLines.length > 0 ? subtitleLines.length * lineHeight + 6 : 0)}
  >
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
      {@render children()}
    </div>
  </foreignObject>
{/if}
