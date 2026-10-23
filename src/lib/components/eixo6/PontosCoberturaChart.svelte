<script lang="ts">
	/**
	 * Pontos de cobertura: uma categoria por linha, um ponto no seu valor,
	 * as linhas agrupadas em blocos — um por recorte do mesmo indicador (rede,
	 * etapa, localização) — e uma linha de referência que atravessa todos.
	 *
	 * Made for indicators that sit near the top for everyone (98% here, 99%
	 * there): from zero those are identical bars, so the axis starts where the
	 * data does and says so with the torn-axis mark. Position is the only
	 * encoding — a dot, never a length — which is what makes the truncated
	 * axis honest. Every row carries a light track across the axis, so a dot
	 * reads against the whole range.
	 *
	 * The geometry is `coverageDotsLayout` and the drawing `CoverageDots`,
	 * the same pair the builder uses.
	 */
	import CoverageDots from '$lib/core/components/coverageDots/CoverageDots.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { coverageDotsLayout, COVERAGE_DOTS_DEFAULTS } from '$lib/core/layouts/coverageDots';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { PontosCoberturaDatum } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: PontosCoberturaDatum[];
			/** `desc` ranks each block largest first; `none` keeps the order of `data`. */
			sort?: 'desc' | 'none';
			/** Text right of each dot, in the tooltip and in the table. */
			formatValue?: (value: number) => string;
			/** Text of the axis ticks; defaults to `formatValue` without decimals. */
			formatTick?: (value: number) => string;
			/** Text of a row's distance to the reference, in the tooltip and the table. */
			formatDifference?: (difference: number) => string;
			/** What the dots measure — tooltip, table and screen-reader copy. */
			valueLabel?: string;
			/** Header of the category column, in the accessible table. */
			categoryLabel?: string;
			/** Header of the block column, in the accessible table. */
			groupLabel?: string;
			/** A dashed line across every block — a national mean, a target. */
			reference?: number;
			/** Written above the rows, at the reference line. */
			referenceLabel?: string;
			/** Start of the axis; omit to derive it from the data. */
			min?: number;
			/** End of the axis — 100 for a share; omit to derive it. */
			max?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	const f1 = formatLocale.format(',.1f');
	const f0 = formatLocale.format(',.0f');

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
		formatValue = (value: number) => f1(value),
		formatTick,
		formatDifference,
		valueLabel = 'Valor',
		categoryLabel = 'Categoria',
		groupLabel = 'Recorte',
		reference,
		referenceLabel,
		min,
		max,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;

	/** Signed, in the value's own format: "+0,6", "−2,2". */
	let differenceText = $derived(
		formatDifference ??
			((d: number) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${formatValue(Math.abs(d))}`)
	);
	let tickText = $derived(formatTick ?? ((v: number) => f0(v)));

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	let compact = $derived(shellWidth < 520);
	/** Category names sit in this gutter, right-aligned against the axis start. */
	let gutter = $derived(compact ? 112 : 184);
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let labelWidth = $derived(gutter - Tokens.spacing.md);
	let margin = $derived({ top: 4, right: 8, bottom: 4, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let grouped = $derived(data.some((d) => d.group !== undefined));

	/**
	 * Every row is as tall as the tallest wrapped name, so a long name in a
	 * narrow gutter never runs into the next row. Lines are `1.1em`.
	 */
	let rowThickness = $derived(
		Math.max(
			COVERAGE_DOTS_DEFAULTS.rowThickness,
			...data.map((d) => wrappedLineCount(d.label, labelWidth) * labelSize * 1.1)
		)
	);

	let layout = $derived(
		coverageDotsLayout(data, {
			getCategory: (d) => d.label,
			getValue: (d) => d.value,
			getGroup: grouped ? (d) => d.group ?? '' : undefined,
			width: plotWidth,
			sort: sort === 'desc' ? 'descending' : 'none',
			reference,
			valueDomain: [min, max],
			rowThickness,
			insetEnd: compact ? 44 : 56,
			headerHeight: labelSize * 2.2,
			blockGap: compact ? Tokens.spacing.md : Tokens.spacing.lg
		})
	);

	/** Height follows the rows unless the host pins it. */
	let figureHeight = $derived(height ?? layout.height + margin.top + margin.bottom);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRow = $derived(activeIndex === null ? null : layout.rows[activeIndex]);

	/** `highlight` names a category or a whole block. */
	function dimmed(label: string, group: string) {
		return highlight !== null && highlight !== label && highlight !== group;
	}

	let tooltip = $derived(
		activeRow
			? {
					title: activeRow.category,
					rows: [
						{
							label: valueLabel,
							value: formatValue(activeRow.value),
							color: theme.palette.primaryVariant,
							emphasis: true
						},
						...(grouped ? [{ label: groupLabel, value: activeRow.group }] : []),
						...(activeRow.delta !== undefined
							? [
									{
										label: `Diferença para ${referenceLabel ?? 'a referência'}`,
										value: differenceText(activeRow.delta)
									}
								]
							: [])
					]
				}
			: null
	);

	let table = $derived({
		caption: title ?? `${valueLabel} por ${categoryLabel.toLowerCase()}`,
		columns: [
			...(grouped ? [groupLabel] : []),
			categoryLabel,
			valueLabel,
			...(reference !== undefined ? [`Diferença para ${referenceLabel ?? 'a referência'}`] : [])
		],
		rows: layout.rows.map((row) => [
			...(grouped ? [row.group] : []),
			row.category,
			formatValue(row.value),
			...(row.delta !== undefined ? [differenceText(row.delta)] : [])
		])
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
		{#if layout.rows.length && plotWidth > 0}
			<CoverageDots
				class="pontos"
				{layout}
				fontSize={labelSize}
				categoryWidth={labelWidth}
				headerLeft={-gutter}
				formatValue={(row) => formatValue(row.value)}
				formatTick={tickText}
				rowOpacity={(row) => (dimmed(row.category, row.group) ? 0.25 : 1)}
				headerOpacity={(block) =>
					highlight === null || block.rows.some((row) => !dimmed(row.category, row.group))
						? 1
						: 0.25}
				valuesOpacity={shows(2) ? 1 : 0}
				{referenceLabel}
				referenceOpacity={shows(1) ? 1 : 0}
				markerFill={(row) =>
					row.index === activeIndex ? theme.palette.accent : undefined}
			/>

			{#if interactive}
				{#each layout.rows as row (row.key)}
					<!-- The whole row answers the pointer, name included: a dot is a small target. -->
					<HitTarget
						{hover}
						{container}
						index={row.index}
						x={-gutter}
						y={row.y - (rowThickness * COVERAGE_DOTS_DEFAULTS.rowGapRatio) / 2}
						width={gutter + plotWidth + margin.right}
						height={rowThickness * (1 + COVERAGE_DOTS_DEFAULTS.rowGapRatio)}
						label="{row.category}: {formatValue(row.value)}"
					/>
				{/each}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	/* One pattern for every reveal and dim: the element owns its opacity,
	   this owns the easing. */
	:global(.pontos .coverage-dots__row),
	:global(.pontos .coverage-dots__header),
	:global(.pontos .coverage-dots__value),
	:global(.pontos .coverage-dots__reference),
	:global(.pontos .coverage-dots__reference-label) {
		transition: opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.pontos .coverage-dots__row),
		:global(.pontos .coverage-dots__header),
		:global(.pontos .coverage-dots__value),
		:global(.pontos .coverage-dots__reference),
		:global(.pontos .coverage-dots__reference-label) {
			transition: none;
		}
	}
</style>
