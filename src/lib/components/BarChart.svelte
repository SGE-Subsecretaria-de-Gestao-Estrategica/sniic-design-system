<script lang="ts">
  import { scaleBand, scaleLinear, max } from 'd3';
  import { colors, defaultMargin, type Margin } from '../tokens.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';

  interface DataPoint {
    label: string;
    value: number;
  }

  interface Props {
    data?: DataPoint[];
    width?: number;
    height?: number;
    color?: string;
    margin?: Margin;
    xLabel?: string;
    yLabel?: string;
  }

  let {
    data = [],
    width = 600,
    height = 400,
    color = colors.primary[0],
    margin = defaultMargin,
    xLabel = '',
    yLabel = '',
  }: Props = $props();

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
</script>

<svg {width} {height} role="img" aria-label="Bar chart">
  <g transform="translate({margin.left},{margin.top})">
    <GridLines positions={gridPositions} length={innerWidth} />

    {#each data as d}
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

    <XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} />
    <YAxis ticks={yTicks} {innerHeight} label={yLabel} />
  </g>
</svg>
