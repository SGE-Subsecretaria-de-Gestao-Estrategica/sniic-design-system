<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import Chart from '$lib/core/components/Chart.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import Bar from '$lib/core/components/shape/Bar.svelte';
	import Text from '$lib/core/components/Text.svelte';
	import { DefaultTheme, getChartTheme } from '$lib/core/theme';
	import type { ChartTheme } from '$lib/core/theme/types';
	import type { Margin } from '$lib/types/Chart';

	interface DataPoint {
		label: string;
		value: number;
	}

	const FLAG_RATIO = 3 / 2;
	const FLAG_GAP = 6;

	interface Props {
		data?: DataPoint[];
		/** Used when `responsive` is off. */
		width?: number;
		/** Track the container width instead of using `width`. */
		responsive?: boolean;
		/** Sets the theme for this chart; inherits an ancestor `<Theme>` when omitted. */
		theme?: ChartTheme;
		/** Bar fill; defaults to the theme's bar style. */
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
		width = 600,
		responsive = true,
		theme,
		color,
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

	const inheritedTheme = getChartTheme();
	let activeTheme = $derived(theme ?? inheritedTheme ?? DefaultTheme);

	const flagW = $derived(flagSize * FLAG_RATIO);
	const effectiveMargin = $derived(
		showFlags ? { ...margin, left: margin.left + flagW + FLAG_GAP } : margin,
	);

	const sorted = $derived([...data].sort((a, b) => b.value - a.value));

	// One row per datum, so the height is data-driven rather than a prop.
	const innerHeight = $derived(sorted.length * rowHeight);
	const height = $derived(innerHeight + margin.top + margin.bottom);

	const valueLabelFill = $derived(activeTheme.dataLabel?.fill ?? DefaultTheme.dataLabel.fill);
</script>

<Chart
	{width}
	{height}
	{responsive}
	{theme}
	margin={effectiveMargin}
	ariaLabel="Horizontal bar chart"
>
	{#snippet children({ innerWidth })}
		{@const xScale = scaleLinear()
			.domain([0, max(sorted, (d) => d.value) ?? 0])
			.nice()
			.range([0, innerWidth])}
		{@const yScale = scaleBand<string>()
			.domain(sorted.map((d) => d.label))
			.range([0, innerHeight])
			.padding(0.25)}

		<GridColumns scale={xScale} height={innerHeight} numTicks={5} />

		{#each sorted as d (d.label)}
			<g>
				<title>{d.label}: {d.value}</title>
				<Bar
					x={0}
					y={yScale(d.label) ?? 0}
					width={xScale(d.value)}
					height={yScale.bandwidth()}
					fill={color}
				/>
			</g>
		{/each}

		{#if showValueLabels}
			{#each sorted as d (d.label)}
				<Text
					x={xScale(d.value) + 6}
					y={(yScale(d.label) ?? 0) + yScale.bandwidth() / 2}
					verticalAnchor="middle"
					fontSize={10}
					fontWeight={500}
					fill={valueLabelFill}
					text={format(d.value)}
				/>
			{/each}
		{/if}

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

		<Axis
			orientation="bottom"
			scale={xScale}
			top={innerHeight}
			numTicks={5}
			tickFormat={(v) => format(Number(v))}
			label={xLabel}
		/>
		<Axis orientation="left" scale={yScale} label={yLabel} />
	{/snippet}
</Chart>
