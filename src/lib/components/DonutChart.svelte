<script lang="ts">
	import type { DonutDatum } from '../types.js';
	import { pie, arc, type PieArcDatum } from 'd3';
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Legend from './atoms/Legend.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: DonutDatum[];
		radiusFraction?: number;
		innerRadiusFraction?: number;
		centerLabel?: string;
		centerValue?: string;
		height?: number;
		colors?: readonly string[];
		format?: (v: number) => string;
		showLegend?: boolean;
	}

	let {
		data = [],
		radiusFraction = 0.42,
		innerRadiusFraction = 0.6,
		centerLabel = '',
		centerValue = '',
		height = 360,
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		showLegend = true,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
	const LEGEND_ROW_H = 28;
	const LEGEND_ITEM_H = 20;

	let innerW = $state(0);
	let innerH = $state(0);

	const total = $derived(data.reduce((s, d) => s + d.value, 0));

	const legendItems = $derived(
		data.map((d, i) => ({
			label: d.label,
			color: sliceColor(d, i),
		})),
	);

	const legendDirection = $derived<'row' | 'col'>(legendItems.length > 3 ? 'col' : 'row');
	const legendH = $derived(
		legendDirection === 'col'
			? legendItems.length * LEGEND_ITEM_H + 4
			: LEGEND_ROW_H,
	);

	const outerR = $derived(Math.min(innerW, innerH) * radiusFraction);
	const innerR = $derived(outerR * innerRadiusFraction);

	const cx = $derived(innerW / 2);
	const cy = $derived((innerH - (showLegend ? legendH : 0)) / 2);

	const pieLayout = $derived(
		pie<DonutDatum>()
			.value((d) => d.value)
			.sort(null)(data),
	);

	const arcGen = $derived(
		arc<PieArcDatum<DonutDatum>>()
			.innerRadius(innerR)
			.outerRadius(outerR)
			.padAngle(0.015)
			.cornerRadius(2),
	);

	const labelArcGen = $derived(
		arc<PieArcDatum<DonutDatum>>()
			.innerRadius((outerR + innerR) / 2)
			.outerRadius((outerR + innerR) / 2),
	);

	function sliceColor(d: DonutDatum, i: number): string {
		return d.color ?? colors[i % colors.length];
	}

	const legendSpacing = $derived(
		legendDirection === 'col'
			? LEGEND_ITEM_H
			: Math.min(120, innerW / Math.max(1, legendItems.length)),
	);
	const legendX = $derived(
		legendDirection === 'col'
			? 0
			: Math.max(0, (innerW - legendItems.length * legendSpacing) / 2),
	);
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Donut chart">
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
					{#if angle > 0.35 && outerR > 40}
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

				{#if centerValue || centerLabel}
					{#if centerValue}
						<text
							text-anchor="middle"
							dy={centerLabel ? '-0.2em' : '0.35em'}
							font-size={Math.min(24, innerR * 0.5)}
							font-weight={700}
							font-family={chartFont}
							fill="var(--chart-fg-strong, #000000)"
						>{centerValue}</text>
					{/if}
					{#if centerLabel}
						<text
							text-anchor="middle"
							dy={centerValue ? '1.2em' : '0.35em'}
							font-size={Math.min(11, innerR * 0.22)}
							font-weight={500}
							font-family={chartFont}
							fill="var(--chart-fg-muted, #555555)"
						>{centerLabel}</text>
					{/if}
				{/if}
			</g>

			{#if showLegend && legendItems.length > 0}
				<g transform="translate({legendX}, {innerH - legendH})">
					<Legend items={legendItems} spacing={legendSpacing} direction={legendDirection} />
				</g>
			{/if}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
