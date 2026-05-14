<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import { black, colors, defaultMargin, typography, type Margin } from '../tokens.js';
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

	const yTickValues = $derived(yScale.ticks(5));

	const xTicks = $derived(
		data.map((d) => ({
			value: d.label,
			x: (xScale(d.label) ?? 0) + xScale.bandwidth() / 2,
		})),
	);

	const yTicks = $derived(yTickValues.map((v) => ({ value: v, y: yScale(v) })));
	const gridPositions = $derived(yTickValues.map((v) => yScale(v)));
</script>

<ChartFrame responsive {height} {margin} bind:innerWidth bind:innerHeight ariaLabel="Bar chart">
	<GridLines positions={gridPositions} length={innerWidth} color={black} opacity={0.15} dashed />

	{#each data as d (d.label)}
		<BarRect
			x={xScale(d.label) ?? 0}
			y={yScale(d.value)}
			width={xScale.bandwidth()}
			height={innerHeight - yScale(d.value)}
			fill={color}
			rx={3}
			opacity={0.9}
			title="{d.label}: {d.value}"
		/>
	{/each}

	<XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} fontFamily={chartFont} />
	<YAxis ticks={yTicks} {innerHeight} label={yLabel} fontFamily={chartFont} />
</ChartFrame>
