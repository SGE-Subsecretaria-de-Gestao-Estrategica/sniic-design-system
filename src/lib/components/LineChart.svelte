<script lang="ts">
  import { scaleLinear, scalePoint, line, curveMonotoneX, curveLinear, extent } from 'd3';
  import { colors, defaultMargin, typography, type Margin } from '../tokens.js';

  interface DataPoint {
    label: string;
    value: number;
  }

  interface Series {
    name: string;
    color?: string;
    data: DataPoint[];
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
  }: Props = $props();

  const allData     = $derived(series.flatMap(s => s.data));
  const innerWidth  = $derived(width - margin.left - margin.right);
  const innerHeight = $derived(height - margin.top - margin.bottom);

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

  const yTicks = $derived(yScale.ticks(5));

  const lineGen = $derived(
    line<DataPoint>()
      .x(d => xScale(d.label) ?? 0)
      .y(d => yScale(d.value))
      .curve(smooth ? curveMonotoneX : curveLinear)
  );

  const defaultColors = colors.primary;
</script>

<svg {width} {height} role="img" aria-label="Line chart">
  <g transform="translate({margin.left},{margin.top})">
    <!-- Grid lines -->
    {#each yTicks as tick}
      <line
        x1={0} x2={innerWidth}
        y1={yScale(tick)} y2={yScale(tick)}
        stroke="#e2e8f0" stroke-width="1"
      />
    {/each}

    <!-- Series lines & dots -->
    {#each series as s, i}
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
        {#each s.data as d}
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

    <!-- X axis -->
    <g transform="translate(0,{innerHeight})">
      <line x1={0} x2={innerWidth} stroke="#94a3b8" />
      {#each labels as label}
        <text
          x={xScale(label) ?? 0}
          y={20}
          text-anchor="middle"
          font-size={typography.sizes.sm}
          fill="#64748b"
          font-family={typography.fontFamily}
        >{label}</text>
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

    <!-- Legend -->
    {#if series.length > 1}
      {#each series as s, i}
        {@const seriesColor = s.color ?? defaultColors[i % defaultColors.length]}
        <g transform="translate({i * 100}, {-margin.top + 4})">
          <rect x={0} y={0} width={12} height={12} rx={2} fill={seriesColor} />
          <text
            x={16} y={10}
            font-size={typography.sizes.sm}
            fill="#334155"
            font-family={typography.fontFamily}
          >{s.name}</text>
        </g>
      {/each}
    {/if}
  </g>
</svg>
