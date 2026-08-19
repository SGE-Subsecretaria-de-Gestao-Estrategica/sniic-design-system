<script lang="ts" module>
  export type { StackedDatum as RibbonDatum } from '../types.js';
</script>

<script lang="ts">
  import { max, scaleBand, scaleLinear, type ScaleBand, type ScaleLinear } from 'd3';
  import Chart from '$lib/core/components/Chart.svelte';
  import Axis from '$lib/core/components/axis/Axis.svelte';
  import Bar from '$lib/core/components/shape/Bar.svelte';
  import Text from '$lib/core/components/Text.svelte';
  import {
    DefaultTheme,
    getCategoricalColor,
    getPillarTheme,
    resolveThemeStyle,
  } from '$lib/core/theme';
  import type { ChartTheme } from '$lib/core/theme/types';
  import type { ChartDimensions } from '$lib/types/Chart';
  import type { StackedDatum } from '../types.js';
  import { getContrastColor } from '$lib/utils/colorContrast';
  import { measureTextWidth } from '$lib/utils/labelHelpers';
  import { deriveEffectiveKeys } from '$lib/utils/stackHelpers';
  import {
    DEFAULT_CALLOUT_STYLE,
    placeCallouts,
    type Box,
    type CalloutColumn,
    type CalloutInput,
  } from '$lib/utils/callouts';
  import ValueCallout from '$lib/core/components/annotation/ValueCallout.svelte';
  import LegendChips from '$lib/core/components/legend/LegendChips.svelte';

  interface Props {
    data?: StackedDatum[];
    /** Series keys; inferred from the first row's numeric fields when omitted. */
    keys?: string[];
    categoryKey?: string;
    labels?: Record<string, string>;
    /** Series colours in `keys` order; defaults to the theme's categorical ramp. */
    colors?: readonly string[];
    width?: number;
    height?: number;
    responsive?: boolean;
    theme?: ChartTheme;
    /** Used when no `theme` is passed and none is inherited. */
    pillar?: number;
    margin?: Partial<ChartDimensions['margin']>;
    valueFormat?: (v: number) => string;
    /** Share of each band taken by the column body; the rest carries the ribbons. */
    columnRatio?: number;
    /** Blank space between stacked segments, in px. */
    segmentGap?: number;
    /** Ribbons are drawn lighter than the columns they connect. */
    ribbonOpacity?: number;
    /** `desc` puts the largest series on top of every column, as Power BI does. */
    rankDirection?: 'desc' | 'asc';
    showValues?: boolean;
    /**
     * Corner radius of the column bodies. The theme's bar radius (2) disappears
     * at this column width, so the default is a touch larger; pass a number to
     * override, or the theme value to fall back to it.
     */
    cornerRadius?: number;
  }

  let {
    data = [],
    keys = [],
    categoryKey = 'label',
    labels = {},
    colors,
    width = 600,
    height = 420,
    responsive = true,
    theme,
    pillar = 1,
    margin,
    valueFormat = (v: number) => String(v),
    columnRatio = 0.42,
    segmentGap = 5,
    ribbonOpacity = 0.55,
    rankDirection = 'desc',
    showValues = true,
    cornerRadius = 4,
  }: Props = $props();

  const MARGIN = $derived({ top: 20, right: 20, bottom: 68, left: 56, ...margin });
  /** Breathing room a value needs inside its segment, on either axis. */
  const LABEL_PADDING = 10;
  /** Bands thinner than this are a hairline; a callout would point at nothing. */
  const MIN_ANNOTATED_HEIGHT = 3;
  /** Fallback size for bands too small for the themed value size. */
  const SMALL_VALUE_FONT_SIZE = 9;
  const CALLOUT_STYLE = { ...DEFAULT_CALLOUT_STYLE, fontSize: SMALL_VALUE_FONT_SIZE };

  const activeTheme = $derived(theme ?? getPillarTheme(pillar));

  // a passed-in theme may define only part of the palette, so fill the ramps in
  const palette = $derived({
    ...DefaultTheme.palette,
    ...activeTheme.palette,
    base: { ...DefaultTheme.palette.base, ...activeTheme.palette?.base },
    neutral: { ...DefaultTheme.palette.neutral, ...activeTheme.palette?.neutral },
  });

  const barStyle = $derived(
    resolveThemeStyle<ChartTheme, 'bar'>(
      { rx: cornerRadius },
      activeTheme.bar,
      DefaultTheme.bar,
    )!,
  );

  const valueStyle = $derived(
    resolveThemeStyle<ChartTheme, 'dataLabel'>(
      { fontSize: 11, fontWeight: 600 },
      activeTheme.dataLabel,
      DefaultTheme.dataLabel,
    )!,
  );

  const effectiveKeys = $derived(deriveEffectiveKeys(data, keys, categoryKey));

  const seriesColor = (index: number) =>
    colors?.length
      ? colors[index % colors.length]
      : getCategoricalColor(index, activeTheme);

  const legendItems = $derived(
    effectiveKeys.map((key, i) => ({ label: labels[key] ?? key, color: seriesColor(i) })),
  );

  const categories = $derived(data.map((d) => String(d[categoryKey])));
  const value = (row: StackedDatum, key: string) => Number(row[key]) || 0;

  const yMax = $derived(
    max(data, (d) => effectiveKeys.reduce((sum, k) => sum + value(d, k), 0)) ?? 1,
  );

  /**
   * Gaps are drawn in pixels, so the tallest column needs that much room above
   * its true total. Reserving it in the scale's range keeps the y axis honest.
   */
  const gapReserve = $derived(
    ((max(data, (d) => effectiveKeys.filter((k) => value(d, k) > 0).length) ?? 1) - 1) *
      segmentGap,
  );

  type Segment = {
    key: string;
    keyIndex: number;
    value: number;
    /** Rank within its column, 0 = top. */
    rank: number;
    y: number;
    height: number;
  };

  /**
   * One column per category, its segments re-ranked by value — the re-ranking is
   * what the ribbons make visible. Zero-valued series are dropped so they don't
   * open a gap for a segment nobody can see.
   */
  const columns = $derived.by(() =>
    data.map((row) => {
      const present = effectiveKeys
        .map((key, keyIndex) => ({ key, keyIndex, value: value(row, key) }))
        .filter((s) => s.value > 0)
        .sort((a, b) =>
          rankDirection === 'desc' ? b.value - a.value : a.value - b.value,
        );

      return {
        category: String(row[categoryKey]),
        series: present.map((s, rank) => ({ ...s, rank })),
      };
    }),
  );

  /** Pixel layout for one column, stacked downwards from the top of its total. */
  function layoutColumn(
    column: (typeof columns)[number],
    yScale: ScaleLinear<number, number>,
  ): Segment[] {
    const baseline = yScale(0);
    const heights = column.series.map((s) => baseline - yScale(s.value));
    const stackHeight =
      heights.reduce((sum, h) => sum + h, 0) + segmentGap * (heights.length - 1);

    let cursor = baseline - stackHeight;
    return column.series.map((s, i) => {
      const segment = { ...s, y: cursor, height: heights[i] };
      cursor += heights[i] + segmentGap;
      return segment;
    });
  }

  type LabelFit = { fontSize: number };

  /**
   * Values are always written horizontally; when one doesn't fit its band the
   * size steps down once, and anything still too big gets a callout.
   */
  function labelFit(label: string, bandwidth: number, height: number): LabelFit | null {
    for (const fontSize of [Number(valueStyle.fontSize), SMALL_VALUE_FONT_SIZE]) {
      if (
        height >= fontSize + LABEL_PADDING &&
        bandwidth >= measureTextWidth(label, fontSize) + LABEL_PADDING
      ) {
        return { fontSize };
      }
    }
    return null;
  }

  /** Bounding box of a value written inside its band, for callout avoidance. */
  function labelBox(label: string, fit: LabelFit, centerX: number, centerY: number): Box {
    const width = measureTextWidth(label, fit.fontSize);
    const boxHeight = fit.fontSize * 1.4;
    return { x: centerX - width / 2, y: centerY - boxHeight / 2, width, height: boxHeight };
  }

  /** Bands with no room for an inline value, gathered per column for placement. */
  function buildCallouts(layouts: Segment[][], xScale: ScaleBand<string>) {
    const bandwidth = xScale.bandwidth();

    const columns: CalloutColumn[] = layouts.map((segments, columnIndex) => {
      const centerX = (xScale(categories[columnIndex]) ?? 0) + bandwidth / 2;
      const obstacles: Box[] = [];
      const items: CalloutInput[] = [];

      for (const segment of segments) {
        const label = valueFormat(segment.value);
        const fit = labelFit(label, bandwidth, segment.height);

        if (fit) {
          obstacles.push(labelBox(label, fit, centerX, segment.y + segment.height / 2));
        } else if (segment.height >= MIN_ANNOTATED_HEIGHT) {
          items.push({
            key: `${segment.key}-${columnIndex}`,
            label,
            color: seriesColor(segment.keyIndex),
            segmentTop: segment.y,
            segmentHeight: segment.height,
          });
        }
      }

      return { centerX, lineX: centerX - bandwidth / 4, items, obstacles };
    });

    return placeCallouts(columns, measureTextWidth, CALLOUT_STYLE);
  }

  type Ribbon = { key: string; color: string; path: string };

  /** Cubic link between the same series in two neighbouring columns. */
  function ribbonPath(
    x1: number,
    x2: number,
    top1: number,
    bottom1: number,
    top2: number,
    bottom2: number,
  ) {
    const mid = (x1 + x2) / 2;
    return [
      `M${x1},${top1}`,
      `C${mid},${top1} ${mid},${top2} ${x2},${top2}`,
      `L${x2},${bottom2}`,
      `C${mid},${bottom2} ${mid},${bottom1} ${x1},${bottom1}`,
      'Z',
    ].join(' ');
  }

  function buildRibbons(
    layouts: Segment[][],
    xScale: ScaleBand<string>,
  ): Ribbon[] {
    const bandwidth = xScale.bandwidth();
    const ribbons: Ribbon[] = [];

    for (let i = 0; i < layouts.length - 1; i++) {
      const left = xScale(categories[i]) ?? 0;
      const right = xScale(categories[i + 1]) ?? 0;
      const x1 = left + bandwidth;
      const x2 = right;

      for (const from of layouts[i]) {
        const to = layouts[i + 1].find((s) => s.key === from.key);
        if (!to) continue;

        ribbons.push({
          key: `${from.key}-${i}`,
          color: seriesColor(from.keyIndex),
          path: ribbonPath(
            x1,
            x2,
            from.y,
            from.y + from.height,
            to.y,
            to.y + to.height,
          ),
        });
      }
    }

    return ribbons;
  }
