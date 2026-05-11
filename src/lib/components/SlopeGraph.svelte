<script lang="ts">
  import { scaleLinear, extent } from 'd3';
  import { typography, type Margin } from '../tokens.js';
  import { categorical8 } from '../palettes.js';

  interface Item {
    name: string;
    startValue: number;
    endValue: number;
    color?: string;
  }

  interface Props {
    items?: Item[];
    startLabel?: string;
    endLabel?: string;
    width?: number;
    height?: number;
    margin?: Margin;
    format?: (v: number) => string;
    showValues?: boolean;
    strokeWidth?: number;
    dotRadius?: number;
    colors?: readonly string[];
  }

  let {
    items = [],
    startLabel = 'Start',
    endLabel = 'End',
    width = 600,
    height = 400,
    margin = { top: 40, right: 140, bottom: 40, left: 140 },
    format = (v: number) => String(v),
    showValues = true,
    strokeWidth = 2,
    dotRadius = 5,
    colors = categorical8,
  }: Props = $props();

  const defaultColors = $derived(colors);

  const innerWidth  = $derived(width  - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top  - margin.bottom);

  const allValues = $derived(items.flatMap(d => [d.startValue, d.endValue]));
  const yExtent   = $derived(extent(allValues) as [number, number]);

  const yScale = $derived(
    scaleLinear()
      .domain([Math.min(0, yExtent[0] ?? 0), yExtent[1] ?? 1])
      .nice()
      .range([innerHeight, 0])
  );

  const labelPad = 10;
</script>

<svg {width} {height} role="img" aria-label="Slope graph">
  <g transform="translate({margin.left},{margin.top})">

    <!-- Vertical axis lines -->
    <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#e2e8f0" stroke-width="1" />
    <line x1={innerWidth} y1={0} x2={innerWidth} y2={innerHeight} stroke="#e2e8f0" stroke-width="1" />

    <!-- Column headers -->
    <text
      x={0}
      y={-16}
      text-anchor="middle"
      font-size={typography.sizes.sm}
      font-family={typography.fontFamily}
      fill="#64748b"
      font-weight="600"
    >{startLabel}</text>
    <text
      x={innerWidth}
      y={-16}
      text-anchor="middle"
      font-size={typography.sizes.sm}
      font-family={typography.fontFamily}
      fill="#64748b"
      font-weight="600"
    >{endLabel}</text>

    <!-- Slopes -->
    {#each items as item, i (item.name)}
      {@const color = item.color ?? defaultColors[i % defaultColors.length]}
      {@const y0 = yScale(item.startValue)}
      {@const y1 = yScale(item.endValue)}

      <line
        x1={0}
        y1={y0}
        x2={innerWidth}
        y2={y1}
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
      >
        <title>{item.name}: {format(item.startValue)} → {format(item.endValue)}</title>
      </line>

      <!-- Start dot -->
      <circle cx={0} cy={y0} r={dotRadius} fill={color} stroke="white" stroke-width="1.5" />
      <!-- End dot -->
      <circle cx={innerWidth} cy={y1} r={dotRadius} fill={color} stroke="white" stroke-width="1.5" />

      <!-- Left label -->
      <text
        x={-labelPad - dotRadius}
        y={y0}
        text-anchor="end"
        dominant-baseline="middle"
        font-size={typography.sizes.sm}
        font-family={typography.fontFamily}
        fill={color}
      >
        {item.name}{#if showValues} <tspan fill="#64748b">{format(item.startValue)}</tspan>{/if}
      </text>

      <!-- Right label -->
      <text
        x={innerWidth + labelPad + dotRadius}
        y={y1}
        text-anchor="start"
        dominant-baseline="middle"
        font-size={typography.sizes.sm}
        font-family={typography.fontFamily}
        fill={color}
      >
        {item.name}{#if showValues} <tspan fill="#64748b">{format(item.endValue)}</tspan>{/if}
      </text>
    {/each}

  </g>
</svg>
