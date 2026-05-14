<script lang="ts" module>
	export type StackedDatum = Record<string, string | number>;
</script>

<script lang="ts">
	import { scaleBand, scaleLinear, stack, max } from 'd3';
	import { typography, black } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import Legend from './atoms/Legend.svelte';
	import BarRect from './atoms/BarRect.svelte';

	interface Props {
		data?: StackedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		normalize?: boolean;
		sortBy?: string;
		sortDirection?: 'asc' | 'desc';
		colors?: readonly string[];
		height?: number;
		yTickFormat?: (v: number) => string;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		normalize = false,
		sortBy,
		sortDirection = 'desc',
		colors = categorical8,
		height: chartHeight = 260,
		yTickFormat,
	}: Props = $props();

	const MARGIN = { top: 16, right: 24, bottom: 60, left: 60 };
	const STROKE_W = 0.5;
	const LEGEND_SPACING = 110;
	const chartFont = typography.chartValueFontFamily;

	let innerW = $state(0);
	let innerH = $state(0);

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

	const processed = $derived.by(() => {
		let rows = data.map((d) => {
			const row: Record<string, string | number> = { [categoryKey]: d[categoryKey] };
			if (normalize) {
				const total =
					effectiveKeys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0) || 1;
				for (const k of effectiveKeys) row[k] = ((Number(d[k]) || 0) / total) * 100;
			} else {
				for (const k of effectiveKeys) row[k] = Number(d[k]) || 0;
			}
			return row;
		});

		const sortKey = sortBy ?? effectiveKeys[0];
		if (sortKey) {
			rows = rows.sort((a, b) => {
				const diff = (Number(b[sortKey]) || 0) - (Number(a[sortKey]) || 0);
				return sortDirection === 'asc' ? -diff : diff;
			});
		}
		return rows;
	});

	const stackLayout = $derived(
		stack<Record<string, string | number>>().keys(effectiveKeys)(processed),
	);

	const xScale = $derived(
		scaleBand()
			.domain(processed.map((d) => String(d[categoryKey])))
			.range([0, innerW])
			.padding(0.25),
	);

	const yMax = $derived(
		normalize
			? 100
			: (max(processed, (d) =>
					effectiveKeys.reduce((s, k) => s + (Number(d[k]) || 0), 0),
				) ?? 1),
	);

	const yScale = $derived(scaleLinear().domain([0, yMax]).range([innerH, 0]).nice());

	const yTickValues = $derived(yScale.ticks(4));

	const defaultFormat = $derived(
		normalize ? (v: number) => `${v}%` : (v: number) => String(v),
	);
	const formatTick = $derived(yTickFormat ?? defaultFormat);

	const xTicks = $derived(
		processed.map((d) => ({
			value: String(d[categoryKey]),
			x: (xScale(String(d[categoryKey])) ?? 0) + xScale.bandwidth() / 2,
		})),
	);

	const yTicks = $derived(yTickValues.map((v) => ({ value: formatTick(v), y: yScale(v) })));
	const gridPositions = $derived(yTickValues.map((v) => yScale(v)));

	const legendCenterX = $derived(
		innerW / 2 - ((legendItems.length - 1) * LEGEND_SPACING) / 2,
	);
</script>

<ChartFrame
	responsive
	height={chartHeight}
	margin={MARGIN}
	bind:innerWidth={innerW}
	bind:innerHeight={innerH}
>
	<GridLines positions={gridPositions} length={innerW} color={black} opacity={0.15} dashed />

	{#each stackLayout as layer (layer.key)}
		{@const fill = colorMap[layer.key] ?? '#999'}
		{#each layer as segment (String(segment.data[categoryKey]))}
			<BarRect
				x={xScale(String(segment.data[categoryKey])) ?? 0}
				y={yScale(segment[1])}
				width={xScale.bandwidth()}
				height={yScale(segment[0]) - yScale(segment[1])}
				{fill}
				stroke={black}
				strokeWidth={STROKE_W}
				shapeRendering="crispEdges"
				rx={2}
			/>
		{/each}
	{/each}

	<XAxis
		ticks={xTicks}
		innerHeight={innerH}
		innerWidth={innerW}
		showLine={false}
		rotate={-45}
		color="#555555"
		fontSize={9}
		fontFamily={chartFont}
	/>

	<YAxis
		ticks={yTicks}
		innerHeight={innerH}
		showLine={false}
		color="#555555"
		fontSize={10}
		fontFamily={chartFont}
	/>

	<g transform="translate({legendCenterX}, {innerH + 40})">
		<Legend items={legendItems} spacing={LEGEND_SPACING} fontFamily={chartFont} />
	</g>
</ChartFrame>
