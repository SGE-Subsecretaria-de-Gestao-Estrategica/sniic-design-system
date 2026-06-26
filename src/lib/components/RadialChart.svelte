<script lang="ts">
  import { scaleLinear } from 'd3';
  import { typography } from '../tokens.js';
  import { categorical8 } from '../palettes.js';
  import Legend from './atoms/Legend.svelte';
  import type { Component } from 'svelte';

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
    icons?: Record<string, Component<{ size?: number; color?: string; title?: string }>>;
    iconSize?: number;
  }

  let {
    series = [],
    maxValue,
    levels = 5,
    size = 400,
    dotRadius = 6,
    strokeWidth = 2,
    format = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, ''),
    showDots = true,
    showLevelLabels = true,
    showLegend = true,
    fillOpacity = 0.15,
    colors = categorical8,
    icons = {},
    iconSize = 32,
  }: Props = $props();

  const defaultColors = $derived(colors);
  const chartFont = typography.chartValueFontFamily;

  const hasIcons = $derived(Object.keys(icons).length > 0);
  const margin = $derived(hasIcons ? 72 + iconSize / 2 : 72);
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

  const legendItems = $derived(
    series.length > 1
      ? seriesShapes.map(s => ({ label: s.name, color: s.color }))
      : []
  );
</script>

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
        stroke="var(--chart-grid, #e2e8f0)"
        stroke-opacity="0.5"
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
        stroke="var(--chart-grid, #e2e8f0)"
        stroke-opacity="0.5"
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
          fill="var(--chart-fg, #64748b)"
          text-anchor="start"
          dominant-baseline="auto"
        >{format(levelValues[li])}</text>
      {/each}
    {/if}

    <!-- Axis labels -->
    {#each axisLabels as al (al.label)}
      {#if icons[al.label]}
        {@const IconComponent = icons[al.label]}
        <foreignObject
          x={al.x - iconSize / 2 + (al.anchor === 'end' ? -iconSize / 2 : al.anchor === 'start' ? iconSize / 2 : 0)}
          y={al.y - iconSize / 2}
          width={iconSize}
          height={iconSize}
        >
          <div xmlns="http://www.w3.org/1999/xhtml" class="icon-wrapper">
            <IconComponent size={iconSize} color="var(--chart-fg-strong, #000000)" title={al.label} />
          </div>
        </foreignObject>
      {:else}
        <text
          x={al.x}
          y={al.y}
          font-size={typography.sizes.sm}
          fill="var(--chart-fg-strong, #000000)"
          text-anchor={al.anchor}
          dominant-baseline="middle"
          font-weight="600"
        >{al.label}</text>
      {/if}
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
            stroke="var(--chart-bg, white)"
            stroke-width="1.5"
          >
            <title>{axes[pi]}: {format(pt.value)}</title>
          </circle>
        {/each}
      {/if}
    {/each}

    <!-- Legend -->
    {#if showLegend && legendItems.length > 0}
      <g transform="translate(12, {size - 12 - legendItems.length * 20})">
        <Legend items={legendItems} direction="col" spacing={20} />
      </g>
    {/if}
  {/if}
</svg>

<style>
  svg {
    display: block;
  }
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
