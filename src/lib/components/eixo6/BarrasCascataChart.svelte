<script lang="ts">
	/**
	 * Cascata: dois estoques e as parcelas que levam de um ao outro.
	 *
	 * Every step is a vertical `CapsuleBar`. A stock (`base`, `total`) stands
	 * on zero; a change (`delta`) floats with its flat base on the running
	 * total it found and its round tip where it leaves it — up for a gain,
	 * hanging down for a loss. The bar is clipped to exactly its interval, so
	 * the round tip never adds length the value does not have, and a step too
	 * small to show its cap draws as a sliver rather than being inflated.
	 *
	 * There is no y axis: each step's value is written past its tip, the way
	 * every chart in the family labels its marks. The closing stock gets the
	 * emphasised value — larger, bold, in the accent — the way a line chart
	 * marks its last point. Thin dashed connectors carry the running total
	 * from one step to the next.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import CapsuleBar from '$lib/core/components/shape/CapsuleBar.svelte';
	import { capsuleBarLayout } from '$lib/core/layouts/capsuleBar';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { BarrasCascataDatum } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: BarrasCascataDatum[];
			/** Stocks and the running total. */
			formatValue?: (value: number) => string;
			/** Changes, signed. Defaults to `formatValue` with a sign. */
			formatDelta?: (value: number) => string;
			/** Height of the plot itself, without labels; ignored when `height` is set. */
			plotHeight?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		data,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		formatValue = (value: number) =>
			formatCompactNumber(value, Math.abs(value) >= 1e6 ? 1 : 0),
		formatDelta,
		plotHeight: plotHeightProp = 240,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	/** Stocks open, changes follow, the closing stock lands last; `-1` shows everything. */
	const stageOf = { base: 0, delta: 1, total: 2 } as const;
	const shows = (stage: number) => step < 0 || step >= stage;

	let deltaText = $derived(
		formatDelta ?? ((value: number) => `${value > 0 ? '+' : ''}${formatValue(value)}`)
	);

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	/** Room above the tallest tip for its value. */
	const VALUE_ROOM = 26;
	const LABEL_GAP = 10;
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	const detailSize = Tokens.fontSize.xs;

	let plotWidth = $derived(Math.max(0, shellWidth - 16));
	let band = $derived(
		d3
			.scaleBand<number>()
			.domain(data.map((_, i) => i))
			.range([0, plotWidth])
			.paddingInner(0.3)
			.paddingOuter(0.05)
	);
	let labelWidth = $derived(Math.max(0, band.step() - Tokens.spacing.sm));
	let thickness = $derived(Math.min(band.bandwidth() * 0.7, compact ? 30 : 44));

	/** Names and their breakdowns sit under the baseline; the tallest sets the margin. */
	let labelLines = $derived(Math.max(1, ...data.map((d) => wrappedLineCount(d.label, labelWidth))));
	let detailLines = $derived(Math.max(0, ...data.map((d) => d.detail?.length ?? 0)));
	let labelsHeight = $derived(
		LABEL_GAP +
			labelLines * labelSize * 1.1 +
			(detailLines ? Tokens.spacing.xs + detailLines * detailSize * 1.25 : 0)
	);

	let margin = $derived({ top: 4, right: 8, bottom: labelsHeight + 4, left: 8 });
	let figureHeight = $derived(height ?? VALUE_ROOM + plotHeightProp + margin.top + margin.bottom);
	let plotHeight = $derived(Math.max(0, figureHeight - margin.top - margin.bottom));

	/** Each step with the interval it spans: stocks from zero, changes from the running total. */
	let steps = $derived.by(() => {
		let running = 0;
		return data.map((d) => {
			if (d.type === 'delta') {
				const start = running;
				running += d.value;
				return { ...d, start, end: running };
			}
			running = d.value;
			return { ...d, start: 0, end: d.value };
		});
	});

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain([
				Math.min(0, d3.min(steps, (d) => Math.min(d.start, d.end)) ?? 0),
				d3.max(steps, (d) => Math.max(d.start, d.end)) || 1
			])
			.range([plotHeight, VALUE_ROOM])
	);

	type Column = (typeof steps)[number] & {
		index: number;
		center: number;
		/** Top and bottom of the bar's interval, in px. */
		top: number;
		bottom: number;
		/** A loss hangs from its base; everything else grows up from it. */
		falls: boolean;
		valueText: string;
		runningText: string;
		isLast: boolean;
	};

	let columns = $derived<Column[]>(
		steps.map((d, i) => {
			const center = (band(i) ?? 0) + band.bandwidth() / 2;
			const y0 = yScale(d.start);
			const y1 = yScale(d.end);
			return {
				...d,
				index: i,
				center,
				top: Math.min(y0, y1),
				bottom: Math.max(y0, y1),
				falls: d.end < d.start,
				valueText: d.type === 'delta' ? deltaText(d.value) : formatValue(d.value),
				runningText: formatValue(d.end),
				isLast: i === steps.length - 1
			};
		})
	);

	let zeroY = $derived(yScale(0));

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeColumn = $derived(activeIndex === null ? null : columns[activeIndex]);

	function dimmed(label: string) {
		return highlight !== null && highlight !== label;
	}

	let tooltip = $derived(
		activeColumn
			? {
					title: activeColumn.label,
					rows:
						activeColumn.type === 'delta'
							? [
									{
										label: 'Variação',
										value: activeColumn.valueText,
										color: theme.palette.primaryVariant,
										emphasis: true
									},
									{ label: 'Acumulado', value: activeColumn.runningText }
								]
							: [
									{
										label: 'Total',
										value: activeColumn.valueText,
										color: theme.palette.primaryVariant,
										emphasis: true
									}
								]
				}
			: null
	);

	let table = $derived({
		caption: title ?? 'Cascata',
		columns: ['Etapa', 'Valor', 'Acumulado'],
		rows: columns.map((d) => [d.label, d.valueText, d.runningText])
	});
