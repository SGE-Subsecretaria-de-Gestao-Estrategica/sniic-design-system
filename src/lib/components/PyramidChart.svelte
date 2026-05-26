<script lang="ts">
	import type { PyramidTier } from '../types.js';
	import { type Margin } from '../tokens.js';
	import { colorPairs, type ColorPair } from '../palettes.js';
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

	const FONT_PAD = 4;
	const STROKE_W = 0.5;
	const PLOT_BOTTOM_RESERVE = 52;

	let containerWidth = $state(0);

	const iw = $derived(containerWidth - margin.left - margin.right);
	const ih = $derived(height - margin.top - margin.bottom);
	const plotH = $derived(ih - PLOT_BOTTOM_RESERVE);
	const cx = $derived(iw / 2);
	const hw = $derived((iw - centerGap) / 2);
	const maxVal = $derived(
		data.length > 0 ? Math.max(...data.map((d) => Math.max(d.left, d.right))) : 1,
	);

	const BAND_PAD = 0.12;
	const bw = $derived(plotH / (data.length + (data.length - 1) * BAND_PAD));
	const bg = $derived(bw * BAND_PAD);

	const rows = $derived(
		data.map((d, i) => {
			const y = i * (bw + bg);
			const lw = (d.left / maxVal) * hw;
			const rw = (d.right / maxVal) * hw;
			const lx = cx - centerGap / 2 - lw;
			const rx = cx + centerGap / 2;
			const midY = y + bw / 2;
			const fs = Math.min(13, Math.max(11, bw * 0.55));
			const lt = format(d.left);
			const rt = format(d.right);
			const leftFits = lw >= FONT_PAD + lt.length * fs * 0.62 + FONT_PAD;
			const rightFits = rw >= FONT_PAD + rt.length * fs * 0.62 + FONT_PAD;
			const tooltipHtml = `<strong>${d.label}</strong><br/>${leftLabel}: ${lt}<br/>${rightLabel}: ${rt}`;
			return { label: d.label, y, lw, rw, lx, rx, midY, fs, lt, rt, leftFits, rightFits, tooltipHtml };
		}),
	);

	const legendY = $derived(plotH + 38);
	const axisLabelY = $derived(plotH + 20);
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<div bind:clientWidth={containerWidth} style="width: 100%;">
			{#if containerWidth > 0}
				<svg
					width={containerWidth}
					{height}
					aria-label="Population pyramid"
					style="overflow: visible; font-family: var(--chart-value-font-family, monospace);"
				>
					<g transform="translate({margin.left}, {margin.top})">
						{#each rows as row (row.label)}
							<!-- Left bar -->
							<g
								role="img"
								aria-label="{row.label} {leftLabel}: {row.lt}"
								onmouseenter={(e) => show(e, row.tooltipHtml)}
								onmousemove={move}
								onmouseleave={hide}
							>
								<rect
									x={row.lx}
									y={row.y}
									width={row.lw}
									height={bw}
									fill={colors[0]}
									stroke="var(--chart-fg-strong, #000000)"
									stroke-width={STROKE_W}
									shape-rendering="crispEdges"
								/>
								{#if row.leftFits}
									<text
										x={row.lx + FONT_PAD}
										y={row.midY}
										dy="0.35em"
										font-size={row.fs}
										font-weight="700"
										fill="white"
										text-anchor="start"
										pointer-events="none"
									>{row.lt}</text>
								{:else if row.lw > 0}
									<text
										x={row.lx - FONT_PAD}
										y={row.midY}
										dy="0.35em"
										font-size={row.fs}
										font-weight="700"
										fill={colors[0]}
										text-anchor="end"
										pointer-events="none"
									>{row.lt}</text>
								{/if}
							</g>

							<!-- Right bar -->
							<g
								role="img"
								aria-label="{row.label} {rightLabel}: {row.rt}"
								onmouseenter={(e) => show(e, row.tooltipHtml)}
								onmousemove={move}
								onmouseleave={hide}
							>
								<rect
									x={row.rx}
									y={row.y}
									width={row.rw}
									height={bw}
									fill={colors[1]}
									stroke="var(--chart-fg-strong, #000000)"
									stroke-width={STROKE_W}
									shape-rendering="crispEdges"
								/>
								{#if row.rightFits}
									<text
										x={row.rx + row.rw - FONT_PAD}
										y={row.midY}
										dy="0.35em"
										font-size={row.fs}
										font-weight="700"
										fill="white"
										text-anchor="end"
										pointer-events="none"
									>{row.rt}</text>
								{:else if row.rw > 0}
									<text
										x={row.rx + row.rw + FONT_PAD}
										y={row.midY}
										dy="0.35em"
										font-size={row.fs}
										font-weight="700"
										fill={colors[1]}
										text-anchor="start"
										pointer-events="none"
									>{row.rt}</text>
								{/if}
							</g>

							<!-- Center label -->
							<text
								x={cx}
								y={row.midY}
								dy="0.35em"
								font-size={Math.min(11, bw * 0.55)}
								font-weight="600"
								text-anchor="middle"
								fill="var(--chart-fg-strong, #000000)"
							>{row.label}</text>
						{/each}

						<!-- Axis labels -->
						<text
							x={0}
							y={axisLabelY}
							font-size="11"
							text-anchor="start"
							fill="var(--chart-fg-strong, #000000)"
						>← {leftLabel}</text>
						<text
							x={iw}
							y={axisLabelY}
							font-size="11"
							text-anchor="end"
							fill="var(--chart-fg-strong, #000000)"
						>{rightLabel} →</text>

						<!-- Legend -->
						<g transform="translate({cx}, {legendY})" text-anchor="middle">
							<rect x={-80} y={-8} width={14} height={14} fill={colors[0]} />
							<text x={-62} y={-1} dy="0.35em" font-size="11" text-anchor="start" fill="var(--chart-fg-strong, #000000)">{leftLabel}</text>
							<rect x={20} y={-8} width={14} height={14} fill={colors[1]} />
							<text x={38} y={-1} dy="0.35em" font-size="11" text-anchor="start" fill="var(--chart-fg-strong, #000000)">{rightLabel}</text>
						</g>
					</g>
				</svg>
			{/if}
		</div>
	{/snippet}
</TooltipContainer>
