<script lang="ts">
  import { scaleLinear, scalePoint, extent } from 'd3';
  import { typography, type Margin } from '../tokens.js';
  import { categorical8 } from '../palettes.js';
  import ChartFrame from './molecules/ChartFrame.svelte';

  interface Item {
    name: string;
    values: number[];
    color?: string;
  }

  interface Props {
    items?: Item[];
    labels?: string[];
    width?: number;
    height?: number;
    margin?: Margin;
    format?: (v: number) => string;
    showValues?: boolean;
    strokeWidth?: number;
    dotRadius?: number;
    fontSize?: number;
    colors?: readonly string[];
  }

  let {
    items = [],
    labels = [],
    width = 700,
    height = 450,
    margin = { top: 40, right: 160, bottom: 40, left: 160 },
    format = (v: number) => String(v),
    showValues = true,
    strokeWidth = 2.5,
    dotRadius = 7,
    fontSize = typography.sizes.md,
    colors = categorical8,
  }: Props = $props();

  const defaultColors = $derived(colors);

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const allValues = $derived(items.flatMap(d => d.values));
  const yExtent   = $derived(extent(allValues) as [number, number]);

  const yScale = $derived(
    scaleLinear()
      .domain([yExtent[0] ?? 0, yExtent[1] ?? 1])
      .nice()
      .range([innerHeight, 0])
  );

  const xScale = $derived(
    scalePoint<number>()
      .domain(labels.map((_, i) => i))
      .range([0, innerWidth])
  );

  const labelPad = 12;
</script>

<ChartFrame {width} {height} {margin} bind:innerWidth bind:innerHeight ariaLabel="Slope graph">
  <!-- Vertical axis lines -->
  {#each labels as _, ci (ci)}
    {@const x = xScale(ci) ?? 0}
    <line x1={x} y1={0} x2={x} y2={innerHeight} stroke="var(--chart-grid, #e2e8f0)" stroke-width="1" />
  {/each}

  <!-- Column headers -->
  {#each labels as label, ci (ci)}
    {@const x = xScale(ci) ?? 0}
    <text
      x={x}
      y={-18}
      text-anchor="middle"
      font-size={fontSize}
      font-family={typography.fontFamily}
      fill="var(--chart-fg, #64748b)"
      font-weight="600"
    >{label}</text>
  {/each}

  <!-- Slopes -->
  {#each items as item, i (item.name)}
    {@const color = item.color ?? defaultColors[i % defaultColors.length]}

    <!-- Line segments -->
    {#each item.values as val, ci (ci)}
      {#if ci < item.values.length - 1}
        {@const x0 = xScale(ci) ?? 0}
        {@const x1 = xScale(ci + 1) ?? 0}
        {@const y0 = yScale(val)}
        {@const y1 = yScale(item.values[ci + 1])}
        <line
          x1={x0}
          y1={y0}
          x2={x1}
          y2={y1}
          stroke={color}
          stroke-width={strokeWidth}
          stroke-linecap="round"
        >
          <title>{item.name}: {format(val)} → {format(item.values[ci + 1])}</title>
        </line>
      {/if}
    {/each}

    <!-- Dots -->
    {#each item.values as val, ci (ci)}
      {@const x = xScale(ci) ?? 0}
      {@const y = yScale(val)}
      <circle cx={x} cy={y} r={dotRadius} fill={color} stroke="var(--chart-bg, white)" stroke-width="1.5" />
      <!-- Value labels on intermediate columns -->
      {#if showValues && ci > 0 && ci < item.values.length - 1}
        <text
          x={x}
          y={y - dotRadius - 6}
          text-anchor="middle"
          font-size={typography.sizes.sm}
          font-family={typography.fontFamily}
          fill="var(--chart-fg, #64748b)"
        >{format(val)}</text>
      {/if}
    {/each}

    <!-- Left label -->
    {@const yFirst = yScale(item.values[0])}
    <text
      x={-labelPad - dotRadius}
      y={yFirst}
      text-anchor="end"
      dominant-baseline="middle"
      font-size={fontSize}
      font-family={typography.fontFamily}
      fill={color}
      font-weight="500"
    >
      {item.name}{#if showValues} <tspan fill="var(--chart-fg, #64748b)">{format(item.values[0])}</tspan>{/if}
    </text>

    <!-- Right label -->
    {@const yLast = yScale(item.values[item.values.length - 1])}
    <text
      x={innerWidth + labelPad + dotRadius}
      y={yLast}
      text-anchor="start"
      dominant-baseline="middle"
      font-size={fontSize}
      font-family={typography.fontFamily}
      fill={color}
      font-weight="500"
    >
      {item.name}{#if showValues} <tspan fill="var(--chart-fg, #64748b)">{format(item.values[item.values.length - 1])}</tspan>{/if}
    </text>
  {/each}
</ChartFrame>
