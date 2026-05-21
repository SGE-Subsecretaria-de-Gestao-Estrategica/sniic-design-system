<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import { colors, typography, type Margin } from '../tokens.js';
	import { gridPositions, xLinearTicks } from '../utils/scaleHelpers.js';
	import { computeDynamicHeight } from '../utils/scaleHelpers.js';

	const STROKE_W = 0.5;
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';

	interface DataPoint {
		label: string;
		value: number;
	}

	const FLAG_RATIO = 3 / 2;
	const FLAG_GAP = 6;

	interface Props {
		data?: DataPoint[];
		color?: string;
		margin?: Margin;
		xLabel?: string;
		yLabel?: string;
		rowHeight?: number;
		format?: (v: number) => string;
		showValueLabels?: boolean;
		showFlags?: boolean;
		flagBasePath?: string;
		flagSize?: number;
	}

	let {
		data = [],
		color = colors.primary[0],
		margin = { top: 20, right: 40, bottom: 40, left: 120 },
		xLabel = '',
		yLabel = '',
		rowHeight = 32,
		format = (v: number) => String(v),
		showValueLabels = true,
		showFlags = false,
		flagBasePath = '/flags/states',
		flagSize = 20,
	}: Props = $props();

	const flagW = $derived(flagSize * FLAG_RATIO);
	const effectiveMargin = $derived(
		showFlags ? { ...margin, left: margin.left + flagW + FLAG_GAP } : margin,
	);

	const chartFont = typography.chartValueFontFamily;

	let innerWidth = $state(0);

	const sorted = $derived([...data].sort((a, b) => b.value - a.value));

	const { height, innerHeight } = $derived(computeDynamicHeight(sorted.length, rowHeight, margin));

	const xScale = $derived(
		scaleLinear()
			.domain([0, max(sorted, (d) => d.value) ?? 0])
			.nice()
			.range([0, innerWidth]),
	);

	const yScale = $derived(
		scaleBand()
			.domain(sorted.map((d) => d.label))
			.range([0, innerHeight])
			.padding(0.25),
	);

	const xTicks = $derived(xLinearTicks(xScale, 5, format));
	const xGridPositions = $derived(gridPositions(xScale, 5));

	const yTicks = $derived(
		sorted.map((d) => ({
			value: d.label,
			y: (yScale(d.label) ?? 0) + yScale.bandwidth() / 2,
		})),
	);
</script>

<ChartFrame
	responsive
	{height}
	margin={effectiveMargin}
	bind:innerWidth
	ariaLabel="Horizontal bar chart"
>
	<GridLines
		type="vertical"
		positions={xGridPositions}
		length={innerHeight}
		color="var(--chart-grid, #e2e8f0)"
		dashed
	/>

	{#each sorted as d (d.label)}
		<BarRect
			x={0}
			y={yScale(d.label) ?? 0}
			width={xScale(d.value)}
			height={yScale.bandwidth()}
			fill={color}
			stroke="var(--chart-fg-strong, #000000)"
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
			title="{d.label}: {d.value}"
		/>
	{/each}

	{#if showValueLabels}
		{#each sorted as d (d.label)}
			<text
				x={xScale(d.value) + 6}
				y={(yScale(d.label) ?? 0) + yScale.bandwidth() / 2}
				dy="0.35em"
				font-size={10}
				font-weight="500"
				font-family={chartFont}
				fill="var(--chart-fg-strong, #000000)"
			>{format(d.value)}</text>
		{/each}
	{/if}

	<XAxis
		ticks={xTicks}
		{innerHeight}
		{innerWidth}
		label={xLabel}
		showLine={false}
		fontSize={10}
		fontFamily={chartFont}
	/>

	{#if showFlags}
		{#each sorted as d (d.label)}
			<image
				href="{flagBasePath}/{d.label.toUpperCase()}.svg"
				x={-(effectiveMargin.left - 4)}
				y={(yScale(d.label) ?? 0) + yScale.bandwidth() / 2 - flagSize / 2}
				width={flagW}
				height={flagSize}
			/>
		{/each}
	{/if}

	<YAxis
		ticks={yTicks}
		{innerHeight}
		label={yLabel}
		showLine={false}
		fontSize={11}
		tickOffset={-8}
		fontFamily={chartFont}
	/>
</ChartFrame>