</script>

<ChartShell
	{theme}
	{width}
	bind:measuredWidth={shellWidth}
	height={figureHeight}
	{margin}
	{title}
	{subtitle}
	{source}
	{hover}
	{tooltip}
	{table}
	ariaLabel={title ?? 'Cascata'}
>
	{#snippet children({ container })}
		{#if columns.length && plotWidth > 0}
			<!-- Connectors, behind the bars: each step starts where the last one stopped. -->
			{#each columns.slice(0, -1) as d, i (d.index)}
				{@const next = columns[i + 1]}
				<g class="fade" style:opacity={shows(stageOf[next.type]) ? 1 : 0}>
					<Line
						from={{ x: d.center, y: yScale(d.end) }}
						to={{ x: next.center, y: yScale(d.end) }}
						stroke={theme.palette.neutral[100]}
						strokeOpacity={0.6}
						strokeWidth={Tokens.strokeWidth.xs}
						strokeDasharray="3,4"
					/>
				</g>
			{/each}

			{#each columns as d (d.index)}
				{@const isActive = d.index === activeIndex}
				<g class="fade" style:opacity={shows(stageOf[d.type]) ? (dimmed(d.label) ? 0.25 : 1) : 0}>
					<CapsuleBar
						layout={capsuleBarLayout({
							orientation: 'vertical',
							reverse: d.falls,
							x: d.center - thickness / 2,
							y: d.top,
							width: thickness,
							height: d.bottom - d.top,
						})}
						fill={d.fill}
					/>

					<!-- The value sits past the tip: above a rise, below a fall. -->
					<Text
						dx={d.center}
						dy={d.falls ? d.bottom + Tokens.spacing.sm : d.top - Tokens.spacing.sm}
						text={d.valueText}
						textAnchor="middle"
						verticalAnchor={d.falls ? 'start' : 'end'}
						fontSize={d.isLast && d.type === 'total' ? Tokens.fontSize.lg : labelSize}
						fontWeight={d.isLast || isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.semibold}
						fill={d.isLast && d.type === 'total' ? theme.palette.accent : theme.palette.neutral[300]}
					/>

					<Text
						dx={d.center}
						dy={plotHeight + LABEL_GAP}
						width={labelWidth}
						text={d.label}
						textAnchor="middle"
						verticalAnchor="start"
						fontSize={labelSize}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>
					{#each d.detail ?? [] as line, j (j)}
						<Text
							dx={d.center}
							dy={plotHeight +
								LABEL_GAP +
								labelLines * labelSize * 1.1 +
								Tokens.spacing.xs +
								j * detailSize * 1.25}
							text={line}
							textAnchor="middle"
							verticalAnchor="start"
							fontSize={detailSize}
							fill={theme.palette.neutral[100]}
						/>
					{/each}

					{#if interactive && shows(stageOf[d.type])}
						<HitTarget
							{hover}
							{container}
							index={d.index}
							x={band(d.index) ?? 0}
							y={0}
							width={band.bandwidth()}
							height={plotHeight + labelsHeight}
							label="{d.label}: {d.valueText}"
						/>
					{/if}
				</g>
			{/each}

			<!-- The baseline, drawn over the bars: every stock stands on it. -->
			<Line
				from={{ x: 0, y: zeroY }}
				to={{ x: plotWidth, y: zeroY }}
				stroke={theme.palette.base[300]}
				strokeWidth={Tokens.strokeWidth.md}
			/>
		{/if}
	{/snippet}
</ChartShell>

<style>
	/* One pattern for every reveal and dim: the element owns its opacity
	   inline, this class owns the easing. */
	.fade {
		transition: opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade {
			transition: none;
		}
	}
</style>
