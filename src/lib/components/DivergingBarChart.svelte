<script lang="ts" module>
	export interface DivergingDatum {
		label: string;
		leftPct: number;
	}
</script>

<script lang="ts">
	import { scaleLinear, scaleBand } from 'd3';
	import { typography } from '../tokens.js';
	import { colorPairs, type ColorPair } from '../palettes.js';
	import { gridPositions, xLinearTicks } from '../utils/scaleHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import ReferenceLine from './atoms/ReferenceLine.svelte';
	import SegmentLabel from './atoms/SegmentLabel.svelte';

	const FLAG_RATIO = 3 / 2;
	const FLAG_GAP = 6;

	interface Props {
		data?: DivergingDatum[];
		leftLabel?: string;
		rightLabel?: string;
		referenceValue?: number;
		referenceLabel?: string;
		referenceColor?: string;
		colors?: ColorPair;
		marginLeft?: number;
		rowHeight?: number;
		sortDirection?: 'asc' | 'desc';
		showFlags?: boolean;
		flagBasePath?: string;
		flagSize?: number;
	}

	let {
		data = [],
		leftLabel = 'Left',
		rightLabel = 'Right',
		referenceValue = 0,
		referenceLabel = '',
		referenceColor = 'var(--chart-fg-strong, #000000)',
		colors = colorPairs.orangeTeal,
		marginLeft = 130,
		rowHeight = 52,
		sortDirection = 'desc',
		showFlags = false,
		flagBasePath = '/flags/states',
		flagSize = 20,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	const X_AXIS_LABEL_RESERVE = 22;
	const LEGEND_BAR_H = 34;
	const STROKE_W = 0.5;
	const SEGMENT_LABEL_PAD = 6;

	const flagW = $derived(flagSize * FLAG_RATIO);
	const FRAME_MARGIN = $derived({
		top: 28,
		right: 28,
		bottom: 12 + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H,
		left: marginLeft + (showFlags ? flagW + FLAG_GAP : 0),
	});

	const COLORS = $derived({ left: colors[0], right: colors[1] });

	let innerW = $state(0);

	const sorted = $derived(
		[...data].sort((a, b) => {
			const diff = b.leftPct - a.leftPct;
			return sortDirection === 'asc' ? -diff : diff;
		}),
	);

	const barAreaH = $derived(sorted.length * rowHeight);
	const height = $derived(FRAME_MARGIN.top + barAreaH + FRAME_MARGIN.bottom);

	const xScale = $derived(scaleLinear().domain([0, 100]).range([0, innerW]));

	const yScale = $derived(
		scaleBand()
			.domain(sorted.map((d) => d.label))
			.range([0, barAreaH])
			.padding(0.28),
	);

	const xTicks = $derived(xLinearTicks(xScale, 5, (v) => `${v}%`));
	const xGridPositions = $derived(gridPositions(xScale, 5));

	const yTicks = $derived(
		sorted.map((d) => ({
			value: d.label,
			y: (yScale(d.label) ?? 0) + yScale.bandwidth() / 2,
		})),
	);

	const legendBarY = $derived(barAreaH + X_AXIS_LABEL_RESERVE);

	const legendItems = $derived([
		{ label: leftLabel, color: COLORS.left },
		{ label: rightLabel, color: COLORS.right },
	]);
</script>

<ChartFrame responsive {height} margin={FRAME_MARGIN} bind:innerWidth={innerW}>
	<GridLines
		type="vertical"
		positions={xGridPositions}
		length={barAreaH}
		color="var(--chart-grid, #e2e8f0)"
		dashed
	/>

	<!-- Center line at 50% -->
	<ReferenceLine
		position={xScale(50)}
		length={barAreaH}
		color="var(--chart-fg-strong, #000000)"
		strokeWidth={STROKE_W}
	/>

	<!-- Optional reference line -->
	{#if referenceValue > 0}
		<ReferenceLine
			position={xScale(referenceValue)}
			length={barAreaH}
			color={referenceColor}
			strokeWidth={STROKE_W}
			dashed
			extendBefore={8}
			label={referenceLabel ? `${referenceLabel} ${referenceValue.toFixed(1)}%` : undefined}
			labelColor={referenceColor}
		/>
	{/if}

	<!-- Left and right bars -->
	{#each sorted as d (d.label)}
		<BarRect
			x={0}
			y={yScale(d.label) ?? 0}
			width={xScale(d.leftPct)}
			height={yScale.bandwidth()}
			fill={COLORS.left}
			stroke="var(--chart-fg-strong, #000000)"
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
		/>
		<BarRect
			x={xScale(d.leftPct)}
			y={yScale(d.label) ?? 0}
			width={xScale(100 - d.leftPct)}
			height={yScale.bandwidth()}
			fill={COLORS.right}
			stroke="var(--chart-fg-strong, #000000)"
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
		/>
	{/each}

	<!-- Segment labels -->
	{#each sorted as d (d.label)}
		{@const band = yScale.bandwidth()}
		{@const yMid = (yScale(d.label) ?? 0) + band / 2}
		{@const segLeft = xScale(d.leftPct)}
		{@const segRight = xScale(100 - d.leftPct)}
		{#if d.leftPct > 0}
			<SegmentLabel
				text={`${d.leftPct.toFixed(0)}%`}
				x={xScale(d.leftPct) - SEGMENT_LABEL_PAD}
				y={yMid}
				availableWidth={segLeft}
				bandHeight={band}
				fill={COLORS.left}
				textAnchor="end"
				padding={SEGMENT_LABEL_PAD}
				rightMargin={SEGMENT_LABEL_PAD}
				fontFamily={chartFont}
			/>
		{/if}
		{#if 100 - d.leftPct > 0}
			<SegmentLabel
				text={`${(100 - d.leftPct).toFixed(0)}%`}
				x={xScale(d.leftPct) + SEGMENT_LABEL_PAD}
				y={yMid}
				availableWidth={segRight}
				bandHeight={band}
				fill={COLORS.right}
				textAnchor="start"
				padding={SEGMENT_LABEL_PAD}
				rightMargin={SEGMENT_LABEL_PAD}
				fontFamily={chartFont}
			/>
		{/if}
	{/each}

	<XAxis
		ticks={xTicks}
		innerHeight={barAreaH}
		innerWidth={innerW}
		showLine={false}
		fontSize={10}
		fontFamily={chartFont}
	/>
	{#if showFlags}
		{#each sorted as d (d.label)}
			<image
				href="{flagBasePath}/{d.label.toUpperCase()}.svg"
				x={-(FRAME_MARGIN.left - 4)}
				y={(yScale(d.label) ?? 0) + yScale.bandwidth() / 2 - flagSize / 2}
				width={flagW}
				height={flagSize}
			/>
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

	<LegendBar
		items={legendItems}
		y={legendBarY}
		width={innerW}
		height={LEGEND_BAR_H}
		strokeWidth={STROKE_W}
		fontFamily={chartFont}
	/>
</ChartFrame>
