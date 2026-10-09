<script lang="ts">
	/**
	 * Antes e depois: a mesma medida em dois momentos, uma categoria por linha,
	 * os dois valores ligados por um traço.
	 *
	 * Each pair is a `Dumbbell` — a two-point slice of the line charts' mark:
	 * the thick round-capped stroke, the ordinary marker on the "before" end
	 * and the emphasised accent dot on the "after" end, the way a line chart
	 * marks its last year. The stroke's length *is* the change, so a category
	 * that did not move shows as a short pill and nobody has to subtract.
	 *
	 * Values sit outside the pair, each on its own dot's far side, so the two
	 * labels never collide even when the dots coincide.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import LabelMask from '$lib/core/components/annotation/LabelMask.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import Dumbbell from '$lib/core/components/dumbbell/Dumbbell.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { LinhasAntesDepoisDatum } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: LinhasAntesDepoisDatum[];
			/** Name of each moment — legend, tooltip and table. */
			beforeLabel?: string;
			afterLabel?: string;
			/** `none` keeps the order of `data`; the others rank largest first. */
			sort?: 'none' | 'before' | 'after' | 'change';
			formatValue?: (value: number) => string;
			/** The change, signed. Defaults to `formatValue` with a sign. */
			formatChange?: (change: number) => string;
			/** Axis ticks — usually coarser than the values. Defaults to `formatValue`. */
			formatTick?: (value: number) => string;
			/** x domain; defaults to the data's extent, rounded outward. */
			domain?: [number, number];
			/** Header of the category column, in the accessible table. */
			categoryLabel?: string;
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
		beforeLabel = 'Antes',
		afterLabel = 'Depois',
		sort = 'none',
		formatValue = (value: number) => formatLocale.format(',.1~f')(value),
		formatChange,
		formatTick,
		domain,
		categoryLabel = 'Categoria',
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;

	let changeText = $derived(
		formatChange ?? ((change: number) => `${change > 0 ? '+' : ''}${formatValue(change)}`)
	);

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	let compact = $derived(shellWidth < 520);
	let gutter = $derived(compact ? 96 : 160);
	/** Room at each end of the scale for a value written outside its dot. */
	let valueSpace = $derived(compact ? 40 : 52);
	const AXIS_HEIGHT = 24;
	let margin = $derived({ top: 4, right: 8, bottom: AXIS_HEIGHT, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let labelWidth = $derived(gutter - Tokens.spacing.md);
	let strokeWidth = $derived(Number(theme.line.strokeWidth));
	/** The end dot is 1.6× the marker: it sets how far a value sits from it. */
	let dotRadius = $derived(Number(theme.marker.circle.size) * 1.6);

	/** The stroke, or the wrapped name when it is taller, plus air. */
	function rowHeightOf(label: string) {
		return (
			Math.max(strokeWidth, wrappedLineCount(label, labelWidth) * labelSize * 1.1) +
			(compact ? 14 : 18)
		);
	}

	let rows = $derived.by(() => {
		if (sort === 'none') return data;
		const key = (d: LinhasAntesDepoisDatum) =>
			sort === 'change' ? d.after - d.before : sort === 'before' ? d.before : d.after;
		return [...data].sort((a, b) => key(b) - key(a));
	});

	let xScale = $derived(
		d3
			.scaleLinear()
			.domain(
				domain ??
					(d3.extent(rows.flatMap((d) => [d.before, d.after])) as [number, number])
			)
			.nice()
			.range([valueSpace, Math.max(valueSpace, plotWidth - valueSpace)])
	);

	type Row = LinhasAntesDepoisDatum & {
		bandTop: number;
		bandHeight: number;
		middle: number;
		x: { before: number; after: number };
		text: { before: string; after: string; change: string };
		/** `true` when the value fell: the labels swap sides to stay outside the pair. */
		fell: boolean;
	};

	let layout = $derived.by<Row[]>(() => {
		let cursor = 0;
		return rows.map((d) => {
			const bandHeight = rowHeightOf(d.label);
			const bandTop = cursor;
			cursor += bandHeight;
			return {
				...d,
				bandTop,
				bandHeight,
				middle: bandTop + bandHeight / 2,
				x: { before: xScale(d.before), after: xScale(d.after) },
				text: {
					before: formatValue(d.before),
					after: formatValue(d.after),
					change: changeText(d.after - d.before)
				},
				fell: d.after < d.before
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

	let tooltip = $derived.by(() => {
		if (!activeRow) return null;
		const rowsOut = [
			{ label: beforeLabel, value: activeRow.text.before, color: theme.palette.primaryVariant }
		];
		if (shows(1)) {
			rowsOut.push(
				{ label: afterLabel, value: activeRow.text.after, color: theme.palette.accent },
				{ label: 'Diferença', value: activeRow.text.change, color: theme.palette.primary }
			);
		}
		return { title: activeRow.label, rows: rowsOut };
	});

	let legend = $derived([
		{ label: beforeLabel, color: theme.palette.primaryVariant, dot: true },
		...(shows(1) ? [{ label: afterLabel, color: theme.palette.accent, dot: true }] : [])
	]);

	let table = $derived({
		caption: title ?? `${beforeLabel} e ${afterLabel.toLowerCase()} por ${categoryLabel.toLowerCase()}`,
		columns: [categoryLabel, beforeLabel, afterLabel, 'Diferença'],
		rows: layout.map((d) => [d.label, d.text.before, d.text.after, d.text.change])
	});

	/** A value sits on its dot's outer side: before leads, after trails, unless the value fell. */
	function labelAt(row: Row, end: 'before' | 'after') {
		const outward = (end === 'before') !== row.fell ? -1 : 1;
		const gap = (end === 'after' ? dotRadius : strokeWidth / 2) + Tokens.spacing.sm;
		return {
			dx: row.x[end] + outward * gap,
			anchor: (outward < 0 ? 'end' : 'start') as 'end' | 'start'
		};
	}
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
	{legend}
	{table}
	ariaLabel={title ?? `${beforeLabel} e ${afterLabel.toLowerCase()} por ${categoryLabel.toLowerCase()}`}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			<GridColumns scale={xScale} height={plotHeight} numTicks={compact ? 2 : 5} />
			<Axis
				orientation="bottom"
				scale={xScale}
				top={plotHeight}
				numTicks={compact ? 2 : 5}
				tickFormat={(value) => (formatTick ?? formatValue)(Number(value))}
			/>

			{#each layout as row, i (row.label)}
				{@const isActive = i === activeIndex}
				{@const before = labelAt(row, 'before')}
				{@const after = labelAt(row, 'after')}
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

					<!-- The change arrives on the second step: the stroke and the
					     "after" dot, under the "before" dot that was already there. -->
					<g class="fade" style:opacity={shows(1) ? 1 : 0}>
						<Dumbbell
							from={{ x: row.x.before, y: row.middle }}
							to={{ x: row.x.after, y: row.middle }}
							showFrom={false}
						/>
					</g>
					<Dumbbell
						from={{ x: row.x.before, y: row.middle }}
						to={{ x: row.x.after, y: row.middle }}
						showStroke={false}
						showTo={false}
					/>

					<g class="fade" style:opacity={shows(2) ? 1 : 0}>
						<LabelMask>
							<Text
								dx={before.dx}
								dy={row.middle}
								text={row.text.before}
								textAnchor={before.anchor}
								verticalAnchor="middle"
								fontSize={Tokens.fontSize.sm}
								fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.medium}
								fill={theme.palette.neutral[200]}
							/>
						</LabelMask>
						<LabelMask>
							<Text
								dx={after.dx}
								dy={row.middle}
								text={row.text.after}
								textAnchor={after.anchor}
								verticalAnchor="middle"
								fontSize={labelSize}
								fontWeight={Tokens.fontWeight.bold}
								fill={theme.palette.accent}
							/>
						</LabelMask>
					</g>

					{#if interactive}
						<HitTarget
							{hover}
							{container}
							index={i}
							x={-gutter}
							y={row.bandTop}
							width={gutter + plotWidth + margin.right}
							height={row.bandHeight}
							label="{row.label}: {beforeLabel} {row.text.before}, {afterLabel} {row.text.after}"
						/>
					{/if}
				</g>
			{/each}
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
