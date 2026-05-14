<script lang="ts" module>
	export interface DivergingDatum {
		label: string;
		leftPct: number;
	}
</script>

<script lang="ts">
	import { scaleLinear, scaleBand } from 'd3';
	import { amber, black, typography } from '../tokens.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import { colorPairs, type ColorPair } from '../palettes.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../utils/labelHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import ReferenceLine from './atoms/ReferenceLine.svelte';

	interface Props {
		data?: DivergingDatum[];
		leftLabel?: string;
		rightLabel?: string;
		referenceValue?: number;
		referenceLabel?: string;
		referenceColor?: string;
		colors?: ColorPair;
		rowHeight?: number;
		sortDirection?: 'asc' | 'desc';
	}

	let {
		data = [],
		leftLabel = 'Left',
		rightLabel = 'Right',
		referenceValue = 0,
		referenceLabel = '',
		referenceColor = amber,
		colors = colorPairs.orangeTeal,
		rowHeight = 52,
		sortDirection = 'desc',
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	const X_AXIS_LABEL_RESERVE = 22;
	const LEGEND_BAR_H = 34;
	const LEGEND_TEXT_PAD = 12;
	const STROKE_W = 0.5;
	const SEGMENT_LABEL_PAD = 6;
	const LABEL_FONT_WEIGHT = 700;
	const FRAME_MARGIN = {
		top: 28,
		right: 28,
		bottom: 12 + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H,
		left: 130,
	};

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

	const xTickValues = $derived(xScale.ticks(5));
	const xTicks = $derived(xTickValues.map((v) => ({ value: `${v}%`, x: xScale(v) })));
	const xGridPositions = $derived(xTickValues.map((v) => xScale(v)));

	const yTicks = $derived(
		sorted.map((d) => ({
			value: d.label,
			y: (yScale(d.label) ?? 0) + yScale.bandwidth() / 2,
		})),
	);

	const legendBarY = $derived(barAreaH + X_AXIS_LABEL_RESERVE);
	const legendHalfW = $derived(innerW / 2);
</script>

<ChartFrame responsive {height} margin={FRAME_MARGIN} bind:innerWidth={innerW}>
	<GridLines
		type="vertical"
		positions={xGridPositions}
		length={barAreaH}
		color={black}
		dashed
	/>

	<!-- Center line at 50% -->
	<ReferenceLine
		position={xScale(50)}
		length={barAreaH}
		color={black}
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
			stroke={black}
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
		/>
		<BarRect
			x={xScale(d.leftPct)}
			y={yScale(d.label) ?? 0}
			width={xScale(100 - d.leftPct)}
			height={yScale.bandwidth()}
			fill={COLORS.right}
			stroke={black}
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
		/>
	{/each}

	<!-- Segment labels -->
	{#each sorted as d (d.label)}
		{@const band = yScale.bandwidth()}
		{@const labelFs = segmentLabelFontSize(band)}
		{@const yMid = (yScale(d.label) ?? 0) + band / 2}
		{@const segLeft = xScale(d.leftPct)}
		{@const segRight = xScale(100 - d.leftPct)}
		{@const txtLeft = `${d.leftPct.toFixed(0)}%`}
		{@const txtRight = `${(100 - d.leftPct).toFixed(0)}%`}
		{#if d.leftPct > 0 && labelFitsInBar(txtLeft, labelFs, segLeft)}
			<text
				x={xScale(d.leftPct) - SEGMENT_LABEL_PAD}
				y={yMid}
				dy="0.35em"
				text-anchor="end"
				font-size={labelFs}
				font-weight={LABEL_FONT_WEIGHT}
				font-family={chartFont}
				fill={getContrastColor(COLORS.left)}
				pointer-events="none"
			>{txtLeft}</text>
		{/if}
		{#if 100 - d.leftPct > 0 && labelFitsInBar(txtRight, labelFs, segRight)}
			<text
				x={xScale(d.leftPct) + SEGMENT_LABEL_PAD}
				y={yMid}
				dy="0.35em"
				text-anchor="start"
				font-size={labelFs}
				font-weight={LABEL_FONT_WEIGHT}
				font-family={chartFont}
				fill={getContrastColor(COLORS.right)}
				pointer-events="none"
			>{txtRight}</text>
		{/if}
	{/each}

	<XAxis
		ticks={xTicks}
		innerHeight={barAreaH}
		innerWidth={innerW}
		showLine={false}
		color="#555555"
		fontSize={10}
		fontFamily={chartFont}
	/>
	<YAxis
		ticks={yTicks}
		innerHeight={barAreaH}
		showLine={false}
		color="#a0a0a0"
		fontSize={11}
		tickOffset={-8}
		fontFamily={chartFont}
	/>

	<!-- Legend bar -->
	<BarRect
		x={0}
		y={legendBarY}
		width={legendHalfW}
		height={LEGEND_BAR_H}
		fill={COLORS.left}
		shapeRendering="crispEdges"
	/>
	<BarRect
		x={legendHalfW}
		y={legendBarY}
		width={legendHalfW}
		height={LEGEND_BAR_H}
		fill={COLORS.right}
		shapeRendering="crispEdges"
	/>
	<line
		x1={legendHalfW}
		y1={legendBarY}
		x2={legendHalfW}
		y2={legendBarY + LEGEND_BAR_H}
		stroke={black}
		stroke-width={STROKE_W}
		shape-rendering="crispEdges"
	/>
	<rect
		x={0}
		y={legendBarY}
		width={innerW}
		height={LEGEND_BAR_H}
		fill="none"
		stroke={black}
		stroke-width={STROKE_W}
		shape-rendering="crispEdges"
	/>
	<text
		x={LEGEND_TEXT_PAD}
		y={legendBarY + LEGEND_BAR_H / 2}
		dy="0.35em"
		font-size={typography.sizes.sm}
		font-weight="600"
		font-family={chartFont}
		fill={black}
	>{leftLabel}</text>
	<text
		x={legendHalfW + LEGEND_TEXT_PAD}
		y={legendBarY + LEGEND_BAR_H / 2}
		dy="0.35em"
		font-size={typography.sizes.sm}
		font-weight="600"
		font-family={chartFont}
		fill={black}
	>{rightLabel}</text>
</ChartFrame>
