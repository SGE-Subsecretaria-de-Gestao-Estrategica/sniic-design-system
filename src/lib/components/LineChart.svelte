<script lang="ts">
  import { scaleLinear, scalePoint, curveMonotoneX, curveLinear, extent, type ScalePoint, type ScaleLinear } from 'd3';
  import type { Snippet } from 'svelte';
  import Chart from '$lib/core/components/Chart.svelte';
  import Axis from '$lib/core/components/axis/Axis.svelte';
  import GridRows from '$lib/core/components/grid/GridRows.svelte';
  import LinePath from '$lib/core/components/shape/LinePath.svelte';
  import Markers from '$lib/core/components/markers/Markers.svelte';
  import Circle from '$lib/core/components/markers/Circle.svelte';
  import Legend from '$lib/core/components/legend/Legend.svelte';
  import { DefaultTheme, getCategoricalColor, getChartTheme } from '$lib/core/theme';
  import type { ChartTheme } from '$lib/core/theme/types';
  import type { Margin } from '$lib/types/Chart';

  interface DataPoint {
    label: string;
    value: number;
  }

  interface Series {
    name: string;
    color?: string;
    data: DataPoint[];
  }

  interface AnnotationContext {
    xScale: ScalePoint<string>;
    yScale: ScaleLinear<number, number>;
  }

  interface Props {
    series?: Series[];
    width?: number;
    height?: number;
    /** Merged over the theme default; pass only the sides you need. */
    margin?: Partial<Margin>;
    /** Track the container width instead of using `width`. */
    responsive?: boolean;
    /** Sets the theme for this chart; inherits an ancestor `<Theme>` when omitted. */
    theme?: ChartTheme;
    xLabel?: string;
    yLabel?: string;
    showDots?: boolean;
    smooth?: boolean;
    /**
     * Line weight. Defaults to 2.5 rather than the theme's `line.strokeWidth`,
     * which is tuned for single-series emphasis and reads far too heavy with
     * several series overlaid.
     */
    strokeWidth?: number;
    annotations?: Snippet<[AnnotationContext]>;
    /** Series colours; defaults to the theme's categorical palette. */
    colors?: readonly string[];
  }

  let {
    series = [],
    width = 600,
    height = 400,
    margin,
    responsive = false,
    theme,
    xLabel = '',
    yLabel = '',
    showDots = true,
    smooth = true,
    strokeWidth = 2.5,
    annotations,
    colors,
  }: Props = $props();

  // The prop wins, then an ancestor <Theme>, then the default — the same
  // cascade the primitives apply, resolved here because this component needs
  // palette values of its own.
  const inheritedTheme = getChartTheme();
  let activeTheme = $derived(theme ?? inheritedTheme ?? DefaultTheme);

  const allData = $derived(series.flatMap((s) => s.data));
  const labels = $derived([...new Set(allData.map((d) => d.label))]);

  const yExtent = $derived(extent(allData, (d) => d.value) as [number, number]);
  const yDomain = $derived<[number, number]>([
    Math.min(0, yExtent[0] ?? 0),
    yExtent[1] ?? 0,
  ]);

  const curve = $derived(smooth ? curveMonotoneX : curveLinear);

  function seriesColor(s: Series, index: number) {
    return (
      s.color ??
      (colors?.length ? colors[index % colors.length] : undefined) ??
      getCategoricalColor(index, activeTheme)
    );
  }

  const legendItems = $derived(
    series.length > 1
      ? series.map((s, i) => ({ label: s.name, color: seriesColor(s, i) }))
      : [],
  );

  const dotRing = $derived(activeTheme.palette?.base?.[100] ?? '#ffffff');
</script>

<Chart
  {width}
  {height}
  {margin}
  {responsive}
  {theme}
  ariaLabel="Line chart"
>
  {#snippet children({ innerWidth, innerHeight, margin: resolvedMargin })}
    {@const xScale = scalePoint<string>()
      .domain(labels)
      .range([0, innerWidth])
      .padding(0.1)}
    {@const yScale = scaleLinear()
      .domain(yDomain)
      .nice()
      .range([innerHeight, 0])}

    <GridRows scale={yScale} width={innerWidth} numTicks={5} />

    {#each series as s, i (s.name)}
      {@const color = seriesColor(s, i)}
      <LinePath
        data={s.data}
        x={(d) => xScale(d.label) ?? 0}
        y={(d) => yScale(d.value)}
        stroke={color}
        {strokeWidth}
        {curve}
        fill="none"
        stroke-linejoin="round"
      />

      {#if showDots}
        <Markers
          data={s.data}
          x={(d) => xScale(d.label) ?? 0}
          y={(d) => yScale(d.value)}
        >
          {#snippet marker({ x, y, datum })}
            <g>
              <title>{s.name} — {datum.label}: {datum.value}</title>
              <Circle
                {x}
                {y}
                size={4}
                fill={color}
                stroke={dotRing}
                strokeWidth={2}
              />
            </g>
          {/snippet}
        </Markers>
      {/if}
    {/each}

    {@render annotations?.({ xScale, yScale })}

    <Axis orientation="left" scale={yScale} numTicks={5} label={yLabel} />
    <Axis
      orientation="bottom"
      scale={xScale}
      top={innerHeight}
      label={xLabel}
    />

    {#if legendItems.length > 0}
      <Legend items={legendItems} top={-resolvedMargin.top + 4} />
    {/if}
  {/snippet}
</Chart>
