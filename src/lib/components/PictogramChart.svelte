<script lang="ts">
	import type { PictogramDatum } from '../types.js';
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';

	interface Props {
		data?: PictogramDatum[];
		/** How many units each icon represents. */
		unitValue?: number;
		/** Number of icons per row. */
		columns?: number;
		/** Icon size in pixels. */
		iconSize?: number;
		/** Gap between icons. */
		gap?: number;
		/** SVG path for the icon (viewBox 0 0 24 24). */
		iconPath?: string;
		colors?: readonly string[];
		showLabels?: boolean;
		format?: (v: number) => string;
	}

	let {
		data = [],
		unitValue = 1,
		columns = 10,
		iconSize = 20,
		gap = 4,
		iconPath = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
		colors = categorical8,
		showLabels = true,
		format = (v: number) => v.toLocaleString(),
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const LABEL_H = 24;
	const SECTION_GAP = 16;

	const sections = $derived(
		data.map((d, i) => {
			const count = Math.round(d.value / unitValue);
			const rows = Math.ceil(count / columns);
			const color = d.color ?? colors[i % colors.length];
			return { ...d, count, rows, color };
		}),
	);

	const cellSize = $derived(iconSize + gap);

	const totalHeight = $derived.by(() => {
		let h = 0;
		for (const s of sections) {
			if (showLabels) h += LABEL_H;
			h += s.rows * cellSize;
			h += SECTION_GAP;
		}
		return Math.max(100, h);
	});

	const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };
</script>

<ChartFrame responsive height={totalHeight} margin={MARGIN} ariaLabel="Pictogram chart">
	{#each sections as section, si (section.label)}
		{@const yOffset = sections
			.slice(0, si)
			.reduce(
				(acc, s) => acc + (showLabels ? LABEL_H : 0) + s.rows * cellSize + SECTION_GAP,
				0,
			)}

		{#if showLabels}
			<text
				x={0}
				y={yOffset + 14}
				font-size={12}
				font-weight={600}
				font-family={chartFont}
				fill="var(--chart-fg-strong, #000000)"
			>
				{section.label}
				<tspan fill="var(--chart-fg-muted, #555555)" font-weight={400}> ({format(section.value)})</tspan>
			</text>
		{/if}

		{@const gridY = yOffset + (showLabels ? LABEL_H : 0)}
		{#each { length: section.count } as _, iconIdx (iconIdx)}
			{@const col = iconIdx % columns}
			{@const row = Math.floor(iconIdx / columns)}
			<g transform="translate({col * cellSize},{gridY + row * cellSize})">
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 24 24"
					fill={section.color}
					opacity={0.85}
				>
					<path d={iconPath} />
				</svg>
			</g>
		{/each}
	{/each}
</ChartFrame>
