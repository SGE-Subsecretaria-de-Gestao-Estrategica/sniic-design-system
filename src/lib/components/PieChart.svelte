<script lang="ts">
	import type { PieDatum } from '../types.js';
	import { pie, arc, type PieArcDatum } from 'd3';
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Legend from './atoms/Legend.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: PieDatum[];
		radiusFraction?: number;
		height?: number;
		colors?: readonly string[];
		format?: (v: number) => string;
		showLegend?: boolean;
		showLabels?: boolean;
		labelThreshold?: number;
	}

	let {
		data = [],
		radiusFraction = 0.42,
		height = 360,
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		showLegend = true,
		showLabels = true,
		labelThreshold = 0.35,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
	const LEGEND_H = 28;

	let innerW = $state(0);
	let innerH = $state(0);

	const total = $derived(data.reduce((s, d) => s + d.value, 0));

	const outerR = $derived(Math.min(innerW, innerH) * radiusFraction);

	const cx = $derived(innerW / 2);
	const cy = $derived((innerH - (showLegend ? LEGEND_H : 0)) / 2);

	const pieLayout = $derived(
		pie<PieDatum>()
			.value((d) => d.value)
			.sort(null)(data),
	);

	const arcGen = $derived(
		arc<PieArcDatum<PieDatum>>()
			.innerRadius(0)
			.outerRadius(outerR)
			.padAngle(0.015)
			.cornerRadius(2),
	);

	const labelArcGen = $derived(
		arc<PieArcDatum<PieDatum>>()
			.innerRadius(outerR * 0.55)
			.outerRadius(outerR * 0.55),
	);

	function sliceColor(d: PieDatum, i: number): string {
		return d.color ?? colors[i % colors.length];
	}

	const legendItems = $derived(
		data.map((d, i) => ({
			label: d.label,
			color: sliceColor(d, i),
		})),
	);
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Pie chart">
			<g transform="translate({cx},{cy})">
				{#each pieLayout as slice, i (slice.data.label)}
					{@const fill = sliceColor(slice.data, i)}
					{@const centroid = labelArcGen.centroid(slice)}
					{@const angle = slice.endAngle - slice.startAngle}
					<path
						d={arcGen(slice) ?? ''}
						{fill}
						stroke="var(--chart-bg, white)"
						stroke-width={1.5}
						role="img"
						aria-label="{slice.data.label}: {format(slice.data.value)}"
						onmouseenter={(e) => {
							const pct = total > 0 ? ((slice.data.value / total) * 100).toFixed(1) : '0';
							show(e, `<strong>${slice.data.label}</strong><br/>${format(slice.data.value)} (${pct}%)`);
						}}
						onmousemove={move}
						onmouseleave={hide}
					/>
					{#if showLabels && angle > labelThreshold && outerR > 40}
						<text
							x={centroid[0]}
							y={centroid[1]}
							text-anchor="middle"
							dy="0.35em"
							font-size={Math.min(12, outerR * 0.12)}
							font-weight={700}
							font-family={chartFont}
							fill={getContrastColor(fill)}
							pointer-events="none"
						>{total > 0 ? Math.round((slice.data.value / total) * 100) + '%' : ''}</text>
					{/if}
				{/each}
			</g>

			{#if showLegend && legendItems.length > 0}
				<g transform="translate(0, {innerH - LEGEND_H})">
					<Legend items={legendItems} spacing={Math.min(120, innerW / legendItems.length)} />
				</g>
			{/if}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
