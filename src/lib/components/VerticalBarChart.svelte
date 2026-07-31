<script lang="ts">
	import { scaleBand, scaleLinear, max } from 'd3';
	import Chart from '$lib/core/components/Chart.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridRows from '$lib/core/components/grid/GridRows.svelte';
	import Bar from '$lib/core/components/shape/Bar.svelte';
	import type { ChartTheme } from '$lib/core/theme/types';
	import type { Margin } from '$lib/types/Chart';

	interface DataPoint {
		label: string;
		value: number;
	}

	interface Props {
		data?: DataPoint[];
		/** Used when `responsive` is off. */
		width?: number;
		height?: number;
		/** Track the container width instead of using `width`. */
		responsive?: boolean;
		/** Sets the theme for this chart; inherits an ancestor `<Theme>` when omitted. */
		theme?: ChartTheme;
		/** Bar fill; defaults to the theme's bar style. */
		color?: string;
		/** Merged over the theme default; pass only the sides you need. */
		margin?: Partial<Margin>;
		xLabel?: string;
		yLabel?: string;
	}

	let {
		data = [],
		width = 600,
		height = 400,
		responsive = true,
		theme,
		color,
		margin,
		xLabel = '',
		yLabel = '',
	}: Props = $props();
</script>

<Chart {width} {height} {responsive} {margin} {theme} ariaLabel="Bar chart">
	{#snippet children({ innerWidth, innerHeight })}
		{@const xScale = scaleBand<string>()
			.domain(data.map((d) => d.label))
			.range([0, innerWidth])
			.padding(0.25)}
		{@const yScale = scaleLinear()
			.domain([0, max(data, (d) => d.value) ?? 0])
			.nice()
			.range([innerHeight, 0])}

		<GridRows scale={yScale} width={innerWidth} numTicks={5} />

		{#each data as d (d.label)}
			<g>
				<title>{d.label}: {d.value}</title>
				<Bar
					x={xScale(d.label) ?? 0}
					y={yScale(d.value)}
					width={xScale.bandwidth()}
					height={innerHeight - yScale(d.value)}
					fill={color}
				/>
			</g>
		{/each}

		<Axis orientation="left" scale={yScale} numTicks={5} label={yLabel} />
		<Axis orientation="bottom" scale={xScale} top={innerHeight} label={xLabel} />
	{/snippet}
</Chart>
