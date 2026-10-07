<script lang="ts">
	/**
	 * Tabela com barras: uma linha por categoria, uma coluna por medida, e cada
	 * célula uma barra com o seu valor.
	 *
	 * For the tables a publication would otherwise print raw — several
	 * measures per row, in units that do not mix (actions, people,
	 * municipalities, a ratio). Each column is a small ranking on a scale of
	 * its own, so a column is read top to bottom and a row left to right; the
	 * bars are `CapsuleBar`s, so the table reads as part of the family. Bars
	 * are only compared within their column: the header names the measure, and
	 * position — not colour — tells the columns apart.
	 *
	 * A value that was not reported is written as such and never drawn as a
	 * zero. A column can carry a reference (a parity, a target) as a dashed
	 * line, and the table can close on a total row, written but not drawn —
	 * the total would flatten every bar above it.
	 *
	 * Told in steps (`tabelaBarrasSteps(columns)`), the table is read a
	 * measure at a time: each stage brings one column in and steps the ones
	 * already read back, and the last stage shows the whole table with its
	 * total. The layout never moves — hidden columns keep their place.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import CapsuleBar from '$lib/core/components/shape/CapsuleBar.svelte';
	import { capsuleBarLayout } from '$lib/core/layouts/capsuleBar';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import getStringWidth from '$lib/core/utils/getStringWidth';
	import ChartShell from './ChartShell.svelte';
	import type { TabelaBarrasColuna, TabelaBarrasLinha } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** The measures, left to right. */
			columns: TabelaBarrasColuna[];
			rows: TabelaBarrasLinha[];
			/** Closing row — written, not drawn. */
			total?: TabelaBarrasLinha;
			/** Index of the column to rank the rows by, largest first; `null` keeps the order of `rows`. */
			sortBy?: number | null;
			/** Text of each value, for columns without their own `format`. */
			formatValue?: (value: number) => string;
			/** Written where a value was not reported. */
			missingLabel?: string;
			/** Header of the row column, in the accessible table. */
			rowLabel?: string;
			/** Bar thickness in px; the cap's radius is half of it. */
			barHeight?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		columns,
		rows,
		total,
		sortBy = null,
		formatValue = (value: number) => formatLocale.format(',~f')(value),
		missingLabel = 'não informado',
		rowLabel = 'Categoria',
		barHeight,
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

	/**
	 * Stage `c` brings column `c` in at full strength and steps the columns
	 * before it back; columns ahead are hidden. The stage after the last
	 * column — and `-1` — shows everything.
	 */
	function columnOpacity(c: number) {
		if (step < 0 || step >= columns.length) return 1;
		if (c > step) return 0;
		return c === step ? 1 : 0.35;
	}
	let showsTotal = $derived(step < 0 || step >= columns.length);

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	/**
	 * Narrow screens give the names a line of their own above the bars:
	 * with the names in a gutter, three or four columns would leave each
	 * bar a few pixels to grow in.
	 */
	let compact = $derived(shellWidth < 520);
	let gutter = $derived(compact ? 0 : 168);
	let margin = $derived({ top: 4, right: 8, bottom: 4, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let columnGap = $derived(compact ? 12 : 20);
	let columnWidth = $derived(
		columns.length ? Math.max(0, (plotWidth - columnGap * (columns.length - 1)) / columns.length) : 0
	);
	const columnX = (c: number) => c * (columnWidth + columnGap);

	let thickness = $derived(barHeight ?? (compact ? 12 : 16));
	let rowGap = $derived(compact ? 14 : 10);
	let nameSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let valueSize = $derived(Tokens.fontSize[compact ? 'xs' : 'sm']);
	let nameWidth = $derived(compact ? plotWidth : gutter - Tokens.spacing.md);

	const formatOf = (c: number) => columns[c]?.format ?? formatValue;
	const textOf = (value: number | null, c: number) => (value === null ? missingLabel : formatOf(c)(value));

	/** Measured in the size and weight the value is drawn at, with a fallback for SSR. */
	function measure(text: string, size: number) {
		return getStringWidth(text, `font-size: ${size}px; font-weight: ${Tokens.fontWeight.bold}`) ?? text.length * size * 0.6;
	}

	let sorted = $derived(
		sortBy === null
			? rows
			: [...rows].sort((a, b) => (b.values[sortBy] ?? -Infinity) - (a.values[sortBy] ?? -Infinity))
	);

	/** Per column: the scale, and the room its longest value needs past the tip. */
	let scales = $derived(
		columns.map((column, c) => {
			const values = rows.map((r) => r.values[c]).filter((v): v is number => v !== null && v !== undefined);
			const max = Math.max(d3.max(values) ?? 0, column.reference ?? 0) || 1;
			const valueSpace =
				Math.max(...rows.map((r) => measure(textOf(r.values[c] ?? null, c), valueSize)), 0) + Tokens.spacing.sm;
			const barMax = Math.max(0, columnWidth - valueSpace);
			return d3.scaleLinear().domain([0, max]).range([0, barMax]);
		})
	);

	let headerLines = $derived(
		Math.max(1, ...columns.map((column) => wrappedLineCount(column.label, columnWidth)))
	);
	let header = $derived(headerLines * Tokens.fontSize.sm * 1.1 + Tokens.spacing.md);

	type Row = TabelaBarrasLinha & {
		index: number;
		top: number;
		band: number;
		/** Centre of the bars across the row. */
		middle: number;
		nameLines: number;
	};

	let layout = $derived.by<Row[]>(() => {
		let cursor = header;
		return sorted.map((row, index) => {
			const nameLines = wrappedLineCount(row.label, nameWidth);
			const nameBlock = nameLines * nameSize * 1.1 + (row.note ? Tokens.fontSize.xs * 1.3 : 0);
			const band = compact
				? nameBlock + Tokens.spacing.xs + thickness + rowGap
				: Math.max(thickness, nameBlock) + rowGap;
			const top = cursor;
			cursor += band;
			const middle = compact ? top + nameBlock + Tokens.spacing.xs + thickness / 2 : top + band / 2;
			return { ...row, index, top, band, middle, nameLines };
		});
	});

	let rowsBottom = $derived(layout.reduce((sum, r) => sum + r.band, header));
	let hasReference = $derived(columns.some((column) => column.reference !== undefined));
	let referenceFoot = $derived(hasReference ? Tokens.fontSize.xs * 1.4 + Tokens.spacing.xs : 0);
	let totalTop = $derived(rowsBottom + referenceFoot);
	let totalBand = $derived(total ? nameSize * 1.1 * (compact ? 2 : 1) + rowGap + Tokens.spacing.sm : 0);
	let plotHeight = $derived(totalTop + totalBand);
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
					rows: columns
						.map((column, c) => ({
							label: column.label,
							value: textOf(activeRow.values[c] ?? null, c),
							shown: columnOpacity(c) > 0
						}))
						.filter((r) => r.shown)
						.map(({ label, value }) => ({ label, value }))
				}
			: null
	);

	let table = $derived({
		caption: title ?? 'Tabela com barras',
		columns: [rowLabel, ...columns.map((column) => column.label)],
		rows: [...sorted, ...(total ? [total] : [])].map((r) => [
			r.label,
			...columns.map((_, c) => textOf(r.values[c] ?? null, c))
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
	ariaLabel={title ?? 'Tabela com barras'}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			{#each columns as column, c (c)}
				<g class="fade" style:opacity={columnOpacity(c)}>
					<Text
						dx={columnX(c)}
						dy={0}
						width={columnWidth}
						text={column.label}
						textAnchor="start"
						verticalAnchor="start"
						fontSize={Tokens.fontSize.sm}
						fontWeight={Tokens.fontWeight.semibold}
						fill={theme.palette.neutral[200]}
					/>
				</g>
			{/each}

			{#each columns as column, c (c)}
				<!-- Every bar of the column starts on this line. Drawn first, with the
				     reference, so bars and values sit over them. -->
				<g class="fade" style:opacity={columnOpacity(c)}>
					<Line
						from={{ x: columnX(c), y: header - Tokens.spacing.xs }}
						to={{ x: columnX(c), y: rowsBottom - rowGap / 2 }}
						stroke={theme.palette.base[300]}
						strokeWidth={Tokens.strokeWidth.md}
					/>
					{#if column.reference !== undefined}
						{@const rx = columnX(c) + scales[c](column.reference)}
						<line
							x1={rx}
							y1={header - Tokens.spacing.xs}
							x2={rx}
							y2={rowsBottom - rowGap / 2}
							stroke={theme.palette.neutral[100]}
							stroke-width={Tokens.strokeWidth.sm}
							stroke-dasharray="4,5"
						/>
						{#if column.referenceLabel}
							<Text
								dx={rx}
								dy={rowsBottom - rowGap / 2 + Tokens.spacing.xs}
								text={column.referenceLabel}
								textAnchor="middle"
								verticalAnchor="start"
								fontSize={Tokens.fontSize.xs}
								fill={theme.palette.neutral[100]}
							/>
						{/if}
					{/if}
				</g>
			{/each}

			{#each layout as row (row.label)}
				{@const isActive = row.index === activeIndex}
				<g class="fade" style:opacity={dimmed(row.label) ? 0.25 : 1}>
					<Text
						dx={compact ? 0 : -Tokens.spacing.md}
						dy={compact ? row.top : row.middle}
						width={nameWidth}
						text={row.label}
						textAnchor={compact ? 'start' : 'end'}
						verticalAnchor={compact ? 'start' : row.note ? 'end' : 'middle'}
						fontSize={nameSize}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>
					{#if row.note}
						<Text
							dx={compact ? 0 : -Tokens.spacing.md}
							dy={compact ? row.top + row.nameLines * nameSize * 1.1 : row.middle + 3}
							text={row.note}
							textAnchor={compact ? 'start' : 'end'}
							verticalAnchor="start"
							fontSize={Tokens.fontSize.xs}
							fill={theme.palette.neutral[100]}
						/>
					{/if}

					{#each columns as _, c (c)}
						{@const value = row.values[c] ?? null}
						{@const length = value === null ? 0 : scales[c](Math.max(0, value))}
						<g class="fade" style:opacity={columnOpacity(c)}>
							{#if value === null}
								<Text
									dx={columnX(c) + Tokens.spacing.sm}
									dy={row.middle}
									text={missingLabel}
									textAnchor="start"
									verticalAnchor="middle"
									fontSize={Tokens.fontSize.xs}
									font-style="italic"
									fill={theme.palette.neutral[100]}
								/>
							{:else}
								<CapsuleBar
									layout={capsuleBarLayout({
										x: columnX(c),
										y: row.middle - thickness / 2,
										width: length,
										height: thickness,
									})}
								/>
								<Text
									dx={columnX(c) + length + Tokens.spacing.sm}
									dy={row.middle}
									text={formatOf(c)(value)}
									textAnchor="start"
									verticalAnchor="middle"
									fontSize={valueSize}
									fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.semibold}
									fill={theme.palette.neutral[isActive ? 400 : 300]}
									stroke={theme.palette.base[100]}
									stroke-width={3}
									stroke-linejoin="round"
									paint-order="stroke"
								/>
							{/if}
						</g>
					{/each}

					{#if interactive}
						<!-- The whole row answers the pointer, name included: a sliver
						     of a bar is no target. -->
						<HitTarget
							{hover}
							{container}
							index={row.index}
							x={-gutter}
							y={row.top}
							width={gutter + plotWidth}
							height={row.band}
							label={`${row.label}: ${columns.map((col, c) => `${col.label} ${textOf(row.values[c] ?? null, c)}`).join(', ')}`}
						/>
					{/if}
				</g>
			{/each}

			{#if total}
				<!-- Wide, the total sits on one line like the rows; compact, its
				     values go under the name, as the bars do. -->
				{@const middle = compact
					? totalTop + Tokens.spacing.sm + nameSize * 1.1 + valueSize * 0.7
					: totalTop + totalBand / 2}
				<g class="fade" style:opacity={showsTotal ? (highlight !== null ? 0.25 : 1) : 0}>
					<Line
						from={{ x: -gutter, y: totalTop }}
						to={{ x: plotWidth, y: totalTop }}
						stroke={theme.palette.base[300]}
						strokeWidth={Tokens.strokeWidth.md}
					/>
					<Text
						dx={compact ? 0 : -Tokens.spacing.md}
						dy={compact ? totalTop + Tokens.spacing.sm : middle}
						width={nameWidth}
						text={total.label}
						textAnchor={compact ? 'start' : 'end'}
						verticalAnchor={compact ? 'start' : 'middle'}
						fontSize={nameSize}
						fontWeight={Tokens.fontWeight.bold}
						fill={theme.palette.neutral[300]}
					/>
					{#each columns as _, c (c)}
						<Text
							dx={columnX(c)}
							dy={middle}
							text={textOf(total.values[c] ?? null, c)}
							textAnchor="start"
							verticalAnchor="middle"
							fontSize={valueSize}
							fontWeight={Tokens.fontWeight.bold}
							fill={theme.palette.neutral[300]}
						/>
					{/each}
				</g>
			{/if}
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
