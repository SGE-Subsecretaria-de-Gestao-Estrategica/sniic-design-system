<script lang="ts">
  import { scaleLinear, scalePoint, line, curveMonotoneX, curveLinear, extent, type ScalePoint, type ScaleLinear } from 'd3';
  import { defaultMargin, type Margin } from '../tokens.js';
  import { categorical8 } from '../palettes.js';
  import ChartFrame from './molecules/ChartFrame.svelte';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';
  import Legend from './atoms/Legend.svelte';
  import type { Snippet } from 'svelte';

  interface DataPoint {
    label: string;
    value: number;
  }

  interface Series {
    name: string;
    color?: string;
    data: DataPoint[];
  }

  interface AnnotationContext {
    xScale: ScalePoint<string>;
    yScale: ScaleLinear<number, number>;
  }

  interface Props {
    series?: Series[];
    width?: number;
    height?: number;
    margin?: Margin;
    xLabel?: string;
    yLabel?: string;
    showDots?: boolean;
    smooth?: boolean;
    /** Snippet rendered inside the chart's inner <g>, after the lines.
     *  Receives { xScale, yScale } so annotations can be placed in data space. */
    annotations?: Snippet<[AnnotationContext]>;
    colors?: readonly string[];
  }

  let {
    series = [],
    width = 600,
    height = 400,
    margin = defaultMargin,
    xLabel = '',
    yLabel = '',
    showDots = true,
    smooth = true,
    annotations,
    colors = categorical8,
  }: Props = $props();

  const defaultColors = $derived(colors);

  const allData = $derived(series.flatMap(s => s.data));

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const labels = $derived([...new Set(allData.map(d => d.label))]);

  const xScale = $derived(
    scalePoint()
      .domain(labels)
      .range([0, innerWidth])
      .padding(0.1)
  );

  const yExtent = $derived(extent(allData, d => d.value) as [number, number]);
  const yScale = $derived(
    scaleLinear()
      .domain([Math.min(0, yExtent[0] ?? 0), yExtent[1] ?? 0])
      .nice()
      .range([innerHeight, 0])
  );

  const yTickValues = $derived(yScale.ticks(5));

  const xTicks = $derived(labels.map(l => ({ value: l, x: xScale(l) ?? 0 })));
  const yTicks = $derived(yTickValues.map(v => ({ value: v, y: yScale(v) })));
  const gridPositions = $derived(yTickValues.map(v => yScale(v)));

  const lineGen = $derived(
    line<DataPoint>()
      .x(d => xScale(d.label) ?? 0)
      .y(d => yScale(d.value))
      .curve(smooth ? curveMonotoneX : curveLinear)
  );

  const legendItems = $derived(
    series.length > 1
      ? series.map((s, i) => ({
          label: s.name,
          color: s.color ?? defaultColors[i % defaultColors.length],
        }))
      : []
  );
</script>

<ChartFrame {width} {height} {margin} bind:innerWidth bind:innerHeight ariaLabel="Line chart">
  <GridLines positions={gridPositions} length={innerWidth} />

  {#each series as s, i (s.name)}
    {@const seriesColor = s.color ?? defaultColors[i % defaultColors.length]}
    <path
      d={lineGen(s.data) ?? ''}
      fill="none"
      stroke={seriesColor}
      stroke-width="2.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    {#if showDots}
      {#each s.data as d (d.label)}
        <circle
          cx={xScale(d.label) ?? 0}
          cy={yScale(d.value)}
          r="4"
          fill={seriesColor}
          stroke="white"
          stroke-width="2"
        >
          <title>{s.name} — {d.label}: {d.value}</title>
        </circle>
      {/each}
    {/if}
  {/each}

  {@render annotations?.({ xScale, yScale })}

  <XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} />
  <YAxis ticks={yTicks} {innerHeight} label={yLabel} />

  {#if legendItems.length > 0}
    <g transform="translate(0, {-margin.top + 4})">
      <Legend items={legendItems} spacing={100} />
    </g>
  {/if}
</ChartFrame>
