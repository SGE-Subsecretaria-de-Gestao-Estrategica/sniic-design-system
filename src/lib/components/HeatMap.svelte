<script lang="ts">
  import { scaleBand, scaleLinear, extent } from 'd3';
  import { black, colorScales, defaultMargin, typography, type Margin } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GradientLegend from './atoms/GradientLegend.svelte';

  export interface HeatMapCell {
    x: string;
    y: string;
    value: number;
  }

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
    xRotate = 0,
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;
  const legendHeight = 28;
  const legendWidth = 160;

  let width = $state(0);

  const innerWidth  = $derived(width  - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top  - margin.bottom);

  const xDomain = $derived([...new Set(data.map(d => d.x))]);
  const yDomain = $derived([...new Set(data.map(d => d.y))]);

  const xScale = $derived(
    scaleBand().domain(xDomain).range([0, innerWidth]).padding(0.05)
  );

  const yScale = $derived(
    scaleBand().domain(yDomain).range([0, innerHeight]).padding(0.05)
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

  const totalHeight = $derived(height + (showLegend ? legendHeight + 12 : 0));

  function observeWidth(node: HTMLDivElement) {
    width = node.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(node);
    return () => ro.disconnect();
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div {@attach observeWidth} class="chart-container">
  {#if width > 0}
    <svg
      {width}
      height={totalHeight}
      font-family={chartFont}
      style="overflow: visible;"
      role="img"
      aria-label="Heat map"
    >
      <g transform="translate({margin.left},{margin.top})">
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
      </g>

      <!-- Gradient legend -->
      {#if showLegend}
        <g transform="translate({margin.left},{height + 4})">
          <GradientLegend
            colorRange={[...colorRange]}
            min={valueExtent[0]}
            max={valueExtent[1]}
            width={legendWidth}
            {format}
          />
        </g>
      {/if}
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
