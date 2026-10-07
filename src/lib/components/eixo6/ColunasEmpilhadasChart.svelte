<script lang="ts">
  import { basePalette, neutralPalette } from '$lib/core/theme/tokens';
	/**
	 * Colunas empilhadas: uma coluna por categoria (ou por ano), cada série
	 * uma parcela da pilha.
	 *
	 * Every column is a `CapsuleStack` — one capsule of the family split into
	 * bands, the round tip belonging to the column, not to its top segment.
	 * Series take the pillar's categorical colours. With `normalize`, every
	 * column closes at 100% and the question becomes composition; without it,
	 * columns keep their absolute heights on one shared scale and the total is
	 * written above each.
	 *
	 * With `rank`, each column reorders its series by value, largest on top,
	 * and `ribbons` joins the same series between neighbouring columns with a
	 * translucent band — a series that overtakes another shows as ribbons
	 * crossing, one that holds its place as ribbons running parallel.
	 *
	 * A segment's value is written inside it only when it fits; the tooltip
	 * and the table carry every value either way.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import CapsuleStack from '$lib/core/components/capsuleStack/CapsuleStack.svelte';
	import { capsuleStackLayout } from '$lib/core/layouts/capsuleStack';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber, formatLocale } from '$lib/core/format';
	import { pickContrastInk } from '$lib/utils/contrastColor';
	import getStringWidth from '$lib/core/utils/getStringWidth';
	import ChartShell from './ChartShell.svelte';
	import type { ColunasDatum, ColunasSpan } from './data.js';
	import { seriesColors, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: ColunasDatum[];
			/** Series in stacking order, bottom to top. */
			keys: string[];
			/** Display name per series key. */
			labels?: Record<string, string>;
			/** Colours in the order of `keys`; defaults to the pillar's categorical palette. */
			colors?: string[];
			/** Close every column at 100%: composition instead of volume. */
			normalize?: boolean;
			/** Stretches marked with a bracket above the plot. */
			spans?: ColunasSpan[];
			/** Reorder each column's series by value, largest on top. */
			rank?: boolean;
			/** Join each series between neighbouring columns with a translucent band. */
			ribbons?: boolean;
			formatValue?: (value: number) => string;
			/** Height of the plot itself, without labels; ignored when `height` is set. */
			plotHeight?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		data,
		keys,
		labels = {},
		colors,
		normalize = false,
		spans = [],
		rank = false,
		ribbons = false,
		formatValue = (value: number) => formatCompactNumber(value, Math.abs(value) >= 1e6 ? 1 : 0),
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		plotHeight: plotHeightProp = 220,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();
	const pctFormat = formatLocale.format('.0%');
	const shows = (stage: number) => step < 0 || step >= stage;

	let palette = $derived(colors ?? seriesColors(theme.palette, keys.length));
	const nameOf = (key: string) => labels[key] ?? key;
	let inks = $derived(
		palette.map((c) =>
			pickContrastInk(d3.color(c)?.formatHex() ?? neutralPalette[400], {
				light: basePalette[100],
				dark: theme.palette.neutral[400]
			})
		)
	);

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	const LABEL_GAP = 10;
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	/** Room above the columns for totals, and for span brackets when there are any. */
	let topRoom = $derived((normalize ? 4 : 22) + (spans.length ? 26 : 0));

	let plotWidth = $derived(Math.max(0, shellWidth - 16));
	let band = $derived(
		d3
			.scaleBand<number>()
			.domain(data.map((_, i) => i))
			.range([0, plotWidth])
			.paddingInner(0.3)
			.paddingOuter(0.05)
	);
	let thickness = $derived(Math.min(band.bandwidth(), compact ? 34 : 52));
	let labelWidth = $derived(Math.max(0, band.step() - Tokens.spacing.xs));
	let labelLines = $derived(Math.max(1, ...data.map((d) => wrappedLineCount(d.label, labelWidth))));
	let labelsHeight = $derived(LABEL_GAP + labelLines * labelSize * 1.1);

	let margin = $derived({ top: 4, right: 8, bottom: labelsHeight + 4, left: 8 });
	let figureHeight = $derived(height ?? topRoom + plotHeightProp + margin.top + margin.bottom);
	let plotHeight = $derived(Math.max(0, figureHeight - margin.top - margin.bottom));

	const valueOf = (d: ColunasDatum, key: string) => Math.max(0, d.values[key] ?? 0);
	let totals = $derived(data.map((d) => d3.sum(keys, (key) => valueOf(d, key))));

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, normalize ? 1 : d3.max(totals) || 1])
			.range([0, Math.max(0, plotHeight - topRoom)])
	);

	type Segment = {
		key: string;
		index: number;
		value: number;
		share: number;
		length: number;
		/** Distance from the base to this segment's start, in px. */
		offset: number;
	};
	type Column = {
		label: string;
		index: number;
		center: number;
		total: number;
		segments: Segment[];
		length: number;
	};

	let columns = $derived<Column[]>(
		data.map((d, i) => {
			const total = totals[i];
			const ordered = keys.map((key, k) => {
				const value = valueOf(d, key);
				const share = total > 0 ? value / total : 0;
				return { key, index: k, value, share, length: yScale(normalize ? share : value), offset: 0 };
			});
			// Ranked: smallest at the base so the largest lands on top.
			if (rank) ordered.sort((a, b) => a.value - b.value);
			let offset = 0;
			const segments = ordered.map((seg) => {
				const placed = { ...seg, offset };
				offset += seg.length;
				return placed;
			});
			return {
				label: d.label,
				index: i,
				center: (band(i) ?? 0) + band.bandwidth() / 2,
				total,
				segments,
				length: d3.sum(segments, (s) => s.length)
			};
		})
	);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeColumn = $derived(activeIndex === null ? null : columns[activeIndex]);

	/** `highlight` names a series: its segments stay, the others dim. */
	function segmentOpacity(key: string) {
		return highlight !== null && highlight !== key && highlight !== nameOf(key) ? 0.25 : 1;
	}

	const valueText = (s: Segment) => (normalize ? pctFormat(s.share) : formatValue(s.value));

	/** A segment holds its value when the text fits inside with some air. */
	function fits(s: Segment) {
		const text = valueText(s);
		const textWidth = getStringWidth(text, '') ?? text.length * 7;
		return s.length >= Tokens.fontSize.sm + 6 && textWidth * 0.8 + 6 <= thickness;
	}

	let tooltip = $derived(
		activeColumn
			? {
					title: activeColumn.label,
					rows: [...activeColumn.segments]
						.reverse()
						.filter((s) => s.value > 0)
						.map((s) => ({
							label: nameOf(s.key),
							value: normalize
								? pctFormat(s.share)
								: `${formatValue(s.value)} · ${pctFormat(s.share)}`,
							color: palette[s.index]
						}))
				}
			: null
	);

	let legend = $derived(
		[...keys].reverse().map((key) => ({
			label: nameOf(key),
			color: palette[keys.indexOf(key)],
			dot: true
		}))
	);

	let table = $derived({
		caption: title ?? 'Colunas empilhadas',
		columns: ['', ...keys.map(nameOf), ...(normalize ? [] : ['Total'])],
		rows: columns.map((c) => [
			c.label,
			...keys.map((key) => {
				const s = c.segments.find((seg) => seg.key === key)!;
				return normalize ? pctFormat(s.share) : formatValue(s.value);
			}),
			...(normalize ? [] : [formatValue(c.total)])
		])
	});

	/**
	 * A cubic band from a segment's edges in one column to the same series'
	 * edges in the next — never an elbow, which would suggest an abrupt jump.
	 * A series absent from either column gets no ribbon rather than one that
	 * starts or ends in the void. Ribbons attach only where a column's side is
	 * straight: the top of the stack is the capsule's round tip, so an edge
	 * that would land on it is lowered to where the tip meets the side.
	 */
	let ribbonPaths = $derived.by(() => {
		if (!ribbons) return [];
		const out: { id: string; key: string; index: number; d: string }[] = [];
		const inset = 1;
		const tip = thickness / 2;
		/** A segment's edges on the column's straight side, top to bottom. */
		const edges = (c: Column, s: Segment) => {
			const bot = plotHeight - s.offset - inset;
			const straightTop = plotHeight - Math.max(0, c.length - tip);
			const top = Math.min(Math.max(plotHeight - s.offset - s.length + inset, straightTop), bot);
			return [top, bot];
		};
		for (let i = 0; i < columns.length - 1; i++) {
			const a = columns[i];
			const b = columns[i + 1];
			const x0 = a.center + thickness / 2;
			const x1 = b.center - thickness / 2;
			const mid = (x0 + x1) / 2;
			for (const sa of a.segments) {
				const sb = b.segments.find((s) => s.key === sa.key);
				if (!sa.length || !sb?.length) continue;
				const [top0, bot0] = edges(a, sa);
				const [top1, bot1] = edges(b, sb);
				if (bot0 - top0 < 1 && bot1 - top1 < 1) continue;
				out.push({
					id: `${sa.key}-${i}`,
					key: sa.key,
					index: sa.index,
					d: `M${x0},${top0} C${mid},${top0} ${mid},${top1} ${x1},${top1} L${x1},${bot1} C${mid},${bot1} ${mid},${bot0} ${x0},${bot0} Z`
				});
			}
		}
		return out;
	});

	/** Spans resolved to pixel extents over their columns. */
	let spanMarks = $derived(
		spans
			.map((span) => {
				const from = data.findIndex((d) => d.label === span.from);
				const to = data.findIndex((d) => d.label === span.to);
				if (from < 0 || to < 0) return null;
				return {
					...span,
					x0: band(Math.min(from, to)) ?? 0,
					x1: (band(Math.max(from, to)) ?? 0) + band.bandwidth()
				};
			})
			.filter((s) => s !== null)
	);
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
	ariaLabel={title ?? 'Colunas empilhadas'}
