<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleLinear, scaleBand } from 'd3';
  import { red, blue, black, amber } from '../tokens.js';
  import type { GenderRow } from '../charts/genderDivergingBar.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import Legend from './atoms/Legend.svelte';

  interface Props {
    data?: GenderRow[];
    nationalAvg?: number;
  }

  let { data = [], nationalAvg = 0 }: Props = $props();

  const MARGIN = { top: 32, right: 16, bottom: 16, left: 130 };
  const ROW_H  = 22;

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const sorted  = $derived([...data].sort((a, b) => b.pctFeminino - a.pctFeminino));
  const innerH  = $derived(sorted.length * ROW_H);
  const height  = $derived(innerH + MARGIN.top + MARGIN.bottom);
  const innerW  = $derived(width - MARGIN.left - MARGIN.right);

  const xScale = $derived(scaleLinear().domain([0, 100]).range([0, innerW]));

  const yScale = $derived(
    scaleBand()
      .domain(sorted.map(d => d.uf))
      .range([0, innerH])
      .padding(0.25)
  );

  // ── Tick arrays for atoms ─────────────────────────────────────────────────

  const xTicks = $derived(
    xScale.ticks(5).map(v => ({ value: `${v}%`, x: xScale(v) }))
  );

  // Band scale: tick y is the band centre.
  const yTicks = $derived(
    sorted.map(d => ({
      value: d.uf,
      y: (yScale(d.uf) ?? 0) + yScale.bandwidth() / 2,
    }))
  );

  const legendItems = [
    { label: 'Feminino',  color: red  },
    { label: 'Masculino', color: blue },
  ];

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="chart-container">
  {#if width > 0}
    <svg {width} {height}>
      <!-- Legend sits above the chart area -->
      <g transform="translate({MARGIN.left}, 12)">
        <Legend items={legendItems} spacing={100} />
      </g>

      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <!-- Midline at 50% -->
        <line
          x1={xScale(50)} x2={xScale(50)}
          y1={0}          y2={innerH}
          stroke={black}  stroke-width={1}
        />

        <!-- National average reference line (optional) -->
        {#if nationalAvg > 0}
          <line
            x1={xScale(nationalAvg)} x2={xScale(nationalAvg)}
            y1={-8}                  y2={innerH}
            stroke={amber} stroke-width={1} stroke-dasharray="4,3"
          />
          <text x={xScale(nationalAvg) + 4} y={-12} font-size={9} fill={amber}>
            média {nationalAvg.toFixed(1)}%
          </text>
        {/if}

        <!-- Female bars (left to pctFeminino) -->
        {#each sorted as d}
          <rect
            x={0}
            y={yScale(d.uf) ?? 0}
            width={xScale(d.pctFeminino)}
            height={yScale.bandwidth()}
            rx={2} fill={red} opacity={0.85}
          />
        {/each}

        <!-- Male bars (pctFeminino to 100) -->
        {#each sorted as d}
          <rect
            x={xScale(d.pctFeminino)}
            y={yScale(d.uf) ?? 0}
            width={xScale(100 - d.pctFeminino)}
            height={yScale.bandwidth()}
            rx={2} fill={blue} opacity={0.65}
          />
        {/each}

        <!-- Female % label inside bar -->
        {#each sorted as d}
          {#if d.pctFeminino > 12}
            <text
              x={xScale(d.pctFeminino) - 4}
              y={(yScale(d.uf) ?? 0) + yScale.bandwidth() / 2}
              dy="0.35em" text-anchor="end"
              font-size={9} fill={black} font-weight={600}
            >{d.pctFeminino.toFixed(0)}%</text>
          {/if}
        {/each}

        <!-- Axes: +4 offset on x-axis to add a small gap below the bars -->
        <XAxis
          ticks={xTicks}
          innerHeight={innerH + 4}
          innerWidth={innerW}
          showLine={false}
          color="#555555"
          fontSize={9}
        />
        <YAxis
          ticks={yTicks}
          innerHeight={innerH}
          showLine={false}
          color="#a0a0a0"
          fontSize={11}
          tickOffset={-8}
        />
      </g>
    </svg>
  {/if}
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
  }
</style>
