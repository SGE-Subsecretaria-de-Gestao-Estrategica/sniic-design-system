<script lang="ts">
  import { scaleLinear } from 'd3';
  import { black, typography } from '../tokens.js';
  import { categorical8 } from '../palettes.js';

  interface DataPoint {
    axis: string;
    value: number;
  }

  interface Series {
    name: string;
    values: DataPoint[];
    color?: string;
  }

  interface Props {
    series?: Series[];
    maxValue?: number;
    levels?: number;
    size?: number;
    dotRadius?: number;
    strokeWidth?: number;
    format?: (v: number) => string;
    showDots?: boolean;
    showLevelLabels?: boolean;
    showLegend?: boolean;
    fillOpacity?: number;
    colors?: readonly string[];
  }

  let {
    series = [],
    maxValue,
    levels = 5,
    size = 400,
    dotRadius = 4,
    strokeWidth = 2,
    format = (v: number) => String(v),
    showDots = true,
    showLevelLabels = true,
    showLegend = true,
    fillOpacity = 0.15,
    colors = categorical8,
  }: Props = $props();

  const defaultColors = $derived(colors);
  const chartFont = typography.chartValueFontFamily;

  const margin = 72;
  const cx = $derived(size / 2);
  const cy = $derived(size / 2);
  const radius = $derived(size / 2 - margin);

  const axes = $derived(
    series.length === 0
      ? []
      : [...new Set(series.flatMap(s => s.values.map(v => v.axis)))]
  );

  const n = $derived(axes.length);

  const domainMax = $derived(
    maxValue ?? Math.max(1, ...series.flatMap(s => s.values.map(v => v.value)))
  );

  const rScale = $derived(scaleLinear().domain([0, domainMax]).range([0, radius]));

  const levelRadii = $derived(
    Array.from({ length: levels }, (_, i) => radius * ((i + 1) / levels))
  );

  const levelValues = $derived(
    Array.from({ length: levels }, (_, i) => domainMax * ((i + 1) / levels))
  );

  function angle(i: number, total: number): number {
    return (Math.PI * 2 * i) / total - Math.PI / 2;
  }

  function polarX(r: number, i: number, total: number, originX: number): number {
    return originX + r * Math.cos(angle(i, total));
  }

  function polarY(r: number, i: number, total: number, originY: number): number {
    return originY + r * Math.sin(angle(i, total));
  }

  const gridPolygons = $derived(
    levelRadii.map(r =>
      Array.from({ length: n }, (_, i) =>
        `${polarX(r, i, n, cx)},${polarY(r, i, n, cy)}`
      ).join(' ')
    )
  );

  const axisEndPoints = $derived(
    axes.map((_, i) => ({
      x2: polarX(radius, i, n, cx),
      y2: polarY(radius, i, n, cy),
    }))
  );

  const axisLabels = $derived(
    axes.map((label, i) => {
      const pad = 18;
      const x = polarX(radius + pad, i, n, cx);
      const y = polarY(radius + pad, i, n, cy);
      // anchor based on horizontal position
      const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
      return { label, x, y, anchor };
    })
  );

  const seriesShapes = $derived(
    series.map((s, si) => {
      const color = s.color ?? defaultColors[si % defaultColors.length];
      const points = axes.map((axis, i) => {
        const d = s.values.find(v => v.axis === axis);
        const r = rScale(d?.value ?? 0);
        return {
          x: polarX(r, i, n, cx),
          y: polarY(r, i, n, cy),
          value: d?.value ?? 0,
        };
      });
      const pathD =
        points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
      return { color, points, pathD, name: s.name };
    })
  );

  // Level label position: top of the chart (index 0 is up, -π/2)
  const levelLabelX = $derived(cx);
  const levelLabelY = $derived.by(() => (r: number) => cy - r);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svg
  width={size}
  height={size}
  role="img"
  aria-label="Radial chart"
  font-family={chartFont}
  style="overflow: visible;"
>
  {#if n >= 3}
    <!-- Grid polygons -->
    {#each gridPolygons as points, li (li)}
      <polygon
        {points}
        fill="none"
        stroke={black}
        stroke-opacity="0.12"
        stroke-width="1"
        stroke-dasharray="3,3"
      />
    {/each}

    <!-- Axis lines -->
    {#each axisEndPoints as ep, ei (ei)}
      <line
        x1={cx}
        y1={cy}
        x2={ep.x2}
        y2={ep.y2}
        stroke={black}
        stroke-opacity="0.15"
        stroke-width="1"
      />
    {/each}

    <!-- Level labels -->
    {#if showLevelLabels}
      {#each levelRadii as r, li (li)}
        <text
          x={levelLabelX + 3}
          y={levelLabelY(r)}
          font-size={typography.sizes.xs}
          fill="#64748b"
          text-anchor="start"
          dominant-baseline="auto"
        >{format(levelValues[li])}</text>
      {/each}
    {/if}

    <!-- Axis labels -->
    {#each axisLabels as al (al.label)}
      <text
        x={al.x}
        y={al.y}
        font-size={typography.sizes.sm}
        fill={black}
        text-anchor={al.anchor}
        dominant-baseline="middle"
        font-weight="600"
      >{al.label}</text>
    {/each}

    <!-- Series -->
    {#each seriesShapes as shape (shape.name)}
      <path
        d={shape.pathD}
        fill={shape.color}
        fill-opacity={fillOpacity}
        stroke={shape.color}
        stroke-width={strokeWidth}
        stroke-linejoin="round"
      >
        <title>{shape.name}</title>
      </path>

      {#if showDots}
        {#each shape.points as pt, pi (pi)}
          <circle
            cx={pt.x}
            cy={pt.y}
            r={dotRadius}
            fill={shape.color}
            stroke="white"
            stroke-width="1.5"
          >
            <title>{axes[pi]}: {format(pt.value)}</title>
          </circle>
        {/each}
      {/if}
    {/each}

    <!-- Legend -->
    {#if showLegend && series.length > 1}
      {@const legendX = 12}
      {@const legendY = size - 12 - series.length * 20}
      {#each seriesShapes as shape, si (shape.name)}
        <rect
          x={legendX}
          y={legendY + si * 20}
          width={12}
          height={12}
          rx="2"
          fill={shape.color}
          fill-opacity="0.85"
        />
        <text
          x={legendX + 18}
          y={legendY + si * 20 + 6}
          font-size={typography.sizes.sm}
          fill={black}
          dominant-baseline="middle"
        >{shape.name}</text>
      {/each}
    {/if}
  {/if}
</svg>

<style>
  svg {
    display: block;
  }
</style>
