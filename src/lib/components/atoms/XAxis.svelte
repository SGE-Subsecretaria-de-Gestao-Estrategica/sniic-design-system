<script lang="ts">
  import { typography } from '../../tokens.js';

  interface Tick {
    value: string | number;
    x: number;
  }

  interface Props {
    ticks: Tick[];
    innerHeight: number;
    innerWidth?: number;
    label?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    /** Label rotation angle in degrees (e.g. -45 for diagonal). */
    rotate?: number;
    showLine?: boolean;
  }

  let {
    ticks,
    innerHeight,
    innerWidth,
    label = '',
    color = 'var(--chart-fg, #64748b)',
    fontSize = typography.sizes.sm,
    fontFamily = typography.fontFamily,
    rotate = 0,
    showLine = true,
  }: Props = $props();

  const isRotated = $derived(rotate !== 0);
</script>

<g transform="translate(0,{innerHeight})">
  {#if showLine && innerWidth != null}
    <line x1={0} x2={innerWidth} stroke={color} />
  {/if}

  {#each ticks as tick}
    <text
      x={tick.x}
      y={0}
      dy={isRotated ? '0.5em' : '1.2em'}
      dx={isRotated ? '-0.5em' : undefined}
      text-anchor={isRotated ? 'end' : 'middle'}
      font-size={fontSize}
      fill={color}
      font-family={fontFamily}
      transform={isRotated ? `rotate(${rotate}, ${tick.x}, 0)` : undefined}
    >{tick.value}</text>
  {/each}

  {#if label}
    <text
      x={(innerWidth ?? 0) / 2}
      y={isRotated ? 44 : 34}
      text-anchor="middle"
      font-size={fontSize}
      fill={color}
      font-family={fontFamily}
    >{label}</text>
  {/if}
</g>
