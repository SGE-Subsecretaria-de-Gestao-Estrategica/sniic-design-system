<script lang="ts">
  import { basePalette } from '$lib/core/theme/tokens';
	/**
	 * Barras divergentes: duas parcelas por categoria, correndo em direções
	 * opostas a partir de um zero comum.
	 *
	 * One scale serves both directions — not two mirrored scales — so an
	 * imbalance between the sides shows instead of hiding. Each half is a
	 * `CapsuleBar`, the left one reversed, so the bars keep the family's flat
	 * base at zero, round tip and dot. By default both sides wear the same
	 * gradient as every other bar chart: direction and the side names above
	 * each half carry the identity, colour does not have to.
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
	import type { BarrasDivergentesDatum } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Side = 'left' | 'right';
	type SideFill = string | readonly [string, string];

	type Props = FrameProps &
		ScrollytellingProps & {
			data: BarrasDivergentesDatum[];
			/** Name of each side, written above its half and in the tooltip. */
			sideLabels?: Record<Side, string>;
			/**
			 * Fill per side, as `CapsuleBar` takes it — one colour or
			 * `[base, tip]`. Omitted, a side wears the default bar gradient.
			 */
			sideColors?: Partial<Record<Side, SideFill>>;
			/** `none` keeps the order of `data`; `left`/`right` rank by that side, largest first. */
			sort?: 'none' | 'left' | 'right';
			formatValue?: (value: number) => string;
			/** Header of the category column, in the accessible table. */
			categoryLabel?: string;
			/** Bar thickness in px; the cap's radius is half of it. */
			barHeight?: number;
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
		sideLabels = { left: 'Esquerda', right: 'Direita' },
		sideColors = {},
		sort = 'none',
		formatValue = (value: number) => formatCompactNumber(value, value >= 1e6 ? 1 : 0),
		categoryLabel = 'Categoria',
		barHeight,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;
	/** The right side leads; the left joins on the next step. */
	const sideStage: Record<Side, number> = { right: 0, left: 1 };
	const SIDES: Side[] = ['left', 'right'];

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	let compact = $derived(shellWidth < 520);
	let gutter = $derived(compact ? 96 : 160);
	/** Room past each tip for its value, on both sides. */
	let valueSpace = $derived(compact ? 44 : 60);
	let margin = $derived({ top: 4, right: 8, bottom: 4, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let thickness = $derived(barHeight ?? (compact ? 22 : 28));
	let rowGap = $derived(compact ? 12 : 16);
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let labelWidth = $derived(gutter - Tokens.spacing.md);

	/** The bar, or the wrapped name when it is taller, plus air. */
	function rowHeightOf(label: string) {
		return Math.max(thickness, wrappedLineCount(label, labelWidth) * labelSize * 1.1) + rowGap;
	}

	let rows = $derived(
		(sort === 'none' ? data : [...data].sort((a, b) => b[sort] - a[sort])).map((d) => ({
			...d,
			left: Math.max(0, d.left),
			right: Math.max(0, d.right)
		}))
	);

	let maxLeft = $derived(d3.max(rows, (d) => d.left) ?? 0);
	let maxRight = $derived(d3.max(rows, (d) => d.right) ?? 0);

	/**
	 * One scale for both directions. Zero is not pinned to the middle: it sits
	 * where the longest left bar ends, so a side that is small throughout does
	 * not leave half the plot empty — the scale stays shared, only the space
	 * each side is given follows what it holds.
	 */
	let lengthOf = $derived(
		d3
			.scaleLinear()
			.domain([0, maxLeft + maxRight || 1])
			.range([0, Math.max(0, plotWidth - 2 * valueSpace)])
	);
	let zero = $derived(valueSpace + lengthOf(maxLeft));

	/** Width each side name may wrap in: the left one may run over the name gutter. */
	let headerWidth = $derived({
		left: zero + gutter - Tokens.spacing.md,
		right: plotWidth - zero + margin.right - Tokens.spacing.md
	});
	/** The side names sit in this band above the bars, tall enough for their wrap. */
	let header = $derived(
		Math.max(
			...SIDES.map((side) => wrappedLineCount(sideLabels[side], headerWidth[side]))
		) *
			labelSize *
			1.1 +
			Tokens.spacing.md
	);

	type Row = BarrasDivergentesDatum & {
		bandTop: number;
		bandHeight: number;
		top: number;
		middle: number;
		length: Record<Side, number>;
		text: Record<Side, string>;
	};

	let layout = $derived.by<Row[]>(() => {
		let cursor = header;
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
				length: { left: lengthOf(d.left), right: lengthOf(d.right) },
				text: { left: formatValue(d.left), right: formatValue(d.right) }
			};
		});
	});

	let plotHeight = $derived(header + layout.reduce((sum, row) => sum + row.bandHeight, 0));
	/** Height follows the rows unless the host pins it. */
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	/** A custom single colour or gradient gets a dot from its own tip colour. */
	function dotOf(side: Side) {
		const fill = sideColors[side];
		if (!fill) return undefined;
		const tipColor = typeof fill === 'string' ? fill : fill[1];
		return d3.interpolateLab(tipColor, basePalette[100])(0.3);
	}

	/** The colour that stands for a side in the header and the tooltip key. */
	function keyColorOf(side: Side) {
		const fill = sideColors[side];
		if (!fill) return theme.palette.primaryVariant;
		return typeof fill === 'string' ? fill : fill[0];
	}

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRow = $derived(activeIndex === null ? null : layout[activeIndex]);

	function dimmed(label: string) {
		return highlight !== null && highlight !== label;
	}

	let tooltip = $derived(
		activeRow
			? {
					title: activeRow.label,
					rows: (['right', 'left'] as Side[])
						.filter((side) => shows(sideStage[side]))
						.map((side) => ({
							label: sideLabels[side],
							value: activeRow.text[side],
							color: keyColorOf(side)
						}))
				}
			: null
	);

	let table = $derived({
		caption: title ?? `${sideLabels.left} e ${sideLabels.right} por ${categoryLabel.toLowerCase()}`,
		columns: [categoryLabel, sideLabels.left, sideLabels.right],
		rows: layout.map((d) => [d.label, d.text.left, d.text.right])
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
	ariaLabel={title ?? `${sideLabels.left} e ${sideLabels.right} por ${categoryLabel.toLowerCase()}`}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			<!-- Each side names itself over its own half, anchored at zero. -->
			{#each SIDES as side (side)}
				<g class="fade" style:opacity={shows(sideStage[side]) ? 1 : 0}>
					<Text
						dx={zero + (side === 'right' ? Tokens.spacing.md : -Tokens.spacing.md)}
						dy={0}
						width={headerWidth[side]}
						text={sideLabels[side]}
						textAnchor={side === 'right' ? 'start' : 'end'}
						verticalAnchor="start"
						fontSize={labelSize}
						fontWeight={Tokens.fontWeight.semibold}
						fill={keyColorOf(side)}
					/>
				</g>
			{/each}

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

					{#each SIDES as side (side)}
						<g class="fade" style:opacity={shows(sideStage[side]) ? 1 : 0}>
							<CapsuleBar
								layout={capsuleBarLayout({
									x: side === 'right' ? zero : zero - row.length.left,
									y: row.top,
									width: row.length[side],
									height: thickness,
									reverse: side === 'left',
								})}
								fill={sideColors[side]}
								dotFill={dotOf(side)}
							/>

							<g class="fade" style:opacity={shows(2) ? 1 : 0}>
								<Text
									dx={side === 'right'
										? zero + row.length.right + Tokens.spacing.sm
										: zero - row.length.left - Tokens.spacing.sm}
									dy={row.middle}
									text={row.text[side]}
									textAnchor={side === 'right' ? 'start' : 'end'}
									verticalAnchor="middle"
									fontSize={labelSize}
									fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.semibold}
									fill={theme.palette.neutral[isActive ? 400 : 300]}
								/>
							</g>
						</g>
					{/each}

					{#if interactive}
						<!-- The whole row answers the pointer: a sliver of a bar is no target. -->
						<HitTarget
							{hover}
							{container}
							index={i}
							x={-gutter}
							y={row.bandTop}
							width={gutter + plotWidth + margin.right}
							height={row.bandHeight}
							label="{row.label}: {sideLabels.right} {row.text.right}, {sideLabels.left} {row.text.left}"
						/>
					{/if}
				</g>
			{/each}

			<!-- The shared zero, drawn over the bars: both halves start here. -->
			<Line
				from={{ x: zero, y: header - Tokens.spacing.xs }}
				to={{ x: zero, y: plotHeight }}
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
