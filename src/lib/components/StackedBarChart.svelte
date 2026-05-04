<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleLinear, scaleBand, stack, max } from 'd3';
  import { blue, orange, black } from '../tokens.js';
  import type { StackedBarRow } from '../charts/stackedBarChart.js';
  import { BRL } from '../utils/formatters.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';
  import Legend from './atoms/Legend.svelte';

  interface Props {
    data?: StackedBarRow[];
  }

  let { data = [] }: Props = $props();

  const MARGIN     = { top: 16, right: 120, bottom: 32, left: 130 };
  const ROW_HEIGHT = 28;
  const COLORS     = { audiovisual: blue, demais: orange } as const;

  // D3 stack generator — stateless, safe to define once.
  const stackGen = stack<StackedBarRow>().keys(['audiovisual', 'demais']);

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const sorted = $derived(
    [...data]
      .filter(d => d.uf !== 'Todos (Brasil)')
      .sort((a, b) => (b.audiovisual + b.demais) - (a.audiovisual + a.demais))
  );

  const innerW = $derived(width - MARGIN.left - MARGIN.right);
  const innerH = $derived(sorted.length * ROW_HEIGHT);
  const height = $derived(innerH + MARGIN.top + MARGIN.bottom);

  const xMax = $derived(max(sorted, d => d.audiovisual + d.demais) ?? 1);

  const xScale = $derived(
    scaleLinear().domain([0, xMax]).range([0, innerW]).nice()
  );

  const yScale = $derived(
    scaleBand()
      .domain(sorted.map(d => d.uf))
      .range([0, innerH])
      .padding(0.3)
  );

  const stackLayout = $derived(stackGen(sorted));

  // ── Tick arrays ───────────────────────────────────────────────────────────

  const xTickValues = $derived(xScale.ticks(5));

  // Band y-axis: tick at centre of each band.
  const yTicks = $derived(
    sorted.map(d => ({
      value: d.uf,
      y: (yScale(d.uf) ?? 0) + yScale.bandwidth() / 2,
    }))
  );

  const xTicks = $derived(
    xTickValues.map(v => ({ value: BRL.format(v), x: xScale(v) }))
  );

  // Vertical grid line positions.
  const xGridPositions = $derived(xTickValues.map(v => xScale(v)));

  const legendItems = Object.entries(COLORS).map(([key, color]) => ({
    label: key === 'audiovisual' ? 'Audiovisual' : 'Demais Áreas',
    color,
  }));

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="chart-container">
  {#if width > 0}
    <svg {width} {height} style="overflow: visible;">
      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <!-- Vertical grid lines -->
        <GridLines
          type="vertical"
          positions={xGridPositions}
          length={innerH}
          color={black}
          dashed
        />

        <!-- Stacked horizontal bars -->
        {#each stackLayout as layer}
          {@const fill = COLORS[layer.key as keyof typeof COLORS]}
          {#each layer as segment}
            <rect
              y={yScale(segment.data.uf) ?? 0}
              x={xScale(segment[0])}
              width={Math.max(0, xScale(segment[1]) - xScale(segment[0]))}
              height={yScale.bandwidth()}
              fill={fill}
              rx={3}
            />
          {/each}
        {/each}

        <!-- Total value labels after the last bar -->
        {#each sorted as d}
          <text
            x={xScale(d.audiovisual + d.demais) + 6}
            y={(yScale(d.uf) ?? 0) + yScale.bandwidth() / 2}
            dy="0.35em"
            font-size={10}
            fill="#a0a0a0"
          >{BRL.format(d.audiovisual + d.demais)}</text>
        {/each}

        <!-- Horizontal bar chart: Y axis (left, UF labels), X axis (bottom, BRL) -->
        <YAxis
          ticks={yTicks}
          innerHeight={innerH}
          showLine={false}
          color="#a0a0a0"
          fontSize={11}
          tickOffset={-8}
        />
        <XAxis
          ticks={xTicks}
          innerHeight={innerH}
          innerWidth={innerW}
          showLine={false}
          color="#555555"
          fontSize={10}
        />

        <!-- Legend in the right margin -->
        <g transform="translate({innerW + 12}, 8)">
          <Legend items={legendItems} direction="col" spacing={22} />
        </g>
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
