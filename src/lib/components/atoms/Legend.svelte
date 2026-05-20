<script lang="ts">
  import { typography } from '../../tokens.js';

  interface LegendItem {
    label: string;
    color: string;
  }

  interface Props {
    items: LegendItem[];
    /** Shape of the color swatch. */
    swatch?: 'rect' | 'circle';
    /** Layout direction for items. */
    direction?: 'row' | 'col';
    /** Pixels between each item along the layout axis. */
    spacing?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
  }

  let {
    items,
    swatch = 'rect',
    direction = 'row',
    spacing = 100,
    fontSize = typography.sizes.sm,
    color = 'var(--chart-fg, #64748b)',
    fontFamily = typography.fontFamily,
  }: Props = $props();
</script>

<g>
  {#each items as item, i}
    <g transform={direction === 'row'
      ? `translate(${i * spacing}, 0)`
      : `translate(0, ${i * spacing})`}
    >
      {#if swatch === 'rect'}
        <rect width={10} height={10} rx={2} fill={item.color} />
      {:else}
        <circle r={5} cx={5} cy={5} fill={item.color} opacity={0.8} />
      {/if}
      <text
        x={14}
        y={9}
        font-size={fontSize}
        fill={color}
        font-family={fontFamily}
      >{item.label}</text>
    </g>
  {/each}
</g>
