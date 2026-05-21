<script lang="ts" module>
	export type { StackedDatum } from './VerticalStackedBarChart.svelte';
</script>

<script lang="ts">
	import { scaleLinear, scaleBand, stack, max } from 'd3';
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import { gridPositions, xLinearTicks } from '../utils/scaleHelpers.js';
	import { deriveEffectiveKeys, sortByTotal, rowTotal } from '../utils/stackHelpers.js';
	import type { StackedDatum } from './VerticalStackedBarChart.svelte';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import SegmentLabel from './atoms/SegmentLabel.svelte';

	interface Props {
		data?: StackedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		format?: (v: number) => string;
		colors?: readonly string[];
		rowHeight?: number;
		showTotalLabel?: boolean;
		icons?: Record<string, string>;
		iconSize?: number;
		showFlags?: boolean;
		flagBasePath?: string;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		format = (v: number) => v.toLocaleString(),
		colors = categorical8,
		rowHeight = 52,
		showTotalLabel = true,
		icons,
		iconSize = 20,
		showFlags = false,
		flagBasePath = '/flags/states',
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	const X_AXIS_LABEL_RESERVE = 22;
	const LEGEND_BAR_H = 34;
	const STROKE_W = 0.5;
	const ICON_RATIO = 3 / 2;
	const ICON_GAP = 6;
	const iconW = $derived(iconSize * ICON_RATIO);
	const iconExtra = $derived((icons != null || showFlags) ? iconW + ICON_GAP : 0);
	const FRAME_MARGIN = $derived({
		top: 16,
		right: 28,
		bottom: 12 + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H,
		left: 50 + iconExtra,
	});

	let innerW = $state(0);

	const effectiveKeys = $derived(deriveEffectiveKeys(data, keys, categoryKey));

	const colorMap = $derived(buildColorMap(effectiveKeys, colors));
	const legendItems = $derived(buildLegendItems(effectiveKeys, colorMap, labels));

	const sorted = $derived(sortByTotal(data, effectiveKeys));

	const effectiveIcons = $derived(
		icons ??
			(showFlags
				? Object.fromEntries(
						sorted.map((d) => {
							const cat = String(d[categoryKey]);
							return [cat, `${flagBasePath}/${cat.toUpperCase()}.svg`];
						}),
					)
				: undefined),
	);

	const barAreaH = $derived(sorted.length * rowHeight);
	const height = $derived(FRAME_MARGIN.top + barAreaH + FRAME_MARGIN.bottom);

	const xMax = $derived(
		max(sorted, (d) => rowTotal(d, effectiveKeys)) ?? 1,
	);

	const xScale = $derived(scaleLinear().domain([0, xMax]).range([0, innerW]).nice());

	const yScale = $derived(
		scaleBand()
			.domain(sorted.map((d) => String(d[categoryKey])))
			.range([0, barAreaH])
			.padding(0.28),
	);

	const stackLayout = $derived(
		stack<Record<string, string | number>>().keys(effectiveKeys)(sorted),
	);

	const xTicks = $derived(xLinearTicks(xScale, 5, format));
	const xGridPositions = $derived(gridPositions(xScale, 5));

	const legendBarY = $derived(barAreaH + X_AXIS_LABEL_RESERVE);

	const yTicks = $derived(
		sorted.map((d) => ({
			value: String(d[categoryKey]),
			y: (yScale(String(d[categoryKey])) ?? 0) + yScale.bandwidth() / 2,
		})),
	);
</script>

<ChartFrame responsive {height} margin={FRAME_MARGIN} bind:innerWidth={innerW}>
	<GridLines
		type="vertical"
		positions={xGridPositions}
		length={barAreaH}
		color="var(--chart-grid, #e2e8f0)"
		dashed
	/>

	{#each stackLayout as layer (layer.key)}
		{@const fill = colorMap[layer.key] ?? '#999'}
		{#each layer as segment (String(segment.data[categoryKey]))}
			{@const segX = xScale(segment[0])}
			{@const segW = Math.max(0, xScale(segment[1]) - xScale(segment[0]))}
			{@const segY = yScale(String(segment.data[categoryKey])) ?? 0}
			{@const band = yScale.bandwidth()}
			{@const amount = Number(segment.data[layer.key]) || 0}
			<BarRect
				x={segX}
				y={segY}
				width={segW}
				height={band}
				{fill}
				stroke="none"
				strokeWidth={0}
				shapeRendering="crispEdges"
			/>
			{#if amount > 0}
				<SegmentLabel
					text={format(amount)}
					x={segX + 6}
					y={segY + band / 2}
					availableWidth={segW}
					bandHeight={band}
					{fill}
					fontFamily={chartFont}
				/>
			{/if}
		{/each}
	{/each}

	{#if showTotalLabel}
		{#each sorted as d (String(d[categoryKey]))}
			<text
				x={xScale(rowTotal(d, effectiveKeys)) + 6}
				y={(yScale(String(d[categoryKey])) ?? 0) + yScale.bandwidth() / 2}
				dy="0.35em"
				font-size={10}
				font-weight="500"
				font-family={chartFont}
				fill="var(--chart-fg-strong, #000000)"
			>{format(rowTotal(d, effectiveKeys))}</text>
		{/each}
	{/if}

	<YAxis
		ticks={yTicks}
		innerHeight={barAreaH}
		showLine={false}
		fontSize={11}
		tickOffset={-8}
		fontFamily={chartFont}
	/>

	{#if effectiveIcons}
		{#each sorted as d (String(d[categoryKey]))}
			{@const cat = String(d[categoryKey])}
			{@const iconUrl = effectiveIcons[cat]}
			{#if iconUrl}
				<image
					href={iconUrl}
					x={-(FRAME_MARGIN.left - 4)}
					y={(yScale(cat) ?? 0) + yScale.bandwidth() / 2 - iconSize / 2}
					width={iconW}
					height={iconSize}
				/>
			{/if}
		{/each}
	{/if}

	<XAxis
		ticks={xTicks}
		innerHeight={barAreaH}
		innerWidth={innerW}
		showLine={false}
		fontSize={10}
		fontFamily={chartFont}
	/>

	<LegendBar
		items={legendItems}
		y={legendBarY}
		width={innerW}
		height={LEGEND_BAR_H}
		strokeWidth={STROKE_W}
		fontFamily={chartFont}
	/>
</ChartFrame>
