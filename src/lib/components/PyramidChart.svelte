<script lang="ts" module>
	export interface PyramidTier {
		label: string;
		left: number;
		right: number;
	}
</script>

<script lang="ts">
	import { scaleLinear, scaleBand, max } from 'd3';
	import { typography, type Margin } from '../tokens.js';
	import { colorPairs, type ColorPair } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import SegmentLabel from './atoms/SegmentLabel.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: PyramidTier[];
		leftLabel?: string;
		rightLabel?: string;
		height?: number;
		margin?: Margin;
		colors?: ColorPair;
		format?: (v: number) => string;
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

	let innerW = $state(0);
	let innerH = $state(0);

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

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Population pyramid">
			{#each data as d (d.label)}
				{@const yPos = yScale(d.label) ?? 0}
				{@const band = yScale.bandwidth()}
				{@const leftW = xScaleLeft(d.left)}
				{@const rightW = xScaleRight(d.right)}
				{@const leftX = centerX - centerGap / 2 - leftW}
				{@const rightX = centerX + centerGap / 2}
				{@const tooltipHtml = `<strong>${d.label}</strong><br/>${leftLabel}: ${format(d.left)}<br/>${rightLabel}: ${format(d.right)}`}

				<!-- Left bar -->
				<g
					role="img"
					aria-label="{d.label} {leftLabel}: {format(d.left)}"
					onmouseenter={(e) => show(e, tooltipHtml)}
					onmousemove={move}
					onmouseleave={hide}
				>
					<BarRect
						x={leftX}
						y={yPos}
						width={leftW}
						height={band}
						fill={colors[0]}
						stroke="var(--chart-fg-strong, #000000)"
						strokeWidth={STROKE_W}
						shapeRendering="crispEdges"
					/>
					<SegmentLabel
						text={format(d.left)}
						x={leftX + LABEL_PAD}
						y={yPos + band / 2}
						availableWidth={leftW}
						bandHeight={band}
						fill={colors[0]}
						padding={LABEL_PAD}
						rightMargin={LABEL_PAD}
						fontFamily={chartFont}
					/>
				</g>

				<!-- Right bar -->
				<g
					role="img"
					aria-label="{d.label} {rightLabel}: {format(d.right)}"
					onmouseenter={(e) => show(e, tooltipHtml)}
					onmousemove={move}
					onmouseleave={hide}
				>
					<BarRect
						x={rightX}
						y={yPos}
						width={rightW}
						height={band}
						fill={colors[1]}
						stroke="var(--chart-fg-strong, #000000)"
						strokeWidth={STROKE_W}
						shapeRendering="crispEdges"
					/>
					<SegmentLabel
						text={format(d.right)}
						x={rightX + rightW - LABEL_PAD}
						y={yPos + band / 2}
						availableWidth={rightW}
						bandHeight={band}
						fill={colors[1]}
						textAnchor="end"
						padding={LABEL_PAD}
						rightMargin={LABEL_PAD}
						fontFamily={chartFont}
					/>
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
					fill="var(--chart-fg-strong, #000000)"
				>{d.label}</text>
			{/each}

			<!-- Center axis lines -->
			<line
				x1={centerX - centerGap / 2}
				x2={centerX - centerGap / 2}
				y1={0}
				y2={barAreaH}
				stroke="var(--chart-fg-strong, #000000)"
				stroke-width={STROKE_W}
				stroke-opacity={0.3}
			/>
			<line
				x1={centerX + centerGap / 2}
				x2={centerX + centerGap / 2}
				y1={0}
				y2={barAreaH}
				stroke="var(--chart-fg-strong, #000000)"
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
	{/snippet}
</TooltipContainer>
