<script lang="ts" module>
	export interface WaffleDatum {
		label: string;
		value: number;
		color?: string;
	}
</script>

<script lang="ts">
	import { typography } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Legend from './atoms/Legend.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: WaffleDatum[];
		/** Total number of cells in the grid (default 100 for percentage). */
		totalCells?: number;
		/** Number of columns in the grid. */
		columns?: number;
		height?: number;
		/** Gap between cells in px. */
		cellGap?: number;
		/** Cell corner radius. */
		cellRadius?: number;
		colors?: readonly string[];
		showLegend?: boolean;
		format?: (v: number) => string;
	}

	let {
		data = [],
		totalCells = 100,
		columns = 10,
		height = 360,
		cellGap = 3,
		cellRadius = 2,
		colors = categorical8,
		showLegend = true,
		format = (v: number) => v.toLocaleString(),
	}: Props = $props();

	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
	const LEGEND_H = 28;
	const LEGEND_GAP = 12;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const total = $derived(data.reduce((s, d) => s + d.value, 0));
	const rowCount = $derived(Math.ceil(totalCells / columns));

	function catColor(d: WaffleDatum, i: number): string {
		return d.color ?? colors[i % colors.length];
	}

	/** Assign each cell to a category based on proportional share. */
	const cellAssignments = $derived.by(() => {
		const cells: { catIndex: number; color: string; label: string }[] = [];
		if (total === 0) return cells;

		let remaining = totalCells;
		data.forEach((d, i) => {
			const count = i < data.length - 1
				? Math.round((d.value / total) * totalCells)
				: remaining;
			const c = catColor(d, i);
			for (let j = 0; j < Math.max(0, count); j++) {
				cells.push({ catIndex: i, color: c, label: d.label });
			}
			remaining -= Math.round((d.value / total) * totalCells);
		});

		// Trim or pad to exact totalCells
		while (cells.length > totalCells) cells.pop();
		while (cells.length < totalCells) {
			cells.push({ catIndex: -1, color: '#e5e7eb', label: '' });
		}
		return cells;
	});

	/** Compute cell size to fit within available space. */
	const cellSize = $derived.by(() => {
		const availH = innerH - (showLegend ? LEGEND_H + LEGEND_GAP : 0);
		if (innerW === 0 || availH === 0) return 0;
		const maxW = (innerW - cellGap * (columns - 1)) / columns;
		const maxH = (availH - cellGap * (rowCount - 1)) / rowCount;
		return Math.max(0, Math.min(maxW, maxH));
	});

	/** Grid origin to center it horizontally. */
	const gridW = $derived(columns * cellSize + (columns - 1) * cellGap);
	const gridH = $derived(rowCount * cellSize + (rowCount - 1) * cellGap);
	const offsetX = $derived((innerW - gridW) / 2);
	const offsetY = $derived(((innerH - (showLegend ? LEGEND_H + LEGEND_GAP : 0)) - gridH) / 2);

	const legendItems = $derived(
		data.map((d, i) => ({
			label: d.label,
			color: catColor(d, i),
		})),
	);
</script>

<div bind:this={wrapperEl} class="waffle-wrapper">
	<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Waffle chart">
		<g transform="translate({offsetX},{offsetY})">
			{#each cellAssignments as cell, idx (idx)}
				{@const col = idx % columns}
				{@const row = Math.floor(idx / columns)}
				{@const x = col * (cellSize + cellGap)}
				{@const y = row * (cellSize + cellGap)}
				<rect
					{x}
					{y}
					width={cellSize}
					height={cellSize}
					rx={cellRadius}
					fill={cell.color}
					stroke="white"
					stroke-width={1}
					role="img"
					aria-label={cell.label || 'empty'}
					onmouseenter={(e) => {
						if (!cell.label) return;
						const d = data[cell.catIndex];
						const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
						tooltip = {
							visible: true,
							...relativePos(e, wrapperEl!),
							html: `<strong>${cell.label}</strong><br/>${format(d.value)} (${pct}%)`,
						};
					}}
					onmousemove={(e) => {
						if (!cell.label) return;
						tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
					}}
					onmouseleave={() => {
						tooltip = { ...tooltip, visible: false };
					}}
				/>
			{/each}
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
	.waffle-wrapper {
		position: relative;
		width: 100%;
	}
</style>
