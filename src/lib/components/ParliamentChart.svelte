<script lang="ts" module>
	export interface ParliamentDatum {
		label: string;
		seats: number;
		color?: string;
	}
</script>

<script lang="ts">
	import { categorical8 } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Legend from './atoms/Legend.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: ParliamentDatum[];
		height?: number;
		rows?: number;
		seatGap?: number;
		colors?: readonly string[];
		showLegend?: boolean;
	}

	let {
		data = [],
		height = 360,
		rows = 4,
		seatGap = 0.4,
		colors = categorical8,
		showLegend = true,
	}: Props = $props();

	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
	const LEGEND_H = 28;
	const LEGEND_GAP = 12;

	let innerW = $state(0);
	let innerH = $state(0);

	const totalSeats = $derived(data.reduce((s, d) => s + d.seats, 0));

	function seatColor(d: ParliamentDatum, i: number): string {
		return d.color ?? colors[i % colors.length];
	}

	const seatList = $derived.by(() => {
		const list: { partyIndex: number; label: string; color: string }[] = [];
		data.forEach((d, i) => {
			const c = seatColor(d, i);
			for (let s = 0; s < d.seats; s++) {
				list.push({ partyIndex: i, label: d.label, color: c });
			}
		});
		return list;
	});

	const seatPositions = $derived.by(() => {
		if (totalSeats === 0 || innerW === 0 || innerH === 0) return [];

		const availH = innerH - (showLegend ? LEGEND_H + LEGEND_GAP : 0);
		const maxR = Math.min(innerW / 2, availH) * 0.92;
		const minR = maxR * 0.35;

		const radialStep = (maxR - minR) / rows;
		const seatR = (radialStep / (2 + seatGap)) * 0.9;

		const rowRadii: number[] = [];
		let totalArcLen = 0;
		for (let r = 0; r < rows; r++) {
			const radius = minR + radialStep * (r + 0.5);
			rowRadii.push(radius);
			totalArcLen += Math.PI * radius;
		}

		const seatsPerRow: number[] = [];
		let assigned = 0;
		for (let r = 0; r < rows; r++) {
			const frac = (Math.PI * rowRadii[r]) / totalArcLen;
			const count = r < rows - 1 ? Math.round(frac * totalSeats) : totalSeats - assigned;
			seatsPerRow.push(count);
			assigned += count;
		}

		const positions: { cx: number; cy: number; r: number }[] = [];
		const originX = innerW / 2;
		const originY = availH * 0.95;

		for (let row = 0; row < rows; row++) {
			const n = seatsPerRow[row];
			if (n <= 0) continue;
			const radius = rowRadii[row];
			for (let s = 0; s < n; s++) {
				const angle = Math.PI - (Math.PI * (s + 0.5)) / n;
				positions.push({
					cx: originX + radius * Math.cos(angle),
					cy: originY - radius * Math.sin(angle),
					r: seatR,
				});
			}
		}

		return positions;
	});

	const legendItems = $derived(
		data.map((d, i) => ({
			label: `${d.label} (${d.seats})`,
			color: seatColor(d, i),
		})),
	);
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Parliament chart">
			{#each seatPositions as pos, i (i)}
				{@const seat = seatList[i]}
				{#if seat}
					<circle
						cx={pos.cx}
						cy={pos.cy}
						r={pos.r}
						fill={seat.color}
						stroke="var(--chart-bg, white)"
						stroke-width={Math.max(0.5, pos.r * 0.15)}
						role="img"
						aria-label="{seat.label}"
						onmouseenter={(e) => show(e, `<strong>${seat.label}</strong><br/>${data[seat.partyIndex].seats} seats`)}
						onmousemove={move}
						onmouseleave={hide}
					/>
				{/if}
			{/each}

			{#if showLegend && legendItems.length > 0}
				<g transform="translate(0, {innerH - LEGEND_H})">
					<Legend items={legendItems} spacing={Math.min(140, innerW / legendItems.length)} />
				</g>
			{/if}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
