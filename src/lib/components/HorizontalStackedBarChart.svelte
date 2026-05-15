<script lang="ts" module>
	export type { StackedDatum } from './VerticalStackedBarChart.svelte';
</script>

<script lang="ts">
	import { scaleLinear, scaleBand, stack, max } from 'd3';
	import { black, typography } from '../tokens.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import { categorical8 } from '../palettes.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../utils/labelHelpers.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import type { StackedDatum } from './VerticalStackedBarChart.svelte';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';

	interface Props {
		data?: StackedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		format?: (v: number) => string;
		colors?: readonly string[];
		rowHeight?: number;
		showTotalLabel?: boolean;
		/** Optional map of category → image URL, rendered next to Y-axis labels. */
		icons?: Record<string, string>;
		iconSize?: number;
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
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	const X_AXIS_LABEL_RESERVE = 22;
	const LEGEND_BAR_H = 34;
	const STROKE_W = 0.5;
	const SEGMENT_LABEL_PAD = 6;
	const LABEL_FONT_WEIGHT = 700;
	const ICON_GAP = 6;
	const iconExtra = $derived(icons ? iconSize + ICON_GAP : 0);
	const FRAME_MARGIN = $derived({
		top: 16,
		right: 28,
		bottom: 12 + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H,
		left: 50 + iconExtra,
	});

	let innerW = $state(0);

	const effectiveKeys = $derived(
		keys.length > 0
			? keys
			: data.length > 0
				? Object.keys(data[0]).filter(
						(k) => k !== categoryKey && typeof data[0][k] === 'number',
					)
				: [],
	);

	const colorMap = $derived(buildColorMap(effectiveKeys, colors));
	const legendItems = $derived(buildLegendItems(effectiveKeys, colorMap, labels));

	const sorted = $derived(
		[...data].sort((a, b) => {
			const totalA = effectiveKeys.reduce((s, k) => s + (Number(a[k]) || 0), 0);
			const totalB = effectiveKeys.reduce((s, k) => s + (Number(b[k]) || 0), 0);
			return totalB - totalA;
		}),
	);

	const barAreaH = $derived(sorted.length * rowHeight);
	const height = $derived(FRAME_MARGIN.top + barAreaH + FRAME_MARGIN.bottom);

	const xMax = $derived(
		max(sorted, (d) => effectiveKeys.reduce((s, k) => s + (Number(d[k]) || 0), 0)) ?? 1,
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

	const xTickValues = $derived(xScale.ticks(5));
	const xTicks = $derived(xTickValues.map((v) => ({ value: format(v), x: xScale(v) })));
	const xGridPositions = $derived(xTickValues.map((v) => xScale(v)));

	const legendBarY = $derived(barAreaH + X_AXIS_LABEL_RESERVE);

	const yTicks = $derived(
		sorted.map((d) => ({
			value: String(d[categoryKey]),
			y: (yScale(String(d[categoryKey])) ?? 0) + yScale.bandwidth() / 2,
		})),
	);

	function rowTotal(d: StackedDatum): number {
		return effectiveKeys.reduce((s, k) => s + (Number(d[k]) || 0), 0);
	}
</script>

<ChartFrame responsive {height} margin={FRAME_MARGIN} bind:innerWidth={innerW}>
	<GridLines
		type="vertical"
		positions={xGridPositions}
		length={barAreaH}
		color={black}
		opacity={0.15}
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
			{@const labelFs = segmentLabelFontSize(band)}
			{@const labelText = format(amount)}
			<BarRect
				x={segX}
				y={segY}
				width={segW}
				height={band}
				{fill}
				stroke={black}
				strokeWidth={STROKE_W}
				shapeRendering="crispEdges"
			/>
			{#if amount > 0 && labelFitsInBar(labelText, labelFs, segW)}
				<text
					x={segX + SEGMENT_LABEL_PAD}
					y={segY + band / 2}
					dy="0.35em"
					fill={getContrastColor(fill)}
					font-size={labelFs}
					font-weight={LABEL_FONT_WEIGHT}
					font-family={chartFont}
					pointer-events="none"
				>{labelText}</text>
			{/if}
		{/each}
	{/each}

	{#if showTotalLabel}
		{#each sorted as d (String(d[categoryKey]))}
			<text
				x={xScale(rowTotal(d)) + 6}
				y={(yScale(String(d[categoryKey])) ?? 0) + yScale.bandwidth() / 2}
				dy="0.35em"
				font-size={10}
				font-weight="500"
				font-family={chartFont}
				fill={black}
			>{format(rowTotal(d))}</text>
		{/each}
	{/if}

	<YAxis
		ticks={yTicks}
		innerHeight={barAreaH}
		showLine={false}
		color="#a0a0a0"
		fontSize={11}
		tickOffset={-8}
		fontFamily={chartFont}
	/>

	{#if icons}
		{#each sorted as d (String(d[categoryKey]))}
			{@const cat = String(d[categoryKey])}
			{@const iconUrl = icons[cat]}
			{#if iconUrl}
				<image
					href={iconUrl}
					x={-(FRAME_MARGIN.left - 4)}
					y={(yScale(cat) ?? 0) + yScale.bandwidth() / 2 - iconSize / 2}
					width={iconSize}
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
		color="#555555"
		fontSize={10}
		fontFamily={chartFont}
	/>

	<!-- Legend bar -->
	<LegendBar
		items={legendItems}
		y={legendBarY}
		width={innerW}
		height={LEGEND_BAR_H}
		strokeWidth={STROKE_W}
		fontFamily={chartFont}
	/>
</ChartFrame>
