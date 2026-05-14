<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import { black, colors, typography, type Margin } from '../tokens.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';

	interface DataPoint {
		label: string;
		value: number;
	}

	interface Props {
		data?: DataPoint[];
		color?: string;
		margin?: Margin;
		xLabel?: string;
		yLabel?: string;
		rowHeight?: number;
		format?: (v: number) => string;
		showValueLabels?: boolean;
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
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	let innerWidth = $state(0);
	const height = $derived(data.length * rowHeight + margin.top + margin.bottom);
	const innerHeight = $derived(height - margin.top - margin.bottom);

	const sorted = $derived([...data].sort((a, b) => b.value - a.value));

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

	const xTickValues = $derived(xScale.ticks(5));
	const xTicks = $derived(xTickValues.map((v) => ({ value: format(v), x: xScale(v) })));

	const yTicks = $derived(
		sorted.map((d) => ({
			value: d.label,
			y: (yScale(d.label) ?? 0) + yScale.bandwidth() / 2,
		})),
	);

	const gridPositions = $derived(xTickValues.map((v) => xScale(v)));
</script>

<ChartFrame
	responsive
	{height}
	{margin}
	bind:innerWidth
	ariaLabel="Horizontal bar chart"
>
	<GridLines
		type="vertical"
		positions={gridPositions}
		length={innerHeight}
		color={black}
		opacity={0.15}
		dashed
	/>

	{#each sorted as d (d.label)}
		<BarRect
			x={0}
			y={yScale(d.label) ?? 0}
			width={xScale(d.value)}
			height={yScale.bandwidth()}
			fill={color}
			rx={3}
			opacity={0.9}
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
				fill={black}
			>{format(d.value)}</text>
		{/each}
	{/if}

	<XAxis
		ticks={xTicks}
		{innerHeight}
		{innerWidth}
		label={xLabel}
		showLine={false}
		color="#555555"
		fontSize={10}
		fontFamily={chartFont}
	/>

	<YAxis
		ticks={yTicks}
		{innerHeight}
		label={yLabel}
		showLine={false}
		color="#a0a0a0"
		fontSize={11}
		tickOffset={-8}
		fontFamily={chartFont}
	/>
</ChartFrame>
