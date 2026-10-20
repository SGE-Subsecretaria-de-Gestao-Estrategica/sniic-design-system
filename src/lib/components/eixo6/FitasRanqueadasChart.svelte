<script lang="ts">
	/**
	 * Fitas ranqueadas: cada série é uma fita contínua que corre da esquerda
	 * para a direita, ano a ano, empilhada pelo valor — a maior no topo. Quando
	 * uma série ultrapassa outra, as fitas se cruzam.
	 *
	 * The geometry is `rankedRibbonsLayout` and the drawing `RankedRibbons`,
	 * the same pair the builder uses: a year is where every ribbon holds its
	 * measured thickness flat for a short plateau, and between two years each
	 * ribbon bends with `curveBumpX`. Ribbons are outlined in the background
	 * colour, so at a crossing the one passing over reads as woven across; a
	 * series that drops to zero tapers into the base.
	 *
	 * Gridlines mark each year, as in the line charts. A methodological break
	 * (`breakBefore`) splits the years like the line charts' RAIS break: a gap
	 * the ribbons cross faded, as the lines cross it dashed. Values sit inside
	 * the plateaus when they fit, except the last year's, which close each
	 * ribbon in the right gutter with its name, like the end of a line.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import RankedRibbons from '$lib/core/components/rankedRibbons/RankedRibbons.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { rankedRibbonsLayout, RANKED_RIBBONS_DEFAULTS } from '$lib/core/layouts/rankedRibbons';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber, formatLocale } from '$lib/core/format';
	import { pickContrastInk } from '$lib/utils/contrastColor';
	import ChartShell from './ChartShell.svelte';
	import type { ColunasDatum } from './data.js';
	import { seriesColors, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** One row per year (or stage), in reading order. */
			data: ColunasDatum[];
			/** Series keys; their order only sets the colours — the stack is ranked. */
			keys: string[];
			/** Display name per series key. */
			labels?: Record<string, string>;
			/** Colours in the order of `keys`; defaults to the pillar's categorical palette. */
			colors?: string[];
			formatValue?: (value: number) => string;
			/** Values inside the plateaus: in every year, or only where the period (or a segment) starts and ends. */
			valueLabels?: 'all' | 'ends';
			/** The total of each year above its stack. */
			showTotals?: boolean;
			/** Space between two stacked ribbons, in px (not the outline). */
			ribbonGap?: number;
			/** Label of the first year after a methodological break (e.g. RAIS after 2021); omit for none. */
			breakBefore?: string;
			/** Fraction of the year-to-year step each ribbon holds flat, either side of a year. */
			plateau?: number;
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
		formatValue = (value: number) => formatCompactNumber(value, Math.abs(value) >= 1e6 ? 1 : 0),
		valueLabels = 'all',
		showTotals = true,
		ribbonGap = RANKED_RIBBONS_DEFAULTS.ribbonGap,
		breakBefore,
		plateau = RANKED_RIBBONS_DEFAULTS.plateau,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		plotHeight: plotHeightProp = 240,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();
	const pctFormat = formatLocale.format('.0%');
	const shows = (stage: number) => step < 0 || step >= stage;

	let palette = $derived(colors ?? seriesColors(theme.palette, keys.length));
	const nameOf = (key: string) => labels[key] ?? key;
	// The value's colour on its ribbon: the page colour where it reads, else the text colour.
	let inks = $derived(
		palette.map((c) =>
			pickContrastInk(d3.color(c)?.formatHex() ?? theme.palette.neutral[300], {
				light: theme.palette.base[100],
				dark: theme.palette.neutral[300]
			})
		)
	);

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	const LABEL_GAP = 10;
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);

	/** The gutter that closes each ribbon with its last value; gone when narrow. */
	let gutter = $derived(compact ? 0 : 104);
	let margin = $derived({
		top: 4,
		right: gutter ? gutter + RANKED_RIBBONS_DEFAULTS.endLabelGap : 8,
		bottom: LABEL_GAP + labelSize * 1.2 + 4,
		left: 8
	});
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let totalsRoom = $derived(showTotals ? RANKED_RIBBONS_DEFAULTS.totalsRoom : 0);
	let figureHeight = $derived(height ?? totalsRoom + plotHeightProp + margin.top + margin.bottom);
	let plotHeight = $derived(Math.max(0, figureHeight - margin.top - margin.bottom));

	type Row = { column: number; key: string; value: number };
	/** Long rows, every key in every year (a missing value is 0), x = the year's index. */
	let rows = $derived(
		data.flatMap((d, i) => keys.map((key): Row => ({ column: i, key, value: d.values[key] ?? 0 })))
	);
	let breakIndex = $derived(breakBefore === undefined ? -1 : data.findIndex((d) => d.label === breakBefore));

	let layout = $derived(
		rankedRibbonsLayout(rows, {
			getX: (r) => r.column,
			getY: (r) => r.value,
			getSeries: (r) => r.key,
			seriesOrder: keys,
			width: plotWidth,
			height: plotHeight,
			breaksAfter: breakIndex > 0 ? [breakIndex - 1] : undefined,
			totals: showTotals,
			endLabels: gutter > 0,
			endNameLines: (key) => wrappedLineCount(nameOf(key), gutter),
			ribbonGap,
			plateau
		})
	);

	let activeIndex = $derived(focusIndex ?? hover.index);

	/** Each year hovers from halfway to the previous one to halfway to the next. */
	let hitBands = $derived(
		layout.columns.map((c, i, all) => [
			i > 0 ? (all[i - 1].x + c.x) / 2 : 0,
			i < all.length - 1 ? (c.x + all[i + 1].x) / 2 : plotWidth
		])
	);

	/** `highlight` names a series: its ribbon stays, the others dim. */
	function seriesOpacity(key: string) {
		return highlight !== null && highlight !== key && highlight !== nameOf(key) ? 0.2 : 1;
	}

	let tooltip = $derived.by(() => {
		const column = activeIndex === null ? undefined : layout.columns[activeIndex];
		if (!column) return null;
		return {
			title: data[column.index].label,
			rows: [...column.slots]
				.reverse()
				.filter((s) => s.value > 0)
				.map((s) => ({
					label: nameOf(s.series),
					value: `${formatValue(s.value)} · ${pctFormat(s.share)}`,
					color: palette[s.seriesIndex]
				}))
		};
	});

	let legend = $derived(keys.map((key, k) => ({ label: nameOf(key), color: palette[k], dot: true })));

	let table = $derived({
		caption: title ?? 'Fitas ranqueadas',
		columns: ['', ...keys.map(nameOf), 'Total'],
		rows: data.map((d) => [
			d.label,
			...keys.map((key) => formatValue(Math.max(0, d.values[key] ?? 0))),
			formatValue(d3.sum(keys, (key) => Math.max(0, d.values[key] ?? 0)))
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
	{legend}
	{table}
	ariaLabel={title ?? 'Fitas ranqueadas'}
>
	{#snippet children({ container })}
		{#if layout.columns.length && plotWidth > 0}
			{#each layout.xAxis.segments as segment (segment.index)}
				<GridColumns scale={segment.scale} tickValues={segment.ticks} height={plotHeight} />
			{/each}

			<RankedRibbons
				class="fitas"
				{layout}
				fill={(ribbon) => palette[ribbon.index]}
				{seriesOpacity}
				showValues={(slot, column) =>
					!slot.isEndLabel &&
					(valueLabels === 'all' || column.isSegmentStart || column.isSegmentEnd)}
				formatValue={(slot) => formatValue(slot.value)}
				valueFill={(slot) => inks[slot.seriesIndex]}
				{showTotals}
				formatTotal={(column) => formatValue(column.total)}
				totalFill={(column) => (column.index === activeIndex ? theme.palette.neutral[400] : undefined)}
				formatName={(ribbon) => nameOf(ribbon.key)}
				nameWidth={gutter}
				labelsOpacity={shows(1) ? 1 : 0}
			/>

			{#each layout.columns as column (column.key)}
				{@const isActive = column.index === activeIndex}
				<Text
					dx={column.x}
					dy={plotHeight + LABEL_GAP}
					text={data[column.index].label}
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
						index={column.index}
						x={hitBands[column.index][0]}
						y={0}
						width={hitBands[column.index][1] - hitBands[column.index][0]}
						height={plotHeight + LABEL_GAP + labelSize * 1.2}
						label="{data[column.index].label}: {formatValue(column.total)}"
					/>
				{/if}
			{/each}
		{/if}
	{/snippet}
</ChartShell>

<style>
	:global(.fitas .ranked-ribbons__ribbon),
	:global(.fitas .ranked-ribbons__labels) {
		transition: opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.fitas .ranked-ribbons__ribbon),
		:global(.fitas .ranked-ribbons__labels) {
			transition: none;
		}
	}
</style>
