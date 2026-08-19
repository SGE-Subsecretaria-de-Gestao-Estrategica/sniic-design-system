<script lang="ts" module>
	export type { StackedDatum } from '../types.js';
</script>

<script lang="ts">
	import type { StackedDatum } from '../types.js';
	import { scaleBand, scaleLinear, max } from 'd3';
	import Chart from '$lib/core/components/Chart.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridRows from '$lib/core/components/grid/GridRows.svelte';
	import BarStack from '$lib/core/components/shape/BarStack.svelte';
	import Legend from '$lib/core/components/legend/Legend.svelte';
	import { DefaultTheme, getCategoricalColor, getChartTheme } from '$lib/core/theme';
	import type { ChartTheme } from '$lib/core/theme/types';
	import type { Margin } from '$lib/types/Chart';
	import { deriveEffectiveKeys, processStackedRows, rowTotal } from '../utils/stackHelpers.js';

	interface Props {
		data?: StackedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		normalize?: boolean;
		sortBy?: string;
		sortDirection?: 'asc' | 'desc';
		/** Series colours; defaults to the theme's categorical palette. */
		colors?: readonly string[];
		/** Used when `responsive` is off. */
		width?: number;
		height?: number;
		/** Track the container width instead of using `width`. */
		responsive?: boolean;
		/** Sets the theme for this chart; inherits an ancestor `<Theme>` when omitted. */
		theme?: ChartTheme;
		/**
		 * Merged over the computed frame margin. Widen `left` when value
		 * labels need more room than the default 60px.
		 */
		margin?: Partial<Margin>;
		yTickFormat?: (v: number) => string;
		icons?: Record<string, string>;
		iconSize?: number;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		normalize = false,
		sortBy,
		sortDirection = 'desc',
		colors,
		width = 600,
		height: chartHeight = 260,
		responsive = true,
		theme,
		margin,
		yTickFormat,
		icons,
		iconSize = 20,
	}: Props = $props();

	const ICON_RATIO = 3 / 2;
	const ICON_GAP = 4;
	const LEGEND_SPACING = 110;

	const inheritedTheme = getChartTheme();
	let activeTheme = $derived(theme ?? inheritedTheme ?? DefaultTheme);

	const iconW = $derived(iconSize * ICON_RATIO);
	const iconExtra = $derived(icons ? iconSize + ICON_GAP : 0);
	const MARGIN = $derived({
		top: 16,
		right: 24,
		bottom: 60 + iconExtra,
		left: 60,
		...margin,
	});

	const effectiveKeys = $derived(deriveEffectiveKeys(data, keys, categoryKey));

	function seriesColor(index: number) {
		return colors?.length
			? colors[index % colors.length]
			: getCategoricalColor(index, activeTheme);
	}

	const legendItems = $derived(
		effectiveKeys.map((key, i) => ({ label: labels[key] ?? key, color: seriesColor(i) })),
	);

	const processed = $derived(
		processStackedRows(data, effectiveKeys, categoryKey, {
			normalize,
			sortBy: sortBy ?? effectiveKeys[0],
			sortDirection,
		}),
	);

	const yMax = $derived(
		normalize ? 100 : (max(processed, (d) => rowTotal(d, effectiveKeys)) ?? 1),
	);

	const defaultFormat = $derived(
		normalize ? (v: number) => `${v}%` : (v: number) => String(v),
	);
	const formatTick = $derived(yTickFormat ?? defaultFormat);
</script>

<Chart
	{width}
	height={chartHeight}
	{responsive}
	{theme}
	margin={MARGIN}
	ariaLabel="Stacked bar chart"
>
	{#snippet children({ innerWidth, innerHeight })}
		{@const xScale = scaleBand<string>()
			.domain(processed.map((d) => String(d[categoryKey])))
			.range([0, innerWidth])
			.padding(0.25)}
		{@const yScale = scaleLinear()
			.domain([0, yMax])
			.range([innerHeight, 0])
			.nice()}
		{@const legendCenterX =
			innerWidth / 2 - ((legendItems.length - 1) * LEGEND_SPACING) / 2}

		<GridRows scale={yScale} width={innerWidth} numTicks={4} />

		<BarStack
			data={processed}
			keys={effectiveKeys}
			category={(d) => String(d[categoryKey])}
			value={(d, key) => Number(d[key]) || 0}
			color={(_key, i) => seriesColor(i)}
			{xScale}
			{yScale}
			rx={0}
		/>

		<Axis orientation="bottom" scale={xScale} top={innerHeight} />
		<Axis
			orientation="left"
			scale={yScale}
			numTicks={4}
			tickFormat={(v) => formatTick(Number(v))}
		/>

		{#if icons}
			{#each processed as d (String(d[categoryKey]))}
				{@const cat = String(d[categoryKey])}
				{@const iconUrl = icons[cat]}
				{#if iconUrl}
					<image
						href={iconUrl}
						x={(xScale(cat) ?? 0) + xScale.bandwidth() / 2 - iconW / 2}
						y={innerHeight + 18 + ICON_GAP}
						width={iconW}
						height={iconSize}
					/>
				{/if}
			{/each}
		{/if}

		<Legend
			items={legendItems}
			left={legendCenterX}
			top={innerHeight + 40 + iconExtra}
			itemSpacing={LEGEND_SPACING}
		/>
	{/snippet}
</Chart>
