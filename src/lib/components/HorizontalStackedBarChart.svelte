<script lang="ts" module>
	export type { StackedDatum } from './VerticalStackedBarChart.svelte';
</script>

<script lang="ts">
	import { scaleLinear, scaleBand, max } from 'd3';
	import type { StackedDatum } from './VerticalStackedBarChart.svelte';
	import Chart from '$lib/core/components/Chart.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import Bar from '$lib/core/components/shape/Bar.svelte';
	import BarStack from '$lib/core/components/shape/BarStack.svelte';
	import Text from '$lib/core/components/Text.svelte';
	import { DefaultTheme, getCategoricalColor, getChartTheme } from '$lib/core/theme';
	import type { ChartTheme } from '$lib/core/theme/types';
	import type { Margin } from '$lib/types/Chart';
	import LegendBar from './molecules/LegendBar.svelte';
	import { getContrastColor } from '../utils/colorContrast.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../utils/labelHelpers.js';
	import { deriveEffectiveKeys, sortByTotal, rowTotal } from '../utils/stackHelpers.js';

	interface Props {
		data?: StackedDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		format?: (v: number) => string;
		/** Series colours; defaults to the theme's categorical palette. */
		colors?: readonly string[];
		/** Used when `responsive` is off. */
		width?: number;
		/** Track the container width instead of using `width`. */
		responsive?: boolean;
		/** Sets the theme for this chart; inherits an ancestor `<Theme>` when omitted. */
		theme?: ChartTheme;
		/**
		 * Merged over the computed frame margin. Widen `left` when category
		 * names are long enough to run past the plot area.
		 */
		margin?: Partial<Margin>;
		rowHeight?: number;
		showTotalLabel?: boolean;
		icons?: Record<string, string>;
		iconSize?: number;
		showFlags?: boolean;
		flagBasePath?: string;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		format = (v: number) => v.toLocaleString(),
		colors,
		width = 600,
		responsive = true,
		theme,
		margin,
		rowHeight = 52,
		showTotalLabel = true,
		icons,
		iconSize = 20,
		showFlags = false,
		flagBasePath = '/flags/states',
	}: Props = $props();

	const X_AXIS_LABEL_RESERVE = 22;
	const LEGEND_BAR_H = 34;
	const STROKE_W = 0.5;
	const ICON_RATIO = 3 / 2;
	const ICON_GAP = 6;

	const inheritedTheme = getChartTheme();
	let activeTheme = $derived(theme ?? inheritedTheme ?? DefaultTheme);

	const iconW = $derived(iconSize * ICON_RATIO);
	const iconExtra = $derived(icons != null || showFlags ? iconW + ICON_GAP : 0);
	const FRAME_MARGIN = $derived({
		top: 16,
		right: 28,
		bottom: 12 + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H,
		left: 50 + iconExtra,
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

	const sorted = $derived(sortByTotal(data, effectiveKeys));

	const effectiveIcons = $derived(
		icons ??
			(showFlags
				? Object.fromEntries(
						sorted.map((d) => {
							const cat = String(d[categoryKey]);
							return [cat, `${flagBasePath}/${cat.toUpperCase()}.svg`];
						}),
					)
				: undefined),
	);

	// One row per datum, so the height is data-driven rather than a prop.
	const barAreaH = $derived(sorted.length * rowHeight);
	const height = $derived(FRAME_MARGIN.top + barAreaH + FRAME_MARGIN.bottom);

	const xMax = $derived(max(sorted, (d) => rowTotal(d, effectiveKeys)) ?? 1);

	const legendBarY = $derived(barAreaH + X_AXIS_LABEL_RESERVE);

	const totalLabelFill = $derived(activeTheme.dataLabel?.fill ?? DefaultTheme.dataLabel.fill);
</script>

<Chart
	{width}
	{height}
	{responsive}
	{theme}
	margin={FRAME_MARGIN}
	ariaLabel="Horizontal stacked bar chart"
>
	{#snippet children({ innerWidth })}
		{@const xScale = scaleLinear().domain([0, xMax]).range([0, innerWidth]).nice()}
		{@const yScale = scaleBand<string>()
			.domain(sorted.map((d) => String(d[categoryKey])))
			.range([0, barAreaH])
			.padding(0.28)}

		<GridColumns scale={xScale} height={barAreaH} numTicks={5} />

		<BarStack
			horizontal
			data={sorted}
			keys={effectiveKeys}
			category={(d) => String(d[categoryKey])}
			value={(d, key) => Number(d[key]) || 0}
			color={(_key, i) => seriesColor(i)}
			{xScale}
			{yScale}
			rx={0}
		>
			{#snippet children({ barStacks })}
				{#each barStacks as stack (stack.key)}
					{#each stack.bars as bar (`${stack.key}-${bar.index}`)}
						<Bar
							x={bar.x}
							y={bar.y}
							width={bar.width}
							height={bar.height}
							fill={bar.color}
							rx={0}
						/>
						{#if bar.value > 0}
							{@const label = format(bar.value)}
							{@const fontSize = segmentLabelFontSize(bar.height)}
							{#if labelFitsInBar(label, fontSize, bar.width)}
								<Text
									x={bar.x + 6}
									y={bar.y + bar.height / 2}
									verticalAnchor="middle"
									{fontSize}
									fontWeight={700}
									fill={getContrastColor(bar.color)}
									pointer-events="none"
									text={label}
								/>
							{/if}
						{/if}
					{/each}
				{/each}
			{/snippet}
		</BarStack>

		{#if showTotalLabel}
			{#each sorted as d (String(d[categoryKey]))}
				<Text
					x={xScale(rowTotal(d, effectiveKeys)) + 6}
					y={(yScale(String(d[categoryKey])) ?? 0) + yScale.bandwidth() / 2}
					verticalAnchor="middle"
					fontSize={10}
					fontWeight={500}
					fill={totalLabelFill}
					text={format(rowTotal(d, effectiveKeys))}
				/>
			{/each}
		{/if}

		{#if effectiveIcons}
			{#each sorted as d (String(d[categoryKey]))}
				{@const cat = String(d[categoryKey])}
				{@const iconUrl = effectiveIcons[cat]}
				{#if iconUrl}
					<image
						href={iconUrl}
						x={-(FRAME_MARGIN.left - 4)}
						y={(yScale(cat) ?? 0) + yScale.bandwidth() / 2 - iconSize / 2}
						width={iconW}
						height={iconSize}
					/>
				{/if}
			{/each}
		{/if}

		<Axis orientation="left" scale={yScale} />
		<Axis
			orientation="bottom"
			scale={xScale}
			top={barAreaH}
			numTicks={5}
			tickFormat={(v) => format(Number(v))}
		/>

		<LegendBar
			items={legendItems}
			y={legendBarY}
			width={innerWidth}
			height={LEGEND_BAR_H}
			strokeWidth={STROKE_W}
		/>
	{/snippet}
</Chart>
