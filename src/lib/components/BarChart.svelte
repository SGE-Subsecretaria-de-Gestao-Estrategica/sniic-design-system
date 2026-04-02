<script lang="ts">
  import { scaleBand, scaleLinear, max } from 'd3';
  import { colors, defaultMargin, typography, type Margin } from '../tokens.js';

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

  const innerWidth  = $derived(width - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top - margin.bottom);

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

  const yTicks = $derived(yScale.ticks(5));
</script>

<svg {width} {height} role="img" aria-label="Bar chart">
  <g transform="translate({margin.left},{margin.top})">
    <!-- Grid lines -->
    {#each yTicks as tick}
      <line
        x1={0} x2={innerWidth}
        y1={yScale(tick)} y2={yScale(tick)}
        stroke="#e2e8f0" stroke-width="1"
      />
    {/each}

    <!-- Bars -->
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

    <!-- X axis -->
    <g transform="translate(0,{innerHeight})">
      <line x1={0} x2={innerWidth} stroke="#94a3b8" />
      {#each data as d}
        <text
          x={(xScale(d.label) ?? 0) + xScale.bandwidth() / 2}
          y={20}
          text-anchor="middle"
          font-size={typography.sizes.sm}
          fill="#64748b"
          font-family={typography.fontFamily}
        >{d.label}</text>
      {/each}
      {#if xLabel}
        <text
          x={innerWidth / 2}
          y={36}
          text-anchor="middle"
          font-size={typography.sizes.sm}
          fill="#334155"
          font-family={typography.fontFamily}
        >{xLabel}</text>
      {/if}
    </g>

    <!-- Y axis -->
    <g>
      <line y1={0} y2={innerHeight} stroke="#94a3b8" />
      {#each yTicks as tick}
        <text
          x={-8}
          y={yScale(tick)}
          text-anchor="end"
          dominant-baseline="middle"
          font-size={typography.sizes.sm}
          fill="#64748b"
          font-family={typography.fontFamily}
        >{tick}</text>
      {/each}
      {#if yLabel}
        <text
          transform="rotate(-90)"
          x={-innerHeight / 2}
          y={-36}
          text-anchor="middle"
          font-size={typography.sizes.sm}
          fill="#334155"
          font-family={typography.fontFamily}
        >{yLabel}</text>
      {/if}
    </g>
  </g>
</svg>
