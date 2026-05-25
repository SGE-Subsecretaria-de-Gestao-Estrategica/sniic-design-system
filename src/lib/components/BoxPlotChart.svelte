<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3';
	import { colors, defaultMargin, typography, type Margin } from '../tokens.js';
	import { gridPositions, yLinearTicks } from '../utils/scaleHelpers.js';
	import { computeBoxStats, type BoxSeries, type BoxStats } from '../charts/boxplot.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';

	interface Props {
		data?: BoxSeries[];
		height?: number;
		color?: string;
		margin?: Margin;
		xLabel?: string;
		yLabel?: string;
		showOutliers?: boolean;
		format?: (v: number) => string;
	}

	const boxPlotMargin = { ...defaultMargin, left: 108 };

	let {
		data = [],
		height = 400,
		color = colors.primary[0],
		margin = boxPlotMargin,
		xLabel = '',
		yLabel = '',
		showOutliers = true,
		format = (v: number) => String(v),
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	const resolved = $derived(
		data.map((d) => ({
			label: d.label,
			stats: d.stats ?? computeBoxStats(d.values ?? []),
		})),
	);

	const allExtents = $derived(
		resolved.flatMap((d) => {
			const s: BoxStats = d.stats;
			const pts = [s.min, s.max];
			if (showOutliers && s.outliers) pts.push(...s.outliers);
			return pts;
		}),
	);

	const xScale = $derived(
		scaleBand()
			.domain(resolved.map((d) => d.label))
			.range([0, innerWidth])
			.padding(0.3),
	);

	const yScale = $derived(
		scaleLinear()
			.domain(allExtents.length > 0 ? [Math.min(...allExtents), Math.max(...allExtents)] : [0, 1])
			.nice()
			.range([innerHeight, 0]),
	);

	const xTicks = $derived(
		resolved.map((d) => ({
			value: d.label,
			x: (xScale(d.label) ?? 0) + xScale.bandwidth() / 2,
		})),
	);

	const yTicks = $derived(yLinearTicks(yScale, 5, format));
	const yGridPositions = $derived(gridPositions(yScale, 5));
</script>

<ChartFrame responsive {height} {margin} bind:innerWidth bind:innerHeight ariaLabel="Box plot chart">
	<GridLines positions={yGridPositions} length={innerWidth} color="var(--chart-grid, #e2e8f0)" dashed />

	{#each resolved as d (d.label)}
		{@const bx = xScale(d.label) ?? 0}
		{@const bw = xScale.bandwidth()}
		{@const cx = bx + bw / 2}
		{@const boxW = bw * 0.65}
		{@const boxX = cx - boxW / 2}
		{@const s = d.stats}

		<!-- Lower whisker: min → Q1 -->
		<line
			x1={cx}
			y1={yScale(s.min)}
			x2={cx}
			y2={yScale(s.q1)}
			stroke={color}
			stroke-width="1.5"
		/>
		<!-- Upper whisker: Q3 → max -->
		<line
			x1={cx}
			y1={yScale(s.q3)}
			x2={cx}
			y2={yScale(s.max)}
			stroke={color}
			stroke-width="1.5"
		/>
		<!-- Whisker cap: min -->
		<line
			x1={cx - boxW / 4}
			y1={yScale(s.min)}
			x2={cx + boxW / 4}
			y2={yScale(s.min)}
			stroke={color}
			stroke-width="1.5"
		/>
		<!-- Whisker cap: max -->
		<line
			x1={cx - boxW / 4}
			y1={yScale(s.max)}
			x2={cx + boxW / 4}
			y2={yScale(s.max)}
			stroke={color}
			stroke-width="1.5"
		/>
		<!-- IQR box: Q1 → Q3 -->
		<rect
			x={boxX}
			y={yScale(s.q3)}
			width={boxW}
			height={Math.max(0, yScale(s.q1) - yScale(s.q3))}
			fill={color}
			fill-opacity="0.18"
			stroke={color}
			stroke-width="1.5"
		/>
		<!-- Median line -->
		<line
			x1={boxX}
			y1={yScale(s.median)}
			x2={boxX + boxW}
			y2={yScale(s.median)}
			stroke={color}
			stroke-width="2.5"
		/>
		<!-- Outliers -->
		{#if showOutliers && s.outliers}
			{#each s.outliers as ov (ov)}
				<circle cx={cx} cy={yScale(ov)} r="3" fill="none" stroke={color} stroke-width="1.5" />
			{/each}
		{/if}
	{/each}

	<XAxis ticks={xTicks} {innerHeight} {innerWidth} label={xLabel} fontFamily={chartFont} />
	<YAxis ticks={yTicks} {innerHeight} label={yLabel} fontFamily={chartFont} labelOffset={90} />
</ChartFrame>
