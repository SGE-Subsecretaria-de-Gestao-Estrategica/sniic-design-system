<script lang="ts">
  import { scaleBand, scaleLinear, extent } from 'd3';
  import { colorScales, defaultMargin, typography, type Margin } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import ChartFrame from './molecules/ChartFrame.svelte';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GradientLegend from './atoms/GradientLegend.svelte';
  import type { HeatMapCell } from '../types.js';

  interface Props {
    data?: HeatMapCell[];
    height?: number;
    margin?: Margin;
    colorRange?: readonly string[];
    xLabel?: string;
    yLabel?: string;
    format?: (v: number) => string;
    showValues?: boolean;
    showLegend?: boolean;
    cellRadius?: number;
    cellGap?: number;
    xRotate?: number;
  }

  let {
    data = [],
    height = 400,
    margin = defaultMargin,
    colorRange = colorScales.blue,
    xLabel = '',
    yLabel = '',
    format = (v: number) => String(v),
    showValues = false,
    showLegend = true,
    cellRadius = 3,
    cellGap = 4,
    xRotate = 0,
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;

  const legendReserve = $derived(showLegend ? 60 : 0);
  const totalHeight = $derived(height + legendReserve);
  const frameMargin = $derived({
    ...margin,
    bottom: margin.bottom + legendReserve,
  });

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const xDomain = $derived([...new Set(data.map(d => d.x))]);
  const yDomain = $derived([...new Set(data.map(d => d.y))]);

  const xPadding = $derived(
    innerWidth > 0 ? (cellGap * xDomain.length) / (innerWidth + cellGap) : 0
  );
  const yPadding = $derived(
    innerHeight > 0 ? (cellGap * yDomain.length) / (innerHeight + cellGap) : 0
  );

  const xScale = $derived(
    scaleBand().domain(xDomain).range([0, innerWidth]).paddingInner(xPadding)
  );

  const yScale = $derived(
    scaleBand().domain(yDomain).range([0, innerHeight]).paddingInner(yPadding)
  );

  const valueExtent = $derived(
    (extent(data, d => d.value) as [number, number]) ?? [0, 1]
  );

  const colorScale = $derived.by(() => {
    const [lo, hi] = valueExtent;
    const n = colorRange.length;
    const domain = Array.from({ length: n }, (_, i) => lo + (hi - lo) * (i / (n - 1)));
    return scaleLinear<string>().domain(domain).range([...colorRange]);
  });

  const xTicks = $derived(
    xDomain.map(v => ({ value: v, x: (xScale(v) ?? 0) + xScale.bandwidth() / 2 }))
  );

  const yTicks = $derived(
    yDomain.map(v => ({ value: v, y: (yScale(v) ?? 0) + yScale.bandwidth() / 2 }))
  );

  // Show value label only when cell is tall enough
  const minCellForLabel = 16;
  const showCellValues = $derived(
    showValues && yScale.bandwidth() >= minCellForLabel && xScale.bandwidth() >= minCellForLabel
  );

  const legendBarY = $derived(innerHeight + margin.bottom + 12);
</script>

<ChartFrame
  responsive
  height={totalHeight}
  margin={frameMargin}
  bind:innerWidth
  bind:innerHeight
  ariaLabel="Heat map"
>
  <!-- Cells -->
  {#each data as cell (`${cell.x}__${cell.y}`)}
    {@const cx = xScale(cell.x) ?? 0}
    {@const cy = yScale(cell.y) ?? 0}
    {@const cw = xScale.bandwidth()}
    {@const ch = yScale.bandwidth()}
    {@const fill = colorScale(cell.value)}
    <rect
      x={cx}
      y={cy}
      width={cw}
      height={ch}
      rx={cellRadius}
      {fill}
    >
      <title>{cell.x} / {cell.y}: {format(cell.value)}</title>
    </rect>

    {#if showCellValues}
      <text
        x={cx + cw / 2}
        y={cy + ch / 2}
        text-anchor="middle"
        dominant-baseline="middle"
        font-size={typography.sizes.xs}
        fill={getContrastColor(fill)}
      >{format(cell.value)}</text>
    {/if}
  {/each}

  <XAxis
    ticks={xTicks}
    {innerHeight}
    {innerWidth}
    label={xLabel}
    fontFamily={chartFont}
    rotate={xRotate}
    showLine={false}
  />
  <YAxis
    ticks={yTicks}
    {innerHeight}
    label={yLabel}
    fontFamily={chartFont}
    showLine={false}
  />

  <!-- Gradient legend -->
  {#if showLegend}
    <g transform="translate(0,{legendBarY})">
      <GradientLegend
        colorRange={[...colorRange]}
        min={valueExtent[0]}
        max={valueExtent[1]}
        width={innerWidth}
        {format}
      />
    </g>
  {/if}
</ChartFrame>
