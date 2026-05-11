<script lang="ts">
  import { typography } from '../../tokens.js';

  interface Props {
    colorRange: string[];
    min: number;
    max: number;
    format?: (v: number) => string;
    width?: number;
    height?: number;
  }

  // Unique per instance — stable because script body runs once per mount.
  const gradId = `cgrad-${Math.random().toString(36).slice(2)}`;

  let {
    colorRange,
    min,
    max,
    format = (v) => v.toLocaleString(),
    width = 160,
    height = 8,
  }: Props = $props();

  const stops = $derived(
    colorRange.map((color, i) => ({
      offset: `${(i / (colorRange.length - 1)) * 100}%`,
      color,
    }))
  );
</script>

<defs>
  <linearGradient id={gradId} x1="0%" x2="100%">
    {#each stops as stop}
      <stop offset={stop.offset} stop-color={stop.color} />
    {/each}
  </linearGradient>
</defs>

<rect {width} {height} rx={2} fill="url(#{gradId})" />
<text
  x={0}
  y={height + 12}
  font-size={typography.sizes.sm}
  fill="#000000"
  font-family={typography.chartValueFontFamily}
>{format(min)}</text>
<text
  x={width}
  y={height + 12}
  text-anchor="end"
  font-size={typography.sizes.sm}
  fill="#000000"
  font-family={typography.chartValueFontFamily}
>{format(max)}</text>
