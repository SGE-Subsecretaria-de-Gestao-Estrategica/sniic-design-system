<script lang="ts">
	/**
	 * Mapa hexagonal categórico: o Brasil esquemático, uma célula por UF, cada
	 * uma na cor da sua categoria.
	 *
	 * The grid, tiles and labels are the builder's hex maps (`core/hexMap`):
	 * flat-top tiles split by a page-coloured stroke, the UF code at the centre
	 * in a light or dark ink, whichever reads on the fill, and tiles without data
	 * in the empty fill. What changes is the question — "which kind", not "how
	 * much" — so the legend, the tooltip and the table name the category.
	 *
	 * Categories are ordered by default (stages of a process, levels): without a
	 * `color` they take the pillar's sequential ramp, pale to deep, in the order
	 * of `categories`. With `ordered={false}` they take the pillar's categorical
	 * hues instead, for a set with no order.
	 *
	 * In scrollytelling each category is a stage of its own, painted on top of
	 * the earlier ones (`mapaHexagonalCategoricoSteps`).
	 */
	import chroma from 'chroma-js';
	import HexCategorical from '$lib/core/components/hexMap/HexCategorical.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { categoricalLayout, hexRadiusForWidth } from '$lib/core/layouts/hexMap';
	import type { BrazilianRegion, CategoricalDatum } from '$lib/core/layouts/hexMap';
	import { getPillarTheme } from '$lib/core/theme';
	import { fontSize, fontWeight, strokeWidth } from '$lib/core/theme/tokens';
	import { BRAZIL_STATE_LABELS, type BrazilState } from '$lib/charts/brazilStates';
	import ChartShell from '../eixo6/ChartShell.svelte';
	import { sequentialRamp, seriesColors } from '../eixo6/scales.js';
	import type { FrameProps, ScrollytellingProps } from '../eixo6/types.js';
	import type { MapaHexagonalCategoria, MapaHexagonalCategoricoValor } from './mapaHexagonalCategorico.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			values: MapaHexagonalCategoricoValor[];
			/**
			 * The categories, in order, with optional colours. Categories in the data
			 * but not listed follow, as they first appear; listed ones no UF has still
			 * get their legend entry.
			 */
			categories?: MapaHexagonalCategoria[];
			/** Ramp (ordered) or palette hues (unordered) for categories without a `color`. */
			ordered?: boolean;
			/** What the categories are — tooltip row and header of the accessible table. */
			categoryLabel?: string;
			/** Writes how many UFs fall in each category after its name in the legend. */
			legendCounts?: boolean;
			/** How far regions are pulled apart, as a share of the hexagon radius (0 to 1). */
			regionGap?: number;
			/** Overrides the Eixo 1 palette. */
			pillarId?: number;
		};

	let {
		values,
		categories = [],
		ordered = true,
		categoryLabel = 'Categoria',
		legendCounts = true,
		regionGap = 0,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		pillarId = 1
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	/** Past this the hexagons get too big for the page; the builder's maps stop sooner. */
	const MAX_WIDTH = 560;
	/** Below this radius the UF codes no longer fit inside the tiles. */
	const MIN_LABEL_RADIUS = 12;

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	let plotWidth = $derived(Math.max(0, Math.min(shellWidth - 8, MAX_WIDTH)));

	const isUf = (uf: string): uf is BrazilState => uf in BRAZIL_STATE_LABELS;
	let known = $derived(values.filter((v) => isUf(v.uf)));

	let radius = $derived(hexRadiusForWidth(Math.max(1, plotWidth), regionGap));
	let layout = $derived(
		categoricalLayout(known, {
			radius,
			offsetK: regionGap,
			getUf: (v) => v.uf,
			getCategory: (v) => v.category,
			categoryOrder: categories.map((c) => c.label)
		})
	);
	let figureHeight = $derived(height ?? layout.height + margin.top + margin.bottom);

	let colors = $derived.by(() => {
		const n = layout.categories.length;
		const fallback = ordered ? sequentialRamp(theme.palette, n) : seriesColors(theme.palette, n);
		const given = new Map(categories.map((c) => [c.label, c.color]));
		return layout.categories.map((label, i) => given.get(label) ?? fallback[i]);
	});

	/** WCAG AA for text, as in the builder's maps. */
	const MIN_LIGHT_LABEL_CONTRAST = 4.5;
	const inkOn = (fill: string) =>
		chroma.contrast(theme.palette.base[100], fill) >= MIN_LIGHT_LABEL_CONTRAST
			? theme.palette.base[100]
			: theme.palette.neutral[300];
	let inks = $derived(colors.map(inkOn));

	/** A category is painted once its stage is reached. */
	const shows = (categoryIndex: number) => step < 0 || step >= categoryIndex;

	const REGION_NAMES: Record<string, BrazilianRegion> = {
		Norte: 'N',
		Nordeste: 'NE',
		'Centro-Oeste': 'CO',
		Sudeste: 'SE',
		Sul: 'S'
	};

	/** Every tile, data or not, in the grid's order: the hover and keyboard order. */
	let cells = $derived.by(() => {
		const byUf = new Map(layout.data.map((d) => [d.ufCode, d]));
		return [...layout.tiles.values()].map((tile, index) => ({
			...tile,
			index,
			datum: byUf.get(tile.ufCode)
		}));
	});

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeCell = $derived(activeIndex === null ? null : (cells[activeIndex] ?? null));

	/** `highlight`: a UF code, a category, or a region (its name or code). */
	function inHighlight(ufCode: string, region: BrazilianRegion, datum?: CategoricalDatum<unknown>) {
		if (highlight === null) return true;
		if (highlight === ufCode) return true;
		if (REGION_NAMES[highlight] === region || highlight === region) return true;
		return datum !== undefined && datum.category === highlight && shows(datum.categoryIndex);
	}

	const nameOf = (uf: string) => (isUf(uf) ? BRAZIL_STATE_LABELS[uf] : uf);

	let tooltip = $derived.by(() => {
		if (!activeCell) return null;
		const d = activeCell.datum;
		return {
			title: nameOf(activeCell.ufCode),
			rows:
				d && shows(d.categoryIndex)
					? [{ label: categoryLabel, value: d.category, color: colors[d.categoryIndex], emphasis: true }]
					: [{ label: categoryLabel, value: d ? '—' : 'Sem dado' }]
		};
	});

	let legend = $derived(
		layout.categories.map((label, i) => ({
			label: legendCounts ? `${label} (${layout.counts[i]})` : label,
			color: colors[i],
			dot: true
		}))
	);

	let table = $derived({
		caption: title ?? 'Categoria por UF',
		columns: ['UF', categoryLabel],
		rows: cells.map((c) => [nameOf(c.ufCode), c.datum ? c.datum.category : '—'])
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
	ariaLabel={title ?? 'Categoria por UF'}
>
	{#snippet children({ container })}
		{#if plotWidth > 0}
			<g class="fade">
				<HexCategorical
					{layout}
					categoryColors={layout.categories.map((_, i) =>
						shows(i) ? colors[i] : theme.palette.base[200]
					)}
					emptyFill={theme.palette.base[200]}
					tileStroke={theme.palette.base[100]}
					tileStrokeWidth={strokeWidth.sm}
					tileOpacity={(d, tile) => (inHighlight(tile.ufCode, tile.region, d) ? 1 : 0.3)}
					showNames={radius >= MIN_LABEL_RADIUS}
					labelFill={(d) =>
						d && shows(d.categoryIndex) ? inks[d.categoryIndex] : theme.palette.neutral[100]}
					nameFontSize={radius >= 26 ? fontSize.sm : fontSize.xs}
					nameFontWeight={fontWeight.medium}
				/>
			</g>

			{#if interactive}
				{#each cells as cell (cell.ufCode)}
					<HitTarget
						{hover}
						{container}
						index={cell.index}
						x={0}
						y={0}
						d={layout.pathData}
						transform="translate({cell.position.x},{cell.position.y})"
						label="{nameOf(cell.ufCode)}: {cell.datum && shows(cell.datum.categoryIndex)
							? cell.datum.category
							: 'sem dado'}"
					/>
				{/each}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	.fade :global(path),
	.fade :global(g) {
		transition:
			opacity 450ms ease-out,
			fill 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade :global(path),
		.fade :global(g) {
			transition: none;
		}
	}
</style>
