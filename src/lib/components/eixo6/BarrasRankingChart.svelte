<script lang="ts">
	/**
	 * Barras em ranking: uma categoria por linha, todas partindo do mesmo zero,
	 * da maior para a menor.
	 *
	 * Every bar is a `CapsuleBar` — the thick round-tipped stroke with a dot at
	 * the tip that the line charts draw — so a ranking reads as part of the
	 * same family. Length is the only encoding: one hue, a gradient that
	 * brightens toward the tip, no per-category colour to decode. The value is
	 * written past the tip and the name beside the base, so the tooltip and
	 * the table enhance the reading but never gate it.
	 *
	 * A bar is never inflated to show its cap: a value smaller than the bar's
	 * own thickness draws as a sliver of the disc, which is the honest size.
	 *
	 * A `reference` — a parity, a target, an average — runs as a dashed line
	 * across every row, behind the bars, named under the last one. The scale
	 * stretches to keep it in view even when every bar falls short of it.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import CapsuleBar from '$lib/core/components/shape/CapsuleBar.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber, formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { BarrasRankingDatum } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: BarrasRankingDatum[];
			/** `desc` ranks largest first; `none` keeps the order of `data`. */
			sort?: 'desc' | 'none';
			/** Text past each bar's tip. */
			formatValue?: (value: number) => string;
			/** What the bars measure — tooltip, table and screen-reader copy. */
			valueLabel?: string;
			/** Header of the category column, in the accessible table. */
			categoryLabel?: string;
			/** Bar thickness in px; the cap's radius is half of it. */
			barHeight?: number;
			/** A dashed line across the rows at this value — a parity, a target. */
			reference?: number;
			/** Written under the rows, at the reference line. */
			referenceLabel?: string;
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
		sort = 'desc',
		formatValue = (value: number) => formatCompactNumber(value, value >= 1e6 ? 1 : 0),
		valueLabel = 'Valor',
		categoryLabel = 'Categoria',
		barHeight,
		reference,
		referenceLabel,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const pctFormat = formatLocale.format('.1%');
	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	let compact = $derived(shellWidth < 520);
	/** Category names sit in this gutter, right-aligned against the baseline. */
	let gutter = $derived(compact ? 104 : 176);
	/** Room past the longest bar for its value. */
	let valueSpace = $derived(compact ? 52 : 68);
	/** Room under the rows for the reference's name. */
	let referenceFoot = $derived(reference !== undefined && referenceLabel ? Tokens.fontSize.xs * 1.4 + Tokens.spacing.xs : 0);
	let margin = $derived({ top: 4, right: valueSpace, bottom: 4 + referenceFoot, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let thickness = $derived(barHeight ?? (compact ? 24 : 32));
	let rowGap = $derived(compact ? 12 : 16);
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let labelWidth = $derived(gutter - Tokens.spacing.md);

	/**
	 * Height of a row: the bar plus air, or the wrapped name plus air when the
	 * name is taller — a long name in a narrow gutter must not run into the
	 * next row. Lines are `1.1em`, per the theme.
	 */
	function rowHeightOf(label: string) {
		const lines = wrappedLineCount(label, labelWidth);
		return Math.max(thickness, lines * labelSize * 1.1) + rowGap;
	}

	let rows = $derived(
		(sort === 'desc' ? [...data].sort((a, b) => b.value - a.value) : data).map((d) => ({
			...d,
			value: Math.max(0, d.value)
		}))
	);

	let total = $derived(d3.sum(rows, (d) => d.value));

	let xScale = $derived(
		d3
			.scaleLinear()
			.domain([0, Math.max(d3.max(rows, (d) => d.value) ?? 0, reference ?? 0) || 1])
			.range([0, plotWidth])
	);

	type Row = BarrasRankingDatum & {
		/** Top of the row band, and its height. */
		bandTop: number;
		bandHeight: number;
		top: number;
		middle: number;
		length: number;
		valueText: string;
		shareText: string;
	};

	let layout = $derived.by<Row[]>(() => {
		let cursor = 0;
		return rows.map((d) => {
			const bandHeight = rowHeightOf(d.label);
			const bandTop = cursor;
			cursor += bandHeight;
			const top = bandTop + (bandHeight - thickness) / 2;
			return {
				...d,
				bandTop,
				bandHeight,
				top,
				middle: top + thickness / 2,
				length: xScale(d.value),
				valueText: formatValue(d.value),
				shareText: total > 0 ? pctFormat(d.value / total) : '—'
			};
		});
	});

	let plotHeight = $derived(layout.reduce((sum, row) => sum + row.bandHeight, 0));
	/** Height follows the rows unless the host pins it. */
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRow = $derived(activeIndex === null ? null : layout[activeIndex]);

	function dimmed(label: string) {
		return highlight !== null && highlight !== label;
	}

	let tooltip = $derived(
		activeRow
			? {
					title: activeRow.label,
					rows: [
						{
							label: valueLabel,
							value: activeRow.valueText,
							color: theme.palette.primaryVariant,
							emphasis: true
						},
						{ label: 'Participação no total', value: activeRow.shareText }
					]
				}
			: null
	);

	let table = $derived({
		caption: title ?? `${valueLabel} por ${categoryLabel.toLowerCase()}`,
		columns: [categoryLabel, valueLabel, 'Participação no total'],
		rows: layout.map((d) => [d.label, d.value.toLocaleString('pt-BR'), d.shareText])
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
	ariaLabel={title ?? `${valueLabel} por ${categoryLabel.toLowerCase()}`}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			{#if reference !== undefined}
				<!-- Behind the bars: they and their values read over it. -->
				{@const rx = xScale(reference)}
				<line
					x1={rx}
					y1={0}
					x2={rx}
					y2={plotHeight}
					stroke={theme.palette.neutral[100]}
					stroke-width={Tokens.strokeWidth.sm}
					stroke-dasharray="4,5"
				/>
				{#if referenceLabel}
					<Text
						dx={rx}
						dy={plotHeight + Tokens.spacing.xs}
						text={referenceLabel}
						textAnchor="middle"
						verticalAnchor="start"
						fontSize={Tokens.fontSize.xs}
						fill={theme.palette.neutral[100]}
					/>
				{/if}
			{/if}

			{#each layout as row, i (row.label)}
				{@const isActive = i === activeIndex}
				<g class="fade" style:opacity={dimmed(row.label) ? 0.25 : 1}>
					<Text
						dx={-Tokens.spacing.md}
						dy={row.middle}
						width={labelWidth}
						text={row.label}
						textAnchor="end"
						verticalAnchor="middle"
						fontSize={labelSize}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>

					<CapsuleBar x={0} y={row.top} width={row.length} height={thickness} />

					<g class="fade" style:opacity={shows(1) ? 1 : 0}>
						<Text
							dx={row.length + Tokens.spacing.sm}
							dy={row.middle}
							text={row.valueText}
							textAnchor="start"
							verticalAnchor="middle"
							fontSize={labelSize}
							fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.semibold}
							fill={theme.palette.neutral[isActive ? 400 : 300]}
							stroke={theme.palette.base[100]}
							stroke-width={3}
							stroke-linejoin="round"
							paint-order="stroke"
						/>
					</g>

					{#if interactive}
						<!-- The whole row answers the pointer, name included: a sliver
						     of a bar is no target. -->
						<HitTarget
							{hover}
							{container}
							index={i}
							x={-gutter}
							y={row.bandTop}
							width={gutter + plotWidth + margin.right}
							height={row.bandHeight}
							label="{row.label}: {row.valueText}"
						/>
					{/if}
				</g>
			{/each}

			<!-- The baseline, drawn over the bars: every one of them starts here. -->
			<Line
				from={{ x: 0, y: 0 }}
				to={{ x: 0, y: plotHeight }}
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
