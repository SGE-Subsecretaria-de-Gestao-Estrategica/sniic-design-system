<script lang="ts">
  import { typography } from '../../tokens.js';

  interface Tick {
    value: string | number;
    y: number;
  }

  interface Props {
    ticks: Tick[];
    innerHeight?: number;
    label?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    /** Distance from the axis line to the rotated label text. */
    labelOffset?: number;
    /** Horizontal offset for tick labels (negative = left of axis). */
    tickOffset?: number;
    showLine?: boolean;
  }

  let {
    ticks,
    innerHeight,
    label = '',
    color = '#64748b',
    fontSize = typography.sizes.sm,
    fontFamily = typography.fontFamily,
    labelOffset = 36,
    tickOffset = -8,
    showLine = true,
  }: Props = $props();
</script>

<g>
  {#if showLine && innerHeight != null}
    <line y1={0} y2={innerHeight} stroke={color} />
  {/if}

  {#each ticks as tick}
    <text
      x={tickOffset}
      y={tick.y}
      text-anchor="end"
      dominant-baseline="middle"
      font-size={fontSize}
      fill={color}
      font-family={fontFamily}
    >{tick.value}</text>
  {/each}

  {#if label}
    <text
      transform="rotate(-90)"
      x={-(innerHeight ?? 0) / 2}
      y={-labelOffset}
      text-anchor="middle"
      font-size={fontSize}
      fill={color}
      font-family={fontFamily}
    >{label}</text>
  {/if}
</g>
