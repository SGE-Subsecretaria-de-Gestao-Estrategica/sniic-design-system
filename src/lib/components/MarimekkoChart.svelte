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
	import { typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import { deriveEffectiveKeys } from '../utils/stackHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import LegendBar from './molecules/LegendBar.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import SegmentLabel from './atoms/SegmentLabel.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

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
	const LEGEND_BAR_H = 34;

	let innerW = $state(0);
	let innerH = $state(0);

	const effectiveKeys = $derived(deriveEffectiveKeys(data, keys, 'label', ['total']));

	const colorMap = $derived(buildColorMap(effectiveKeys, colors));
	const legendItems = $derived(buildLegendItems(effectiveKeys, colorMap, labels));

	const totalWidth = $derived(data.reduce((s, d) => s + d.total, 0));

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

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Marimekko chart">
			{#each columnSegments as col (col.datum.label)}
				{#each col.segments as seg (seg.key)}
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
							show(e, html);
						}}
						onmousemove={move}
						onmouseleave={hide}
					>
						<BarRect
							x={col.x}
							y={seg.y}
							width={col.w}
							height={seg.h}
							fill={seg.fill}
							stroke="none"
							strokeWidth={0}
							shapeRendering="crispEdges"
						/>
						{#if seg.h > 16}
							<SegmentLabel
								text={pctFormat(seg.pct)}
								x={col.x + col.w / 2}
								y={seg.y + seg.h / 2}
								availableWidth={col.w}
								bandHeight={seg.h}
								fill={seg.fill}
								textAnchor="middle"
								fontFamily={chartFont}
							/>
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
					fill="var(--chart-fg-muted, #555555)"
				>{col.datum.label}</text>
			{/each}

			<LegendBar
				items={legendItems}
				y={legendBarY}
				width={innerW}
				height={LEGEND_BAR_H}
				strokeWidth={0}
				fontFamily={chartFont}
			/>
		</ChartFrame>
	{/snippet}
</TooltipContainer>
