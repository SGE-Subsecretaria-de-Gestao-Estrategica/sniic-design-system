<script lang="ts" module>
	export type { RegionDatum } from '../charts/brazilRegions.js';
</script>

<script lang="ts">
	import { scaleSqrt, max } from 'd3';
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import {
		BRAZIL_REGION_PATHS,
		BRAZIL_REGION_LABELS,
		type RegionDatum,
	} from '../charts/brazilRegions.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: RegionDatum[];
		maxSize?: number;
		colors?: readonly string[];
		format?: (v: number) => string;
		showLabels?: boolean;
	}

	let {
		data = [],
		maxSize = 80,
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		showLabels = true,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	let innerW = $state(0);

	const LABEL_SPACE = 32;
	const ITEM_GAP = 16;
	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };

	const maxVal = $derived(max(data, (d) => d.value) ?? 1);

	// scale maps value → scale factor for the 100×100 silhouette box.
	// maxSize is the desired half-size of the largest silhouette (in px).
	const sScale = $derived(scaleSqrt().domain([0, maxVal]).range([0, maxSize / 50]));

	interface PositionedItem {
		d: RegionDatum;
		cx: number;
		cy: number;
		scale: number;
		color: string;
		path: string;
		label: string;
	}

	const positioned = $derived.by(() => {
		const sorted = [...data].sort((a, b) => b.value - a.value);
		const items: PositionedItem[] = [];
		let curX = 0;
		let curY = maxSize;
		let rowMaxHalf = 0;

		for (let i = 0; i < sorted.length; i++) {
			const d = sorted[i];
			const path = BRAZIL_REGION_PATHS[d.region];
			if (!path) continue;

			const s = sScale(d.value);
			const half = 50 * s; // half-size of bounding box
			const color = d.color ?? colors[i % colors.length];
			const label = BRAZIL_REGION_LABELS[d.region];

			if (curX + half * 2 > innerW && curX > 0) {
				curY += rowMaxHalf + maxSize + (showLabels ? LABEL_SPACE : 0);
				curX = 0;
				rowMaxHalf = 0;
			}

			const cx = curX + half;
			items.push({ d, cx, cy: curY, scale: s, color, path, label });
			curX += half * 2 + ITEM_GAP;
			if (half > rowMaxHalf) rowMaxHalf = half;
		}

		return items;
	});

	const height = $derived.by(() => {
		if (positioned.length === 0) return 200;
		const maxY = Math.max(
			...positioned.map((p) => {
				const half = 50 * p.scale;
				return showLabels ? p.cy + half + LABEL_SPACE : p.cy + half;
			}),
		);
		return maxY + MARGIN.top + MARGIN.bottom + 8;
	});
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame
			responsive
			{height}
			margin={MARGIN}
			bind:innerWidth={innerW}
			ariaLabel="Proportional region silhouette chart"
		>
			{#each positioned as item (item.d.region)}
				{@const half = 50 * item.scale}
				{@const tx = item.cx - half}
				{@const ty = item.cy - half}

				<g
					transform="translate({tx},{ty}) scale({item.scale})"
					style="cursor: pointer"
					role="img"
					aria-label={item.label}
					onmouseenter={(e) =>
						show(e, `<strong>${item.label}</strong><br/>${format(item.d.value)}`)}
					onmousemove={move}
					onmouseleave={hide}
				>
					<path
						d={item.path}
						fill={item.color}
						fill-opacity="0.85"
						stroke={item.color}
						stroke-width={1 / item.scale}
						stroke-linejoin="round"
					/>
				</g>

				{#if showLabels}
					<line
						x1={item.cx}
						y1={item.cy + half}
						x2={item.cx}
						y2={item.cy + half + 10}
						stroke="var(--chart-fg-muted, #555555)"
						stroke-width={1}
						opacity={0.5}
					/>
					<text
						x={item.cx}
						y={item.cy + half + 20}
						text-anchor="middle"
						font-size={11}
						font-weight={600}
						font-family={chartFont}
						fill="var(--chart-fg-strong, #000000)"
						pointer-events="none"
					>{item.label}</text>
					<text
						x={item.cx}
						y={item.cy + half + 32}
						text-anchor="middle"
						font-size={9}
						font-weight={500}
						font-family={chartFont}
						fill="var(--chart-fg-strong, #000000)"
						opacity={0.7}
						pointer-events="none"
					>{format(item.d.value)}</text>
				{/if}
			{/each}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
