<script lang="ts">
	/**
	 * Matriz de bolhas: linhas por colunas, uma bolha por cruzamento, a área
	 * proporcional ao valor.
	 *
	 * The bubble of `BolhasComparadasChart`, generalised from two scopes to any
	 * number of columns: area — never radius — carries the value, and the fill
	 * follows the same value on the pillar's sequential ramp, so a large bubble
	 * is both big and deep. Every bubble is labelled; the tooltip and the table
	 * enhance, they never gate.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { BolhasMatrizLinha } from './data.js';
	import { sequentialRamp, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** Column names, left to right. */
			columns: string[];
			rows: BolhasMatrizLinha[];
			formatValue?: (value: number) => string;
			/** Header of the row column, in the accessible table. */
			rowLabel?: string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		columns,
		rows,
		formatValue = (value: number) => formatLocale.format(',.1~f')(value),
		rowLabel = 'Categoria',
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();
	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	const HEADER = 28;
	let gutter = $derived(compact ? 92 : 150);
	let margin = $derived({ top: 4, right: 8, bottom: 8, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let columnWidth = $derived(columns.length ? plotWidth / columns.length : 0);
	let maxRadius = $derived(Math.max(4, Math.min(columnWidth * 0.3, compact ? 22 : 30)));
	let nameSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);

	let maxValue = $derived(d3.max(rows.flatMap((r) => r.values)) || 1);
	/** Area proportional to the value; the radius follows from the area. */
	let radiusOf = $derived((value: number) => Math.sqrt(Math.max(0, value) / maxValue) * maxRadius);
	let fillOf = $derived.by(() => {
		const [light] = sequentialRamp(theme.palette, 2);
		const dark = theme.palette.primaryVariant;
		const scale = d3.scaleSequential(d3.interpolateLab(light, dark)).domain([0, maxValue]);
		return (value: number) => scale(value);
	});

	let layout = $derived.by(() => {
		let cursor = HEADER;
		return rows.map((row, index) => {
			const nameLines = wrappedLineCount(row.label, gutter - Tokens.spacing.md);
			const textHeight = nameLines * nameSize * 1.1 + (row.note ? Tokens.fontSize.xs * 1.3 : 0);
			const band = Math.max(2 * maxRadius, textHeight) + 14;
			const middle = cursor + band / 2;
			cursor += band;
			return { ...row, index, middle, band, top: middle - band / 2 };
		});
	});

	let plotHeight = $derived(layout.reduce((sum, r) => sum + r.band, HEADER));
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);
	const columnX = (c: number) => columnWidth * (c + 0.5);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRow = $derived(activeIndex === null ? null : layout[activeIndex]);

	function rowOpacity(label: string) {
		return highlight !== null && highlight !== label ? 0.25 : 1;
	}

	let tooltip = $derived(
		activeRow
			? {
					title: activeRow.label,
					rows: columns.map((column, c) => ({
						label: column,
						value: formatValue(activeRow.values[c] ?? 0),
						color: fillOf(activeRow.values[c] ?? 0)
					}))
				}
			: null
	);

	let table = $derived({
		caption: title ?? 'Matriz de bolhas',
		columns: [rowLabel, ...columns],
		rows: rows.map((r) => [r.label, ...columns.map((_, c) => formatValue(r.values[c] ?? 0))])
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
	ariaLabel={title ?? 'Matriz de bolhas'}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			{#each columns as column, c (column)}
				<Text
					dx={columnX(c)}
					dy={0}
					width={columnWidth - 4}
					text={column}
					textAnchor="middle"
					verticalAnchor="start"
					fontSize={Tokens.fontSize.sm}
					fontWeight={Tokens.fontWeight.semibold}
					fill={theme.palette.neutral[200]}
				/>
			{/each}

			{#each layout as row (row.index)}
				{@const isActive = row.index === activeIndex}
				<g class="fade" style:opacity={rowOpacity(row.label)}>
					<Text
						dx={-Tokens.spacing.md}
						dy={row.middle}
						width={gutter - Tokens.spacing.md}
						text={row.label}
						textAnchor="end"
						verticalAnchor={row.note ? 'end' : 'middle'}
						fontSize={nameSize}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>
					{#if row.note}
						<Text
							dx={-Tokens.spacing.md}
							dy={row.middle + 3}
							text={row.note}
							textAnchor="end"
							verticalAnchor="start"
							fontSize={Tokens.fontSize.xs}
							fill={theme.palette.neutral[100]}
						/>
					{/if}

					{#each columns as column, c (column)}
						{@const value = row.values[c] ?? 0}
						{@const r = radiusOf(value)}
						<circle
							cx={columnX(c)}
							cy={row.middle}
							{r}
							fill={fillOf(value)}
							stroke={theme.palette.base[100]}
							stroke-width={isActive ? 2.5 : 1.5}
						/>
						<g class="fade" style:opacity={shows(1) ? 1 : 0}>
							<Text
								dx={columnX(c) + r + 4}
								dy={row.middle}
								text={formatValue(value)}
								textAnchor="start"
								verticalAnchor="middle"
								fontSize={Tokens.fontSize.xs}
								fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.medium}
								fill={theme.palette.neutral[isActive ? 400 : 200]}
							/>
						</g>
					{/each}

					{#if interactive}
						<HitTarget
							{hover}
							{container}
							index={row.index}
							x={-gutter}
							y={row.top}
							width={gutter + plotWidth}
							height={row.band}
							label="{row.label}: {columns.map((col, c) => `${col} ${formatValue(row.values[c] ?? 0)}`).join(', ')}"
						/>
					{/if}
				</g>
			{/each}
		{/if}
	{/snippet}
</ChartShell>

<style>
	.fade {
		transition: opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade {
			transition: none;
		}
	}
</style>
