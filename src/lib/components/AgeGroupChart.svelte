<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleBand, scaleLinear, stack } from 'd3';
  import { colorScales, typography, black } from '../tokens.js';
  import type { StateAgeRow } from '../charts/ageGroupChart.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';
  import Legend from './atoms/Legend.svelte';

  interface Props {
    data?: StateAgeRow[];
  }

  let { data = [] }: Props = $props();

  const MARGIN = { top: 16, right: 24, bottom: 60, left: 60 };
  const HEIGHT = 260;
  const STROKE_W = 0.5;
  const LEGEND_SPACING = 110;

  const chartFont = typography.chartValueFontFamily;

  const COLORS  = { youth: colorScales.yellow[2], adult: colorScales.blue[2], senior: colorScales.lime[2] } as const;
  const LABELS  = { youth: '15–29 anos', adult: '30–59 anos', senior: '60+ anos' } as const;

  // D3 stack generator is stateless after keys() — safe to define once.
  type NormRow = { uf: string; youth: number; adult: number; senior: number };
  const stackGen = stack<NormRow>().keys(['senior', 'adult', 'youth']);

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const innerW = $derived(width  - MARGIN.left - MARGIN.right);
  const innerH = $derived(HEIGHT - MARGIN.top  - MARGIN.bottom);

  // Normalise to % of total, sort by youth descending.
  const normalised = $derived(
    data
      .map(d => {
        const total = d.youth + d.adult + d.senior || 1;
        return {
          uf:     d.uf,
          youth:  (d.youth  / total) * 100,
          adult:  (d.adult  / total) * 100,
          senior: (d.senior / total) * 100,
        };
      })
      .sort((a, b) => b.youth - a.youth)
  );

  const xScale = $derived(
    scaleBand()
      .domain(normalised.map(d => d.uf))
      .range([0, innerW])
      .padding(0.25)
  );

  const yScale = $derived(scaleLinear().domain([0, 100]).range([innerH, 0]));

  // Stack layout: array of 3 layers (senior, adult, youth), each with n data points.
  const stackLayout = $derived(stackGen(normalised));

  const yTickValues = $derived(yScale.ticks(4));

  // Band-scale x-axis: tick at centre of each band.
  const xTicks = $derived(
    normalised.map(d => ({
      value: d.uf,
      x: (xScale(d.uf) ?? 0) + xScale.bandwidth() / 2,
    }))
  );

  const yTicks         = $derived(yTickValues.map(v => ({ value: `${v}%`, y: yScale(v) })));
  const gridPositions  = $derived(yTickValues.map(v => yScale(v)));

  const legendItems = Object.entries(COLORS).map(([key, color]) => ({
    label: LABELS[key as keyof typeof LABELS],
    color,
  }));

  const legendCenterX = $derived(innerW / 2 - ((legendItems.length - 1) * LEGEND_SPACING) / 2);

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
    <svg {width} height={HEIGHT} font-family={chartFont}>
      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <!-- Horizontal grid lines (dashed, dark) -->
        <GridLines positions={gridPositions} length={innerW} color={black} opacity={0.15} dashed />

        <!-- Stacked bars: layers are [senior, adult, youth] bottom→top -->
        {#each stackLayout as layer}
          {@const fill = COLORS[layer.key as keyof typeof COLORS]}
          {#each layer as segment}
            <rect
              x={xScale(segment.data.uf) ?? 0}
              y={yScale(segment[1])}
              width={xScale.bandwidth()}
              height={Math.max(0, yScale(segment[0]) - yScale(segment[1]))}
              fill={fill}
              stroke={black}
              stroke-width={STROKE_W}
              shape-rendering="crispEdges"
              rx={2}
            />
          {/each}
        {/each}

        <!-- Rotated UF labels on x-axis -->
        <XAxis
          ticks={xTicks}
          innerHeight={innerH}
          innerWidth={innerW}
          showLine={false}
          rotate={-45}
          color="#555555"
          fontSize={9}
          fontFamily={chartFont}
        />

        <!-- Y axis with % ticks -->
        <YAxis
          ticks={yTicks}
          innerHeight={innerH}
          showLine={false}
          color="#555555"
          fontSize={10}
          fontFamily={chartFont}
        />
      </g>

      <!-- Legend centered below the chart -->
      <g transform="translate({MARGIN.left + legendCenterX}, {MARGIN.top + innerH + 40})">
        <Legend items={legendItems} spacing={LEGEND_SPACING} fontFamily={chartFont} />
      </g>
    </svg>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    background-color: #ffffdeff;
  }
  svg {
    display: block;
    width: 100%;
  }
</style>
