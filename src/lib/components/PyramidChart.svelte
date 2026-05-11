<script lang="ts">
  import { onMount } from 'svelte';
  import { colorScales, black, typography, type Margin } from '../tokens.js';

  export interface PyramidTier {
    label: string;
    value: number;
    color?: string;
  }

  interface Props {
    tiers?: PyramidTier[];
    height?: number;
    margin?: Margin;
    showDifferences?: boolean;
    gap?: number;
    valueFormat?: (v: number) => string;
  }

  // Yellow scale dark→light (top→bottom); lighter tiers get dark text
  const defaultColors = [colorScales.yellow[4], colorScales.yellow[3], colorScales.yellow[2]];

  function isLight(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 140;
  }

  let {
    tiers = [],
    height = 380,
    margin = { top: 20, right: 160, bottom: 20, left: 20 },
    showDifferences = true,
    gap = 3,
    valueFormat = (v: number) => v.toLocaleString('pt-BR'),
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const innerWidth = $derived(width - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top - margin.bottom);

  // Sort ascending: index 0 = smallest (top of pyramid), last = largest (bottom)
  const sorted = $derived([...tiers].sort((a, b) => a.value - b.value));
  const maxVal = $derived(sorted.length > 0 ? sorted[sorted.length - 1].value : 1);
  const n = $derived(sorted.length);
  const tierH = $derived((innerHeight - gap * Math.max(n - 1, 0)) / Math.max(n, 1));
  const cx = $derived(innerWidth / 2);

  // Each tier i: top half-width = its own value, bottom half-width = next tier's value (or same for last)
  // This gives a flat top (no peak) — a truncated pyramid shape
  const halfWidths = $derived(
    sorted.map(t => (t.value / maxVal) * (innerWidth / 2))
  );

  const shapes = $derived(
    sorted.map((tier, i) => {
      const hw1 = halfWidths[i];
      const hw2 = halfWidths[i + 1] ?? halfWidths[i];
      const y1 = i * (tierH + gap);
      const y2 = y1 + tierH;
      const midY = (y1 + y2) / 2;
      const color = tier.color ?? defaultColors[i % defaultColors.length];
      const light = isLight(color);
      return {
        label: tier.label,
        value: valueFormat(tier.value),
        color,
        points: `${cx - hw1},${y1} ${cx + hw1},${y1} ${cx + hw2},${y2} ${cx - hw2},${y2}`,
        midY,
        rightX: cx + hw2,
        textFill: light ? '#3d1a00' : 'white',
        labelFill: light ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.82)',
      };
    })
  );

  const diffs = $derived(
    showDifferences
      ? sorted.slice(0, -1).map((t, i) => ({
          label: '+' + valueFormat(sorted[i + 1].value - t.value),
          y: (shapes[i].midY + shapes[i + 1].midY) / 2,
        }))
      : []
  );

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div bind:this={containerEl} class="chart-container">
  {#if width > 0}
    <svg
      {width}
      {height}
      font-family={chartFont}
      style="overflow: visible;"
      role="img"
      aria-label="Pyramid chart"
    >
      <g transform="translate({margin.left},{margin.top})">
        <!-- Tier trapezoids + inner labels -->
        {#each shapes as shape, i (i)}
          <polygon
            points={shape.points}
            fill={shape.color}
            stroke="white"
            stroke-width="1"
          />
          <!-- Value (bold, centred vertically above mid) -->
          <text
            x={cx}
            y={shape.midY - 7}
            text-anchor="middle"
            dominant-baseline="auto"
            font-size={typography.sizes.lg}
            font-weight="700"
            fill={shape.textFill}
          >{shape.value}</text>
          <!-- Tier label (smaller, below value) -->
          <text
            x={cx}
            y={shape.midY + 7}
            text-anchor="middle"
            dominant-baseline="hanging"
            font-size={typography.sizes.sm}
            font-weight="500"
            fill={shape.labelFill}
          >{shape.label}</text>
        {/each}

        <!-- Right-side connectors and tier annotations -->
        {#each shapes as shape, i (i)}
          <line
            x1={shape.rightX}
            y1={shape.midY}
            x2={innerWidth + 12}
            y2={shape.midY}
            stroke={black}
            stroke-width="1"
            stroke-opacity="0.25"
            stroke-dasharray="3,3"
          />
          <text
            x={innerWidth + 16}
            y={shape.midY}
            dominant-baseline="middle"
            font-size={typography.sizes.sm}
            font-weight="600"
            fill={black}
          >{shape.label}: {shape.value}</text>
        {/each}

        <!-- Difference annotations between adjacent tiers -->
        {#each diffs as d, i (i)}
          <text
            x={innerWidth + 16}
            y={d.y}
            dominant-baseline="middle"
            font-size={typography.sizes.xs}
            fill={black}
            opacity="0.55"
          >▲ {d.label}</text>
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
  }
</style>
