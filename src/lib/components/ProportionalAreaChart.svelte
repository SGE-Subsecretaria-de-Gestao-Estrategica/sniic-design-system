<script lang="ts" module>
	export interface ProportionalDatum {
		label: string;
		value: number;
		color?: string;
	}
</script>

<script lang="ts">
	import { scaleSqrt, max } from 'd3';
	import { typography, black } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';
	import { labelFitsInCircle } from '../utils/labelHelpers.js';

	interface Props {
		data?: ProportionalDatum[];
		/** Maximum circle radius. */
		maxRadius?: number;
		colors?: readonly string[];
		format?: (v: number) => string;
		showLabels?: boolean;
	}

	let {
		data = [],
		maxRadius = 80,
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		showLabels = true,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const maxVal = $derived(max(data, (d) => d.value) ?? 1);
	const rScale = $derived(scaleSqrt().domain([0, maxVal]).range([0, maxRadius]));

	const LABEL_SPACE = 28;
	const LEADER_LINE_LEN = 16;
	const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };

	interface PositionedItem {
		d: ProportionalDatum;
		cx: number;
		cy: number;
		r: number;
		color: string;
		fitsInside: boolean;
	}

	/** Check if both label and value text fit inside a circle. */
	function bothLabelsFit(label: string, value: number, r: number): boolean {
		const labelSize = Math.min(12, r * 0.4);
		const valueSize = Math.min(10, r * 0.35);
		const labelFits = labelFitsInCircle(label, labelSize, r, -0.2);
		const valueFits = labelFitsInCircle(format(value), valueSize, r, 1.1);
		return labelFits && valueFits;
	}

	/** Lay out circles left-to-right, wrapping when needed. */
	const positioned = $derived.by(() => {
		const sorted = [...data].sort((a, b) => b.value - a.value);
		const items: PositionedItem[] = [];
		let curX = 0;
		let curY = maxRadius;
		let rowMaxR = 0;

		for (let i = 0; i < sorted.length; i++) {
			const d = sorted[i];
			const r = rScale(d.value);
			const color = d.color ?? colors[i % colors.length];
			const fitsInside = r > 8 && bothLabelsFit(d.label, d.value, r);

			if (curX + r * 2 > innerW && curX > 0) {
				curY += rowMaxR + maxRadius + (showLabels ? LABEL_SPACE : 0);
				curX = 0;
				rowMaxR = 0;
			}

			const cx = curX + r;
			items.push({ d, cx, cy: curY, r, color, fitsInside });
			curX += r * 2 + 12;
			if (r > rowMaxR) rowMaxR = r;
		}

		return items;
	});

	const height = $derived.by(() => {
		if (positioned.length === 0) return 200;
		const maxY = Math.max(
			...positioned.map((p) => {
				if (showLabels && !p.fitsInside) {
					return p.cy + p.r + LEADER_LINE_LEN + 28;
				}
				return p.cy + p.r;
			}),
		);
		return maxY + MARGIN.top + MARGIN.bottom + 8;
	});
</script>

<div bind:this={wrapperEl} class="prop-area-wrapper">
	<ChartFrame responsive {height} margin={MARGIN} bind:innerWidth={innerW} ariaLabel="Proportional area chart">
		{#each positioned as { d, cx, cy, r, color, fitsInside } (d.label)}
			<g
				transform="translate({cx},{cy})"
				style="cursor: pointer"
				role="img"
				aria-label={d.label}
				onmouseenter={(e) => {
					tooltip = {
						visible: true,
						...relativePos(e, wrapperEl!),
						html: `<strong>${d.label}</strong><br/>${format(d.value)}`,
					};
				}}
				onmousemove={(e) => {
					tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
				}}
				onmouseleave={() => {
					tooltip = { ...tooltip, visible: false };
				}}
			>
				<circle {r} fill={color} opacity={0.8} />
				{#if showLabels && fitsInside}
					<text
						text-anchor="middle"
						dy="-0.2em"
						font-size={Math.min(12, r * 0.4)}
						font-weight={600}
						font-family={chartFont}
						fill="white"
						pointer-events="none"
					>{d.label}</text>
					<text
						text-anchor="middle"
						dy="1.1em"
						font-size={Math.min(10, r * 0.35)}
						font-weight={500}
						font-family={chartFont}
						fill="white"
						pointer-events="none"
					>{format(d.value)}</text>
				{/if}
			</g>

			{#if showLabels && !fitsInside}
				<!-- Leader line from circle bottom to external label -->
				<line
					x1={cx}
					y1={cy + r}
					x2={cx}
					y2={cy + r + LEADER_LINE_LEN}
					stroke={black}
					stroke-width={1}
					opacity={0.5}
				/>
				<text
					x={cx}
					y={cy + r + LEADER_LINE_LEN + 12}
					text-anchor="middle"
					font-size={10}
					font-weight={600}
					font-family={chartFont}
					fill={black}
					pointer-events="none"
				>{d.label}</text>
				<text
					x={cx}
					y={cy + r + LEADER_LINE_LEN + 24}
					text-anchor="middle"
					font-size={9}
					font-weight={500}
					font-family={chartFont}
					fill={black}
					opacity={0.7}
					pointer-events="none"
				>{format(d.value)}</text>
			{/if}
		{/each}
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.prop-area-wrapper {
		position: relative;
		width: 100%;
	}
</style>
