<script lang="ts">
  import { scaleLinear, extent, timeWeek, timeMonths, timeFormat } from 'd3';
  import { colorScales, typography, type Margin } from '../tokens.js';
  import ChartFrame from './molecules/ChartFrame.svelte';
  import GradientLegend from './atoms/GradientLegend.svelte';
  import type { CalendarDatum } from '../types.js';

  interface Props {
    data?: CalendarDatum[];
    height?: number;
    margin?: Margin;
    colorRange?: readonly string[];
    emptyColor?: string;
    format?: (v: number) => string;
    showLegend?: boolean;
    cellRadius?: number;
    cellGap?: number;
    weekdayLabels?: string[];
  }

  let {
    data = [],
    height = 160,
    margin = { top: 24, right: 20, bottom: 40, left: 36 },
    colorRange = colorScales.teal,
    emptyColor = '#ebedf0',
    format = (v: number) => String(v),
    showLegend = true,
    cellRadius = 2,
    cellGap = 3,
    weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  }: Props = $props();

  const chartFont = typography.chartValueFontFamily;
  const legendHeight = 28;
  const legendWidth = 120;

  const legendReserve = $derived(showLegend ? legendHeight + 12 : 0);
  const totalHeight = $derived(height + legendReserve);
  const frameMargin = $derived({
    ...margin,
    bottom: margin.bottom + legendReserve,
  });

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  // Parse dates and build lookup
  const dateMap = $derived(
    new Map(data.map(d => [d.date, d.value]))
  );

  const parsedDates = $derived(data.map(d => new Date(d.date + 'T00:00:00')));

  const dateExtent = $derived.by(() => {
    if (parsedDates.length === 0) return [new Date(), new Date()] as [Date, Date];
    const sorted = [...parsedDates].sort((a, b) => a.getTime() - b.getTime());
    return [sorted[0], sorted[sorted.length - 1]] as [Date, Date];
  });

  const valueExtent = $derived(
    (extent(data, d => d.value) as [number, number]) ?? [0, 1]
  );

  const colorScale = $derived.by(() => {
    const [lo, hi] = valueExtent;
    const n = colorRange.length;
    const domain = Array.from({ length: n }, (_, i) => lo + (hi - lo) * (i / (n - 1)));
    return scaleLinear<string>().domain(domain).range([...colorRange]);
  });

  // Build all days in range
  const allDays = $derived.by(() => {
    const [start, end] = dateExtent;
    const days: Date[] = [];
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    const endTime = end.getTime();
    while (d.getTime() <= endTime) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  });

  const firstWeek = $derived(timeWeek.floor(dateExtent[0]));

  // Cell sizing
  const cellSize = $derived.by(() => {
    if (innerHeight <= 0) return 0;
    return Math.max(4, Math.min((innerHeight - cellGap * 6) / 7, 18));
  });

  const cells = $derived(
    allDays.map(d => {
      const weekCol = timeWeek.count(firstWeek, d);
      const dayRow = d.getDay();
      const key = d.toISOString().slice(0, 10);
      const value = dateMap.get(key);
      return {
        x: weekCol * (cellSize + cellGap),
        y: dayRow * (cellSize + cellGap),
        date: key,
        value,
        fill: value != null ? colorScale(value) : emptyColor,
      };
    })
  );

  // Month labels
  const months = $derived.by(() => {
    const [start, end] = dateExtent;
    return timeMonths(start, end).map(m => ({
      label: timeFormat('%b')(m),
      x: timeWeek.count(firstWeek, m) * (cellSize + cellGap),
    }));
  });

  const legendBarY = $derived(innerHeight + margin.bottom - legendReserve + 28);
</script>

<ChartFrame
  responsive
  height={totalHeight}
  margin={frameMargin}
  bind:innerWidth
  bind:innerHeight
  ariaLabel="Calendar heatmap"
>
  <!-- Weekday labels -->
  {#each weekdayLabels as label, i (label)}
    {#if i % 2 === 1}
      <text
        x={-6}
        y={i * (cellSize + cellGap) + cellSize / 2}
        text-anchor="end"
        dominant-baseline="middle"
        font-size={typography.sizes.xs}
        fill="var(--chart-fg, #64748b)"
        font-family={chartFont}
      >{label}</text>
    {/if}
  {/each}

  <!-- Month labels -->
  {#each months as month (month.label)}
    <text
      x={month.x}
      y={-8}
      text-anchor="start"
      font-size={typography.sizes.xs}
      fill="var(--chart-fg, #64748b)"
      font-family={chartFont}
    >{month.label}</text>
  {/each}

  <!-- Day cells -->
  {#each cells as cell (cell.date)}
    <rect
      x={cell.x}
      y={cell.y}
      width={cellSize}
      height={cellSize}
      rx={cellRadius}
      fill={cell.fill}
    >
      <title>{cell.date}: {cell.value != null ? format(cell.value) : 'N/A'}</title>
    </rect>
  {/each}

  {#if showLegend}
    <g transform="translate(0,{legendBarY})">
      <GradientLegend
        colorRange={[...colorRange]}
        min={valueExtent[0]}
        max={valueExtent[1]}
        width={legendWidth}
        {format}
      />
    </g>
  {/if}
</ChartFrame>
