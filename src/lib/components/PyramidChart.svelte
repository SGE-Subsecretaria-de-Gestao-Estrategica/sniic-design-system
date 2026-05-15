<script lang="ts" module>
	export interface PyramidTier {
		label: string;
		left: number;
		right: number;
	}
</script>

<script lang="ts">
	import { scaleLinear, scaleBand, max } from 'd3';
	import { black, typography, type Margin } from '../tokens.js';
	import { colorPairs, type ColorPair } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../utils/labelHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: PyramidTier[];
		leftLabel?: string;
		rightLabel?: string;
		height?: number;
		margin?: Margin;
		colors?: ColorPair;
		format?: (v: number) => string;
		/** Gap between the two sides in pixels. */
		centerGap?: number;
	}

	let {
		data = [],
		leftLabel = 'Masculino',
		rightLabel = 'Feminino',
		height = 420,
		margin = { top: 16, right: 16, bottom: 68, left: 16 },
		colors = colorPairs.bluePurple,
		format = (v: number) => v.toLocaleString(),
		centerGap = 48,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const STROKE_W = 0.5;
	const LEGEND_BAR_H = 34;
	const LABEL_PAD = 4;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const barAreaH = $derived(innerH - LEGEND_BAR_H - 18);
	const halfW = $derived((innerW - centerGap) / 2);
	const centerX = $derived(innerW / 2);

	const maxVal = $derived(
		max(data, (d) => Math.max(d.left, d.right)) ?? 1,
	);

	const xScaleLeft = $derived(
		scaleLinear().domain([0, maxVal]).range([0, halfW]).nice(),
	);

	const xScaleRight = $derived(
		scaleLinear().domain([0, maxVal]).range([0, halfW]).nice(),
	);

	const yScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.label))
			.range([barAreaH, 0])
			.padding(0.12),
	);

	const legendItems = $derived([
		{ label: leftLabel, color: colors[0] },
		{ label: rightLabel, color: colors[1] },
	]);

	const legendBarY = $derived(barAreaH + 18);
</script>

<div bind:this={wrapperEl} class="pyramid-wrapper">
	<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Population pyramid">
		{#each data as d (d.label)}
			{@const yPos = yScale(d.label) ?? 0}
			{@const band = yScale.bandwidth()}
			{@const leftW = xScaleLeft(d.left)}
			{@const rightW = xScaleRight(d.right)}
			{@const leftX = centerX - centerGap / 2 - leftW}
			{@const rightX = centerX + centerGap / 2}
			{@const labelFs = segmentLabelFontSize(band)}

			<!-- Left bar -->
			<g
				role="img"
				aria-label="{d.label} {leftLabel}: {format(d.left)}"
				onmouseenter={(e) => {
					const html = `<strong>${d.label}</strong><br/>${leftLabel}: ${format(d.left)}<br/>${rightLabel}: ${format(d.right)}`;
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
					x={leftX}
					y={yPos}
					width={leftW}
					height={band}
					fill={colors[0]}
					stroke={black}
					strokeWidth={STROKE_W}
					shapeRendering="crispEdges"
				/>
				{#if labelFitsInBar(format(d.left), labelFs, leftW, LABEL_PAD, LABEL_PAD)}
					<text
						x={leftX + LABEL_PAD}
						y={yPos + band / 2}
						dy="0.35em"
						font-size={labelFs}
						font-weight={700}
						font-family={chartFont}
						fill={getContrastColor(colors[0])}
						pointer-events="none"
					>{format(d.left)}</text>
				{/if}
			</g>

			<!-- Right bar -->
			<g
				role="img"
				aria-label="{d.label} {rightLabel}: {format(d.right)}"
				onmouseenter={(e) => {
					const html = `<strong>${d.label}</strong><br/>${leftLabel}: ${format(d.left)}<br/>${rightLabel}: ${format(d.right)}`;
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
					x={rightX}
					y={yPos}
					width={rightW}
					height={band}
					fill={colors[1]}
					stroke={black}
					strokeWidth={STROKE_W}
					shapeRendering="crispEdges"
				/>
				{#if labelFitsInBar(format(d.right), labelFs, rightW, LABEL_PAD, LABEL_PAD)}
					<text
						x={rightX + rightW - LABEL_PAD}
						y={yPos + band / 2}
						dy="0.35em"
						text-anchor="end"
						font-size={labelFs}
						font-weight={700}
						font-family={chartFont}
						fill={getContrastColor(colors[1])}
						pointer-events="none"
					>{format(d.right)}</text>
				{/if}
			</g>

			<!-- Center age label -->
			<text
				x={centerX}
				y={yPos + band / 2}
				dy="0.35em"
				text-anchor="middle"
				font-size={Math.min(11, band * 0.55)}
				font-weight={600}
				font-family={chartFont}
				fill={black}
			>{d.label}</text>
		{/each}

		<!-- Center axis line -->
		<line
			x1={centerX - centerGap / 2}
			x2={centerX - centerGap / 2}
			y1={0}
			y2={barAreaH}
			stroke={black}
			stroke-width={STROKE_W}
			stroke-opacity={0.3}
		/>
		<line
			x1={centerX + centerGap / 2}
			x2={centerX + centerGap / 2}
			y1={0}
			y2={barAreaH}
			stroke={black}
			stroke-width={STROKE_W}
			stroke-opacity={0.3}
		/>

		<LegendBar
			items={legendItems}
			y={legendBarY}
			width={innerW}
			height={LEGEND_BAR_H}
			strokeWidth={STROKE_W}
			fontFamily={chartFont}
			centered
		/>
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.pyramid-wrapper {
		position: relative;
		width: 100%;
	}
</style>
