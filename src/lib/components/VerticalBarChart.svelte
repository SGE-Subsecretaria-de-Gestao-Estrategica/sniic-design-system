<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import { colors, defaultMargin, typography, type Margin } from '../tokens.js';
	import { gridPositions, yLinearTicks } from '../utils/scaleHelpers.js';

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

	interface Props {
		data?: DataPoint[];
		height?: number;
		color?: string;
		margin?: Margin;
		xLabel?: string;
		yLabel?: string;
	}

	let {
		data = [],
		height = 400,
		color = colors.primary[0],
		margin = defaultMargin,
		xLabel = '',
		yLabel = '',
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	const xScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.label))
			.range([0, innerWidth])
			.padding(0.25),
	);

	const yScale = $derived(
		scaleLinear()
			.domain([0, max(data, (d) => d.value) ?? 0])
			.nice()
			.range([innerHeight, 0]),
	);

	const xTicks = $derived(
		data.map((d) => ({
			value: d.label,
			x: (xScale(d.label) ?? 0) + xScale.bandwidth() / 2,
		})),
	);

	const yTicks = $derived(yLinearTicks(yScale, 5));
	const yGridPositions = $derived(gridPositions(yScale, 5));
</script>

<ChartFrame responsive {height} {margin} bind:innerWidth bind:innerHeight ariaLabel="Bar chart">
	<GridLines positions={yGridPositions} length={innerWidth} color="var(--chart-grid, #e2e8f0)" dashed />

	{#each data as d (d.label)}
		<BarRect
			x={xScale(d.label) ?? 0}
			y={yScale(d.value)}
			width={xScale.bandwidth()}
			height={innerHeight - yScale(d.value)}
			fill={color}
			stroke="var(--chart-fg-strong, #000000)"
			strokeWidth={STROKE_W}
			shapeRendering="crispEdges"
			title="{d.label}: {d.value}"
		/>
	{/each}

	<XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} fontFamily={chartFont} />
	<YAxis ticks={yTicks} {innerHeight} label={yLabel} fontFamily={chartFont} />
</ChartFrame>
