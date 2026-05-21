<script lang="ts">
  import {
    scaleLinear, extent,
    contourDensity,
  } from 'd3';
  import { geoPath } from 'd3-geo';
  import { colorScales, defaultMargin, typography, type Margin } from '../tokens.js';
  import ChartFrame from './molecules/ChartFrame.svelte';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';
  import GradientLegend from './atoms/GradientLegend.svelte';

  export interface ContourPoint {
    x: number;
    y: number;
  }

  interface Props {
    data?: ContourPoint[];
    height?: number;
    margin?: Margin;
    colorRange?: readonly string[];
    xLabel?: string;
    yLabel?: string;
    /** Number of contour thresholds (more = finer bands). */
    thresholds?: number;
    /** Bandwidth for kernel density estimation. */
    bandwidth?: number;
    /** Show individual data points. */
    showPoints?: boolean;
    pointRadius?: number;
    pointColor?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    format?: (v: number) => string;
    xTickCount?: number;
    yTickCount?: number;
  }

  let {
    data = [],
    height = 400,
    margin = defaultMargin,
    colorRange = colorScales.purple,
    xLabel = '',
    yLabel = '',
    thresholds = 20,
    bandwidth = 20,
    showPoints = false,
    pointRadius = 1.5,
    pointColor = 'var(--chart-fg, #00000044)',
    showLegend = true,
    showGrid = true,
    format = (v: number) => v.toFixed(3),
    xTickCount = 6,
    yTickCount = 6,
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;
  const legendHeight = 28;
  const legendWidth = 140;

  const legendReserve = $derived(showLegend ? legendHeight + 12 : 0);
  const totalHeight = $derived(height + legendReserve);
  const frameMargin = $derived({
    ...margin,
    bottom: margin.bottom + legendReserve,
  });

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const xExtent = $derived((extent(data, d => d.x) as [number, number]) ?? [0, 1]);
  const yExtent = $derived((extent(data, d => d.y) as [number, number]) ?? [0, 1]);

  const xScale = $derived(
    scaleLinear().domain(xExtent).range([0, innerWidth]).nice()
  );
  const yScale = $derived(
    scaleLinear().domain(yExtent).range([innerHeight, 0]).nice()
  );

  const contours = $derived.by(() => {
    if (innerWidth <= 0 || innerHeight <= 0 || data.length < 2) return [];
    return contourDensity<ContourPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .size([innerWidth, innerHeight])
      .bandwidth(bandwidth)
      .thresholds(thresholds)(data);
  });

  const densityExtent = $derived.by(() => {
    if (contours.length === 0) return [0, 1] as [number, number];
    return [contours[0].value, contours[contours.length - 1].value] as [number, number];
  });

  const fillScale = $derived.by(() => {
    const [lo, hi] = densityExtent;
    const n = colorRange.length;
    const domain = Array.from({ length: n }, (_, i) => lo + (hi - lo) * (i / (n - 1)));
    return scaleLinear<string>().domain(domain).range([...colorRange]);
  });

  const pathGen = $derived(geoPath());

  const xTicks = $derived(
    xScale.ticks(xTickCount).map(v => ({ value: v, x: xScale(v) }))
  );
  const yTicks = $derived(
    yScale.ticks(yTickCount).map(v => ({ value: v, y: yScale(v) }))
  );

  const legendBarY = $derived(innerHeight + margin.bottom - legendReserve + 28);
</script>

<ChartFrame
  responsive
  height={totalHeight}
  margin={frameMargin}
  bind:innerWidth
  bind:innerHeight
  ariaLabel="Contour density plot"
>
  {#if showGrid}
    <GridLines
      type="horizontal"
      positions={yTicks.map(t => t.y)}
      length={innerWidth}
    />
    <GridLines
      type="vertical"
      positions={xTicks.map(t => t.x)}
      length={innerHeight}
    />
  {/if}

  <!-- Contour bands -->
  {#each contours as contour, i (i)}
    <path
      d={pathGen(contour) ?? ''}
      fill={fillScale(contour.value)}
      stroke={fillScale(contour.value)}
      stroke-width={0.5}
      opacity={0.85}
    >
      <title>density: {format(contour.value)}</title>
    </path>
  {/each}

  <!-- Data points -->
  {#if showPoints}
    {#each data as pt, i (i)}
      <circle
        cx={xScale(pt.x)}
        cy={yScale(pt.y)}
        r={pointRadius}
        fill={pointColor}
      />
    {/each}
  {/if}

  <XAxis
    ticks={xTicks}
    {innerHeight}
    {innerWidth}
    label={xLabel}
    fontFamily={chartFont}
  />
  <YAxis
    ticks={yTicks}
    {innerHeight}
    label={yLabel}
    fontFamily={chartFont}
  />

  {#if showLegend}
    <g transform="translate(0,{legendBarY})">
      <GradientLegend
        colorRange={[...colorRange]}
        min={densityExtent[0]}
        max={densityExtent[1]}
        width={legendWidth}
        {format}
      />
    </g>
  {/if}
</ChartFrame>
