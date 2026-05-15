<script lang="ts" module>
	export interface GroupedDatum {
		[key: string]: string | number;
	}
</script>

<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import { black, typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: GroupedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		height?: number;
		margin?: Margin;
		colors?: readonly string[];
		format?: (v: number) => string;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		height = 400,
		margin = { top: 16, right: 28, bottom: 68, left: 48 },
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const STROKE_W = 0.5;
	const LEGEND_BAR_H = 34;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

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

	const barAreaH = $derived(innerH - LEGEND_BAR_H - 18);

	const xScale = $derived(
		scaleBand()
			.domain(data.map((d) => String(d[categoryKey])))
			.range([0, innerW])
			.paddingInner(0.2)
			.paddingOuter(0.1),
	);

	const xSubScale = $derived(
		scaleBand()
			.domain(effectiveKeys)
			.range([0, xScale.bandwidth()])
			.padding(0.08),
	);

	const yMax = $derived(
		max(data, (d) => max(effectiveKeys, (k) => Number(d[k]) || 0)) ?? 1,
	);

	const yScale = $derived(
		scaleLinear().domain([0, yMax]).nice().range([barAreaH, 0]),
	);

	const yTickValues = $derived(yScale.ticks(5));
	const yTicks = $derived(yTickValues.map((v) => ({ value: format(v), y: yScale(v) })));
	const yGridPositions = $derived(yTickValues.map((v) => yScale(v)));

	const xTicks = $derived(
		data.map((d) => ({
			value: String(d[categoryKey]),
			x: (xScale(String(d[categoryKey])) ?? 0) + xScale.bandwidth() / 2,
		})),
	);

	const legendBarY = $derived(barAreaH + 18);
</script>

<div bind:this={wrapperEl} class="grouped-wrapper">
	<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Grouped column chart">
		<GridLines
			positions={yGridPositions}
			length={innerW}
			color={black}
			opacity={0.15}
			dashed
		/>

		{#each data as d (String(d[categoryKey]))}
			{@const groupX = xScale(String(d[categoryKey])) ?? 0}
			{#each effectiveKeys as key (key)}
				{@const value = Number(d[key]) || 0}
				{@const fill = colorMap[key] ?? '#999'}
				{@const barX = groupX + (xSubScale(key) ?? 0)}
				{@const barW = xSubScale.bandwidth()}
				{@const barH = barAreaH - yScale(value)}
				{@const barY = yScale(value)}
				<g
					role="img"
					aria-label="{String(d[categoryKey])} - {labels[key] ?? key}: {format(value)}"
					onmouseenter={(e) => {
						const html = `<strong>${String(d[categoryKey])}</strong><br/>${labels[key] ?? key}: ${format(value)}`;
						tooltip = { visible: true, ...relativePos(e, wrapperEl!), html };
					}}
					onmousemove={(e) => {
						tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
					}}
					onmouseleave={() => {
						tooltip = { ...tooltip, visible: false };
					}}
				>
					<BarRect
						x={barX}
						y={barY}
						width={barW}
						height={barH}
						{fill}
						stroke={black}
						strokeWidth={STROKE_W}
						shapeRendering="crispEdges"
					/>
				</g>
			{/each}
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
			color="#555555"
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

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.grouped-wrapper {
		position: relative;
		width: 100%;
	}
</style>