>
	{#snippet children({ container })}
		{#if columns.length && plotWidth > 0}
			{#each spanMarks as span (span.text + span.x0)}
				<g class="span">
					<Line
						from={{ x: span.x0, y: 18 }}
						to={{ x: span.x1, y: 18 }}
						stroke={theme.palette.neutral[100]}
						strokeWidth={Tokens.strokeWidth.xs}
					/>
					<Line from={{ x: span.x0, y: 18 }} to={{ x: span.x0, y: 23 }} stroke={theme.palette.neutral[100]} strokeWidth={Tokens.strokeWidth.xs} />
					<Line from={{ x: span.x1, y: 18 }} to={{ x: span.x1, y: 23 }} stroke={theme.palette.neutral[100]} strokeWidth={Tokens.strokeWidth.xs} />
					<Text
						dx={(span.x0 + span.x1) / 2}
						dy={14}
						text={span.text}
						textAnchor="middle"
						verticalAnchor="end"
						fontSize={Tokens.fontSize.xs}
						fill={theme.palette.neutral[100]}
					/>
				</g>
			{/each}

			{#if ribbons}
				<!-- Behind the columns: the solid segments read as the anchors. -->
				<g class="fade" style:opacity={shows(1) ? 1 : 0}>
					{#each ribbonPaths as ribbon (ribbon.id)}
						<path
							d={ribbon.d}
							fill={palette[ribbon.index]}
							fill-opacity={0.3 * segmentOpacity(ribbon.key)}
						/>
					{/each}
				</g>
			{/if}

			{#each columns as c (c.index)}
				{@const isActive = c.index === activeIndex}
				{@const x = c.center - thickness / 2}
				<CapsuleStack
					layout={capsuleStackLayout(
						c.segments.map((s) => ({
							length: s.length,
							fill: palette[s.index],
							fillOpacity: segmentOpacity(s.key)
						})),
						{ x, y: plotHeight - c.length, width: thickness, height: c.length }
					)}
				/>

				<g class="fade" style:opacity={shows(1) ? 1 : 0}>
					{#each c.segments as s (s.key)}
						{#if s.value > 0 && fits(s)}
							<Text
								dx={c.center}
								dy={plotHeight - s.offset - s.length / 2}
								text={valueText(s)}
								textAnchor="middle"
								verticalAnchor="middle"
								fontSize={Tokens.fontSize.sm}
								fontWeight={Tokens.fontWeight.semibold}
								fill={inks[s.index]}
								opacity={segmentOpacity(s.key)}
							/>
						{/if}
					{/each}
				</g>

				{#if !normalize}
					<Text
						dx={c.center}
						dy={plotHeight - c.length - Tokens.spacing.sm}
						text={formatValue(c.total)}
						textAnchor="middle"
						verticalAnchor="end"
						fontSize={labelSize}
						fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.semibold}
						fill={theme.palette.neutral[isActive ? 400 : 300]}
					/>
				{/if}

				<Text
					dx={c.center}
					dy={plotHeight + LABEL_GAP}
					width={labelWidth}
					text={c.label}
					textAnchor="middle"
					verticalAnchor="start"
					fontSize={labelSize}
					fontWeight={isActive ? Tokens.fontWeight.semibold : Tokens.fontWeight.medium}
					fill={theme.palette.neutral[300]}
				/>

				{#if interactive}
					<HitTarget
						{hover}
						{container}
						index={c.index}
						x={band(c.index) ?? 0}
						y={0}
						width={band.bandwidth()}
						height={plotHeight + labelsHeight}
						label="{c.label}: {formatValue(c.total)}"
					/>
				{/if}
			{/each}

			<Line
				from={{ x: 0, y: plotHeight }}
				to={{ x: plotWidth, y: plotHeight }}
				stroke={theme.palette.base[300]}
				strokeWidth={Tokens.strokeWidth.md}
			/>
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
