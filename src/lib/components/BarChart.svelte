<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleBand, scaleLinear, max } from 'd3';
  import { black, colors, defaultMargin, typography, type Margin } from '../tokens.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';

  interface DataPoint {
    label: string;
    value: number;
  }

  interface Props {
    data?: DataPoint[];
    height?: number;
    color?: string;
    margin?: Margin;
    xLabel?: string;
    yLabel?: string;
  }

  let {
    data = [],
    height = 400,
    color = colors.primary[0],
    margin = defaultMargin,
    xLabel = '',
    yLabel = '',
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const innerWidth  = $derived(width  - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top  - margin.bottom);

  const xScale = $derived(
    scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.25)
  );

  const yScale = $derived(
    scaleLinear()
      .domain([0, max(data, d => d.value) ?? 0])
      .nice()
      .range([innerHeight, 0])
  );

  const yTickValues = $derived(yScale.ticks(5));

  const xTicks = $derived(
    data.map(d => ({
      value: d.label,
      x: (xScale(d.label) ?? 0) + xScale.bandwidth() / 2,
    }))
  );

  const yTicks = $derived(
    yTickValues.map(v => ({ value: v, y: yScale(v) }))
  );

  const gridPositions = $derived(yTickValues.map(v => yScale(v)));

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<!-- Space Grotesk (SIL OFL) — tipografia única deste gráfico; carrega com o componente. -->
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
    <svg {width} {height} font-family={chartFont} style="overflow: visible;" role="img" aria-label="Bar chart">
      <g transform="translate({margin.left},{margin.top})">
        <GridLines positions={gridPositions} length={innerWidth} color={black} opacity={0.15} dashed />

        {#each data as d (d.label)}
          <rect
            x={xScale(d.label)}
            y={yScale(d.value)}
            width={xScale.bandwidth()}
            height={innerHeight - yScale(d.value)}
            fill={color}
            rx="3"
            opacity="0.9"
          >
            <title>{d.label}: {d.value}</title>
          </rect>
        {/each}

        <XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} fontFamily={chartFont} />
        <YAxis ticks={yTicks} {innerHeight} label={yLabel} fontFamily={chartFont} />
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
