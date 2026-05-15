<script lang="ts" module>
	export interface DonutDatum {
		label: string;
		value: number;
		color?: string;
	}
</script>

<script lang="ts">
	import { pie, arc, type PieArcDatum } from 'd3';
	import { typography, black } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Legend from './atoms/Legend.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: DonutDatum[];
		/** Outer radius as a fraction of the available size (0–1). */
		radiusFraction?: number;
		/** Inner radius as a fraction of the outer radius (0 = pie, 0.6 = donut). */
		innerRadiusFraction?: number;
		/** Label shown in the center hole. */
		centerLabel?: string;
		/** Value shown in the center hole. */
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
	const LEGEND_H = 28;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const total = $derived(data.reduce((s, d) => s + d.value, 0));

	const outerR = $derived(Math.min(innerW, innerH) * radiusFraction);
	const innerR = $derived(outerR * innerRadiusFraction);

	const cx = $derived(innerW / 2);
	const cy = $derived((innerH - (showLegend ? LEGEND_H : 0)) / 2);

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

	const legendItems = $derived(
		data.map((d, i) => ({
			label: d.label,
			color: sliceColor(d, i),
		})),
	);
</script>

<div bind:this={wrapperEl} class="donut-wrapper">
	<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Donut chart">
		<g transform="translate({cx},{cy})">
			{#each pieLayout as slice, i (slice.data.label)}
				{@const fill = sliceColor(slice.data, i)}
				{@const centroid = labelArcGen.centroid(slice)}
				{@const angle = slice.endAngle - slice.startAngle}
				<path
					d={arcGen(slice) ?? ''}
					{fill}
					stroke="white"
					stroke-width={1.5}
					role="img"
					aria-label="{slice.data.label}: {format(slice.data.value)}"
					onmouseenter={(e) => {
						const pct = total > 0 ? ((slice.data.value / total) * 100).toFixed(1) : '0';
						const html = `<strong>${slice.data.label}</strong><br/>${format(slice.data.value)} (${pct}%)`;
						tooltip = { visible: true, ...relativePos(e, wrapperEl!), html };
					}}
					onmousemove={(e) => {
						tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
					}}
					onmouseleave={() => {
						tooltip = { ...tooltip, visible: false };
					}}
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
						fill={black}
					>{centerValue}</text>
				{/if}
				{#if centerLabel}
					<text
						text-anchor="middle"
						dy={centerValue ? '1.2em' : '0.35em'}
						font-size={Math.min(11, innerR * 0.22)}
						font-weight={500}
						font-family={chartFont}
						fill="#666"
					>{centerLabel}</text>
				{/if}
			{/if}
		</g>

		{#if showLegend && legendItems.length > 0}
			<g transform="translate(0, {innerH - LEGEND_H})">
				<Legend items={legendItems} spacing={Math.min(120, innerW / legendItems.length)} />
			</g>
		{/if}
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.donut-wrapper {
		position: relative;
		width: 100%;
	}
</style>
