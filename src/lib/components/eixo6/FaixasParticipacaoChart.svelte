<script lang="ts">
	/**
	 * Faixas de participação (histomap): os anos correm de cima para baixo e,
	 * em cada um, as categorias repartem a largura toda — cada faixa tem a
	 * largura da sua participação naquele ano.
	 *
	 * The bands take the pillar's categorical colours, separated by thin gaps
	 * in the background colour. Each band holds its measured width as a short
	 * plateau on its year's line and bends only in the gap between two years —
	 * without the plateau a one-year category would draw as an ellipse — with
	 * `curveBumpY`, so every transition is one continuous S. The width is a
	 * share, so the plot carries no numbers: the tooltip and the table do, and
	 * reading blocks in the right gutter tell what happened in the years that
	 * matter.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { basePalette, neutralPalette } from '$lib/core/theme/tokens';
	import { formatLocale } from '$lib/core/format';
	import { pickContrastInk } from '$lib/utils/contrastColor';
	import getStringWidth from '$lib/core/utils/getStringWidth';
	import ChartShell from './ChartShell.svelte';
	import type { ColunasDatum, FaixasParticipacaoDestaque } from './data.js';
	import { seriesColors, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** One row per year; `label` is the year. */
			data: ColunasDatum[];
			/** Categories in stacking order, left to right. */
			keys: string[];
			labels?: Record<string, string>;
			colors?: string[];
			/** Reading blocks in the right gutter, one per year that needs telling. */
			highlights?: FaixasParticipacaoDestaque[];
			/** Height of one year's row, in px. */
			rowHeight?: number;
			/** Fraction of a year each band holds its width flat, either side of the year's line. */
			plateau?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		data,
		keys,
		labels = {},
		colors,
		highlights = [],
		rowHeight = 22,
		plateau = 0.15,
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
	const pct1 = formatLocale.format('.1%');

	let palette = $derived(colors ?? seriesColors(theme.palette, keys.length));
	const nameOf = (key: string) => labels[key] ?? key;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	/** The gutter that holds the reading blocks; gone when there are none or no room. */
	let gutter = $derived(highlights.length && !compact ? 168 : 0);
	let margin = $derived({ top: 4, right: gutter ? gutter + 16 : 8, bottom: 8, left: 40 });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let rows = $derived(
		[...data]
			.map((d) => ({ ...d, year: Number(d.label) }))
			.sort((a, b) => a.year - b.year)
	);
	let years = $derived(rows.map((d) => d.year));
	let plotHeight = $derived(Math.max(rowHeight, (years.length - 1) * rowHeight));
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom + 8);

	let x = $derived(d3.scaleLinear().domain([0, 1]).range([0, plotWidth]));
	let y = $derived(
		d3
			.scaleLinear()
			.domain([years[0] ?? 0, years.at(-1) ?? 1])
			.range([0, plotHeight])
	);

	/** Each year's shares, stacked left to right. */
	let slices = $derived(
		rows.map((row) => {
			const total = d3.sum(keys, (k) => Math.max(0, row.values[k] ?? 0)) || 1;
			let cursor = 0;
			return keys.map((key) => {
				const share = Math.max(0, row.values[key] ?? 0) / total;
				const left = cursor;
				cursor += share;
				return { key, share, left, right: cursor };
			});
		})
	);

	type Pt = { y: number; x0: number; x1: number };
	const bandArea = d3
		.area<Pt>()
		.y((p) => p.y)
		.x0((p) => p.x0)
		.x1((p) => p.x1)
		.curve(d3.curveBumpY);

	const GAP = 1;

	let bands = $derived(
		keys.map((key, k) => {
			const points = years.flatMap((year, i) => {
				const s = slices[i][k];
				const left = x(s.left);
				const right = x(s.right);
				const g = Math.min(GAP, (right - left) / 2);
				const x0 = left + (s.left > 1e-6 ? g : 0);
				const x1 = right - (s.right < 1 - 1e-6 ? g : 0);
				const before = i === 0 ? year : year - plateau;
				const after = i === years.length - 1 ? year : year + plateau;
				return [
					{ y: y(before), x0, x1 },
					{ y: y(after), x0, x1 }
				];
			});
			// The name goes where the band is widest.
			let widest = 0;
			slices.forEach((row, i) => {
				if (row[k].share > slices[widest][k].share) widest = i;
			});
			const s = slices[widest]?.[k];
			return {
				key,
				index: k,
				d: bandArea(points) ?? '',
				labelX: s ? x((s.left + s.right) / 2) : 0,
				// Kept inside the plot: a band widest in the first or last year
				// would otherwise centre its name on the edge.
				labelY: Math.min(
					Math.max(y(years[widest] ?? 0), Tokens.fontSize.sm),
					plotHeight - Tokens.fontSize.sm
				),
				labelRoom: s ? x(s.right) - x(s.left) : 0
			};
		})
	);

	let inks = $derived(
		palette.map((c) =>
			pickContrastInk(d3.color(c)?.formatHex() ?? neutralPalette[400], {
				light: basePalette[100],
				dark: theme.palette.neutral[400]
			})
		)
	);

	function bandOpacity(key: string) {
		return highlight !== null && highlight !== key && highlight !== nameOf(key) ? 0.25 : 1;
	}

	/** Reading blocks centred on their year, then pushed apart in order. */
	let blocks = $derived.by(() => {
		const titleSize = Tokens.fontSize.md;
		const noteSize = Tokens.fontSize.sm;
		const list = highlights
			.map((h) => {
				const titleLines = wrappedLineCount(h.title, gutter);
				const noteLines = h.note ? wrappedLineCount(h.note, gutter) : 0;
				const blockHeight =
					(h.value ? Tokens.fontSize.lg * 1.2 : 0) +
					titleLines * titleSize * 1.15 +
					noteLines * noteSize * 1.2;
				return { ...h, blockHeight, anchor: y(h.year), top: 0 };
			})
			.sort((a, b) => a.anchor - b.anchor);
		const GAP_BLOCK = 10;
		list.forEach((b, i) => {
			b.top = b.anchor - b.blockHeight / 2;
			if (i > 0) b.top = Math.max(b.top, list[i - 1].top + list[i - 1].blockHeight + GAP_BLOCK);
		});
		for (let i = list.length - 1; i >= 0; i--) {
			const limit = i === list.length - 1 ? plotHeight : list[i + 1].top - GAP_BLOCK;
			list[i].top = Math.min(list[i].top, limit - list[i].blockHeight);
		}
		return list;
	});

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeYear = $derived(activeIndex === null ? null : years[activeIndex]);

	let tooltip = $derived.by(() => {
		if (activeYear === null) return null;
		const i = years.indexOf(activeYear);
		return {
			title: String(activeYear),
			rows: slices[i]
				.filter((s) => s.share > 0)
				.map((s) => ({
					label: nameOf(s.key),
					value: pct1(s.share),
					color: palette[keys.indexOf(s.key)]
				}))
		};
	});

	let legend = $derived(keys.map((key, k) => ({ label: nameOf(key), color: palette[k], dot: true })));

	let table = $derived({
		caption: title ?? 'Participação por ano',
		columns: ['Ano', ...keys.map(nameOf)],
		rows: years.map((year, i) => [year, ...slices[i].map((s) => pct1(s.share))])
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
	{legend}
	{table}
	ariaLabel={title ?? 'Participação por ano'}
>
	{#snippet children({ container })}
		{#if years.length && plotWidth > 0}
			{#each bands as band (band.key)}
				<path class="fade" d={band.d} fill={palette[band.index]} style:opacity={bandOpacity(band.key)} />
			{/each}

			{#each years as year, i (year)}
				{@const isActive = i === activeIndex}
				<Text
					dx={-Tokens.spacing.sm}
					dy={y(year)}
					text={String(year)}
					textAnchor="end"
					verticalAnchor="middle"
					fontSize={Tokens.fontSize.sm}
					fontWeight={isActive || blocks.some((b) => b.year === year)
						? Tokens.fontWeight.bold
						: Tokens.fontWeight.medium}
					fill={theme.palette.neutral[isActive ? 400 : 200]}
				/>
			{/each}

			<g class="fade" style:opacity={shows(1) ? 1 : 0}>
				{#each bands as band (band.key)}
					{@const name = nameOf(band.key)}
					{@const textWidth = getStringWidth(name, '') ?? name.length * 7}
					{#if textWidth * 0.75 + 10 < band.labelRoom}
						<Text
							dx={band.labelX}
							dy={band.labelY}
							text={name}
							textAnchor="middle"
							verticalAnchor="middle"
							fontSize={Tokens.fontSize.sm}
							fontWeight={Tokens.fontWeight.semibold}
							fill={inks[band.index]}
							opacity={bandOpacity(band.key)}
						/>
					{/if}
				{/each}
			</g>

			{#if gutter}
				<g class="fade" style:opacity={shows(2) ? 1 : 0}>
					{#each blocks as b (b.year)}
						{@const valueHeight = b.value ? Tokens.fontSize.lg * 1.2 : 0}
						<line
							x1={plotWidth + 4}
							y1={y(b.year)}
							x2={plotWidth + 12}
							y2={b.top + (valueHeight || Tokens.fontSize.md) / 2}
							stroke={theme.palette.neutral[100]}
							stroke-opacity={0.6}
						/>
						{#if b.value}
							<Text
								dx={plotWidth + 16}
								dy={b.top}
								text={b.value}
								verticalAnchor="start"
								fontSize={Tokens.fontSize.lg}
								fontWeight={Tokens.fontWeight.bold}
								fill={theme.palette.neutral[400]}
							/>
						{/if}
						<Text
							dx={plotWidth + 16}
							dy={b.top + valueHeight}
							width={gutter}
							text={b.title}
							verticalAnchor="start"
							fontSize={Tokens.fontSize.md}
							fontWeight={Tokens.fontWeight.semibold}
							fill={theme.palette.neutral[300]}
						/>
						{#if b.note}
							<Text
								dx={plotWidth + 16}
								dy={b.top + valueHeight + wrappedLineCount(b.title, gutter) * Tokens.fontSize.md * 1.15}
								width={gutter}
								text={b.note}
								verticalAnchor="start"
								fontSize={Tokens.fontSize.sm}
								fill={theme.palette.neutral[100]}
							/>
						{/if}
					{/each}
				</g>
			{/if}

			{#if interactive}
				{#each years as year, i (year)}
					<HitTarget
						{hover}
						{container}
						index={i}
						x={0}
						y={y(year) - rowHeight / 2}
						width={plotWidth}
						height={rowHeight}
						label={String(year)}
					/>
				{/each}
			{/if}
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
