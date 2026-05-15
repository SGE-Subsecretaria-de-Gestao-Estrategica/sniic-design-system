<script lang="ts" module>
	export interface MekkoDatum {
		label: string;
		/** Total width value (e.g. market size). Determines column width. */
		total: number;
		/** Breakdown values per segment key. Determines vertical proportions. */
		[key: string]: string | number;
	}
</script>

<script lang="ts">
	import { black, typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../utils/labelHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: MekkoDatum[];
		keys?: string[];
		labels?: Record<string, string>;
		height?: number;
		margin?: Margin;
		colors?: readonly string[];
		format?: (v: number) => string;
		pctFormat?: (v: number) => string;
		columnGap?: number;
	}

	let {
		data = [],
		keys = [],
		labels = {},
		height = 400,
		margin = { top: 16, right: 16, bottom: 72, left: 16 },
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		pctFormat = (v: number) => `${Math.round(v * 100)}%`,
		columnGap = 2,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const STROKE_W = 0.5;
	const LEGEND_BAR_H = 34;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const effectiveKeys = $derived(
		keys.length > 0
			? keys
			: data.length > 0
				? Object.keys(data[0]).filter(
						(k) => k !== 'label' && k !== 'total' && typeof data[0][k] === 'number',
					)
				: [],
	);

	const colorMap = $derived(buildColorMap(effectiveKeys, colors));
	const legendItems = $derived(buildLegendItems(effectiveKeys, colorMap, labels));

	const totalWidth = $derived(data.reduce((s, d) => s + d.total, 0));

	/** Compute column x-positions and widths. */
	const columns = $derived.by(() => {
		const cols: Array<{ datum: MekkoDatum; x: number; w: number }> = [];
		let cumX = 0;
		const gapTotal = Math.max(0, data.length - 1) * columnGap;
		const availableW = innerW - gapTotal;
		const scale = totalWidth > 0 ? availableW / totalWidth : 0;

		for (const datum of data) {
			const w = datum.total * scale;
			cols.push({ datum, x: cumX, w });
			cumX += w + columnGap;
		}
		return cols;
	});

	/** Compute stacked segments for each column. */
	const columnSegments = $derived.by(() => {
		return columns.map(({ datum, x, w }) => {
			const segTotal = effectiveKeys.reduce((s, k) => s + (Number(datum[k]) || 0), 0);
			const segments: Array<{
				key: string;
				y: number;
				h: number;
				value: number;
				pct: number;
				fill: string;
			}> = [];
			let cumY = 0;

			for (const key of effectiveKeys) {
				const value = Number(datum[key]) || 0;
				const pct = segTotal > 0 ? value / segTotal : 0;
				const h = pct * innerH;
				segments.push({
					key,
					y: cumY,
					h,
					value,
					pct,
					fill: colorMap[key] ?? '#999',
				});
				cumY += h;
			}
			return { datum, x, w, segments };
		});
	});

	const legendBarY = $derived(innerH + 18);
</script>

<div bind:this={wrapperEl} class="mekko-wrapper">
	<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Marimekko chart">
		{#each columnSegments as col (col.datum.label)}
			{#each col.segments as seg (seg.key)}
				{@const labelFs = segmentLabelFontSize(seg.h)}
				<g
					role="img"
					aria-label="{labels[seg.key] ?? seg.key}: {format(seg.value)}"
					onmouseenter={(e) => {
						const html = [
							`<strong>${col.datum.label}</strong>`,
							`${labels[seg.key] ?? seg.key}: ${format(seg.value)}`,
							`${pctFormat(seg.pct)}`,
							`Total: ${format(col.datum.total)}`,
						].join('<br/>');
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
						x={col.x}
						y={seg.y}
						width={col.w}
						height={seg.h}
						fill={seg.fill}
						stroke={black}
						strokeWidth={STROKE_W}
						shapeRendering="crispEdges"
					/>
					{#if seg.h > 16 && labelFitsInBar(pctFormat(seg.pct), labelFs, col.w)}
						<text
							x={col.x + col.w / 2}
							y={seg.y + seg.h / 2}
							dy="0.35em"
							text-anchor="middle"
							font-size={labelFs}
							font-weight={700}
							font-family={chartFont}
							fill={getContrastColor(seg.fill)}
							pointer-events="none"
						>{pctFormat(seg.pct)}</text>
					{/if}
				</g>
			{/each}

			<!-- Column label -->
			<text
				x={col.x + col.w / 2}
				y={innerH + 14}
				text-anchor="middle"
				font-size={10}
				font-family={chartFont}
				fill="#555"
			>{col.datum.label}</text>
		{/each}

		<LegendBar
			items={legendItems}
			y={legendBarY}
			width={innerW}
			height={LEGEND_BAR_H}
			strokeWidth={STROKE_W}
			fontFamily={chartFont}
		/>
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.mekko-wrapper {
		position: relative;
		width: 100%;
	}
</style>
