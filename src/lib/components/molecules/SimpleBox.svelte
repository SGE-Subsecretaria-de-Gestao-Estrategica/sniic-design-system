<script lang="ts">
  import { teal, white, black, typography } from '../../tokens.js';

  import type { Snippet } from 'svelte';

  /**
   * SVG molecule — a simple annotation box (no connector lines).
   * Can display a big number, text, or both. Optionally includes a title.
   * Place inside a chart's inner <g transform="translate(marginLeft, marginTop)">.
   */

  interface Props {
    /** Top-left X position of the box (inner chart space). */
    x: number;
    /** Top-left Y position of the box (inner chart space). */
    y: number;
    /** Optional title displayed at the top. */
    title?: string;
    /** Big number or main text displayed prominently. */
    value?: string;
    /** Smaller subtitle/description below the value. */
    subtitle?: string;
    /** Width of the box in px. */
    boxWidth?: number;
    /** Height override (auto-calculated if omitted). */
    boxHeight?: number;
    /** Border/title color. */
    color?: string;
    /** Value text color. */
    valueColor?: string;
    /** Value font size. */
    valueSize?: number;
    fontFamily?: string;
    /** Optional slotted content rendered inside the box via foreignObject. */
    children?: Snippet;
  }

  let {
    x,
    y,
    title,
    value,
    subtitle,
    boxWidth = 180,
    boxHeight: boxHeightProp,
    color = teal,
    valueColor = black,
    valueSize = 32,
    fontFamily = typography.chartValueFontFamily,
    children,
  }: Props = $props();

  const pad = 14;
  const titleSize = typography.sizes.md;
  const subtitleSize = typography.sizes.sm;
  const lineHeight = subtitleSize * 1.5;
  const titleHeight = titleSize * 1.4;

  const subtitleLines = $derived(subtitle ? subtitle.split('\n') : []);

  const autoBoxHeight = $derived.by(() => {
    let h = pad * 2;
    if (title) h += titleHeight + 4;
    if (value) h += valueSize * 1.3;
    if (subtitleLines.length > 0) h += subtitleLines.length * lineHeight + 4;
    return h;
  });

  const boxHeight = $derived(boxHeightProp ?? autoBoxHeight);

  const titleBaseY = $derived(y + pad + titleSize);
  const valueBaseY = $derived(
    y + pad + (title ? titleHeight + 4 : 0) + valueSize
  );
  const subtitleBaseY = $derived(
    y + pad + (title ? titleHeight + 4 : 0) + (value ? valueSize * 1.3 + 4 : 0)
  );
</script>

<!-- Box background -->
<rect
  x={x}
  y={y}
  width={boxWidth}
  height={boxHeight}
  fill={white}
  stroke={color}
  stroke-width="1"
  rx="2"
/>

{#if title}
  <text
    x={x + pad}
    y={titleBaseY}
    font-size={titleSize}
    font-weight="700"
    fill={color}
    font-family={fontFamily}
  >{title}</text>
{/if}

{#if value}
  <text
    x={x + pad}
    y={valueBaseY}
    font-size={valueSize}
    font-weight="700"
    fill={valueColor}
    font-family={fontFamily}
  >{value}</text>
{/if}

{#each subtitleLines as line, i (i)}
  <text
    x={x + pad}
    y={subtitleBaseY + i * lineHeight + subtitleSize}
    font-size={subtitleSize}
    fill="var(--chart-fg-strong, #000000)"
    opacity="0.55"
    font-family={fontFamily}
  >{line}</text>
{/each}

{#if children}
  <foreignObject
    x={x}
    y={subtitleBaseY + (subtitleLines.length > 0 ? subtitleLines.length * lineHeight : 0)}
    width={boxWidth}
    height={boxHeight - (subtitleBaseY - y) - (subtitleLines.length > 0 ? subtitleLines.length * lineHeight : 0)}
  >
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
      {@render children()}
    </div>
  </foreignObject>
{/if}