</script>

<Chart
  {width}
  {height}
  {responsive}
  theme={activeTheme}
  margin={MARGIN}
  ariaLabel="Ribbon chart"
  role="img"
>
  {#snippet children({ innerWidth, innerHeight }: ChartDimensions)}
    {@const xScale = scaleBand<string>()
      .domain(categories)
      .range([0, innerWidth])
      .paddingInner(1 - columnRatio)
      .paddingOuter((1 - columnRatio) / 2)}
    {@const yScale = scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, gapReserve])}
    {@const layouts = columns.map((c) => layoutColumn(c, yScale))}
    {@const bandwidth = xScale.bandwidth()}

    <!-- ribbons first: the columns they connect read as the solid anchors -->
    {#each buildRibbons(layouts, xScale) as ribbon (ribbon.key)}
      <path d={ribbon.path} fill={ribbon.color} fill-opacity={ribbonOpacity} />
    {/each}

    {#each layouts as segments, columnIndex (categories[columnIndex])}
      {@const x = xScale(categories[columnIndex]) ?? 0}
      {#each segments as segment (segment.key)}
        {@const color = seriesColor(segment.keyIndex)}
        <Bar
          {x}
          y={segment.y}
          width={bandwidth}
          height={segment.height}
          fill={color}
          rx={barStyle.rx}
        />

        {#if showValues}
          {@const label = valueFormat(segment.value)}
          {@const fit = labelFit(label, bandwidth, segment.height)}
          {#if fit}
            <Text
              x={x + bandwidth / 2}
              y={segment.y + segment.height / 2}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize={fit.fontSize}
              fontWeight={valueStyle.fontWeight}
              fontFamily={valueStyle.fontFamily}
              fill={getContrastColor(color)}
              text={label}
            />
          {/if}
        {/if}
      {/each}
    {/each}

    {#if showValues}
      {@const callouts = buildCallouts(layouts, xScale)}

      <!-- every leader first, so no line is drawn across a box -->
      {#each callouts as c (c.key)}
        <line
          x1={c.lineX}
          y1={c.lineFromY}
          x2={c.lineX}
          y2={c.y + c.height}
          stroke={c.color}
          stroke-width={1}
        />
      {/each}

      {#each callouts as c (c.key)}
        <ValueCallout
          callout={c}
          style={CALLOUT_STYLE}
          background={palette.base[100]}
          textColor={palette.neutral[300]}
          fontFamily={valueStyle.fontFamily}
          fontWeight={valueStyle.fontWeight}
        />
      {/each}
    {/if}

    <Axis orientation="bottom" scale={xScale} top={innerHeight} />
    <Axis
      orientation="left"
      scale={yScale}
      numTicks={4}
      tickFormat={(v) => valueFormat(Number(v))}
    />

    <LegendChips
      items={legendItems}
      top={innerHeight + 40}
      fontSize={Number(valueStyle.fontSize)}
      fontFamily={valueStyle.fontFamily}
      fontWeight={valueStyle.fontWeight}
      radius={Number(barStyle.rx)}
    />
  {/snippet}
</Chart>
