<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3';
  import { colorScales, defaultMargin, typography, type Margin } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import ChartFrame from './molecules/ChartFrame.svelte';
  import GradientLegend from './atoms/GradientLegend.svelte';
  import type { CorrelationDatum } from '../types.js';

  interface Props {
    data?: CorrelationDatum[];
    height?: number;
    margin?: Margin;
    /** Color for negative values (−1). */
    negativeColor?: string;
    /** Color for the neutral midpoint (0). */
    neutralColor?: string;
    /** Color for positive values (+1). */
    positiveColor?: string;
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
    negativeColor = colorScales.red[2],
    neutralColor = '#f5f5f5',
    positiveColor = colorScales.blue[2],
    format = (v: number) => v.toFixed(2),
    showValues = true,
    showLegend = true,
    cellRadius = 3,
    cellGap = 4,
    xRotate = -45,
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;
  const legendHeight = 28;
  const legendWidth = 180;

  const legendReserve = $derived(showLegend ? legendHeight + 12 : 0);
  const totalHeight = $derived(height + legendReserve);
  const frameMargin = $derived({
    ...margin,
    bottom: margin.bottom + legendReserve,
  });

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const variables = $derived([...new Set([...data.map(d => d.x), ...data.map(d => d.y)])]);

  const xPadding = $derived(
    innerWidth > 0 ? (cellGap * variables.length) / (innerWidth + cellGap) : 0
  );
  const yPadding = $derived(
    innerHeight > 0 ? (cellGap * variables.length) / (innerHeight + cellGap) : 0
  );

  const xScale = $derived(
    scaleBand().domain(variables).range([0, innerWidth]).paddingInner(xPadding)
  );
  const yScale = $derived(
    scaleBand().domain(variables).range([0, innerHeight]).paddingInner(yPadding)
  );

  const colorScale = $derived(
    scaleLinear<string>()
      .domain([-1, 0, 1])
      .range([negativeColor, neutralColor, positiveColor])
  );

  const xTicks = $derived(
    variables.map(v => ({ value: v, x: (xScale(v) ?? 0) + xScale.bandwidth() / 2 }))
  );
  const yTicks = $derived(
    variables.map(v => ({ value: v, y: (yScale(v) ?? 0) + yScale.bandwidth() / 2 }))
  );

  const minCellForLabel = 28;
  const showCellValues = $derived(
    showValues && yScale.bandwidth() >= minCellForLabel && xScale.bandwidth() >= minCellForLabel
  );

  const legendBarY = $derived(innerHeight + margin.bottom - legendReserve + 28);

  const divergingRange = $derived([negativeColor, neutralColor, positiveColor]);
</script>

<ChartFrame
  responsive
  height={totalHeight}
  margin={frameMargin}
  bind:innerWidth
  bind:innerHeight
  ariaLabel="Correlation matrix"
>
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

  <!-- X axis labels -->
  <g transform="translate(0,{innerHeight})">
    {#each xTicks as tick (tick.value)}
      <text
        x={tick.x}
        y={0}
        dy="0.5em"
        dx="-0.5em"
        text-anchor="end"
        font-size={typography.sizes.sm}
        fill="var(--chart-fg, #64748b)"
        font-family={chartFont}
        transform="rotate({xRotate}, {tick.x}, 0)"
      >{tick.value}</text>
    {/each}
  </g>

  <!-- Y axis labels -->
  {#each yTicks as tick (tick.value)}
    <text
      x={-8}
      y={tick.y}
      text-anchor="end"
      dominant-baseline="middle"
      font-size={typography.sizes.sm}
      fill="var(--chart-fg, #64748b)"
      font-family={chartFont}
    >{tick.value}</text>
  {/each}

  {#if showLegend}
    <g transform="translate(0,{legendBarY})">
      <GradientLegend
        colorRange={divergingRange}
        min={-1}
        max={1}
        width={legendWidth}
        format={(v) => v.toFixed(1)}
      />
    </g>
  {/if}
</ChartFrame>
