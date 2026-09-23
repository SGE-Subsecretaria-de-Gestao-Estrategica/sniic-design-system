<script lang="ts">
	/**
	 * Taxa de informalidade na Economia Criativa e no Brasil.
	 *
	 * The lines share one y scale, and the gap between them gets its own panel
	 * below in percentage points — a difference is a different measure, so it
	 * gets a different plot rather than a second axis on the same one.
	 */
	import * as d3 from 'd3';
	import Group from '$lib/core/components/Group.svelte';
	import Text from '$lib/core/components/Text.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import LinePath from '$lib/core/components/shape/LinePath.svelte';
	import Circle from '$lib/core/components/markers/Circle.svelte';
	import HoverLayer from '$lib/core/components/interaction/HoverLayer.svelte';
	import Crosshair from '$lib/core/components/interaction/Crosshair.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import { INFORMALIDADE_DESTAQUE } from './steps.js';
	import type { InformalidadeDatum } from './data.js';
	import { paddedExtent, responsiveMargin, separateLabels } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: InformalidadeDatum[];
			/** Series revealed first and drawn in the emphasis colour. */
			featured?: string;
			/** Series the difference is measured against. */
			baseline?: string;
			valueLabels?: 'selective' | 'all';
		};

	let {
		data,
		width,
		height = 260,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		featured = INFORMALIDADE_DESTAQUE,
		baseline = 'Brasil',
		valueLabels = 'selective'
	}: Props = $props();

	const theme = getPillarTheme(6);
	const pctFormat = formatLocale.format('.1%');
	const ppFormat = formatLocale.format('.1f');
	const hover = new HoverState();

	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let margin = $derived(responsiveMargin(shellWidth));
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	const AXES_GAP = 26;
	let usableHeight = $derived(Math.max(0, height - margin.top - margin.bottom - AXES_GAP));
	let topHeight = $derived(usableHeight * 0.78);
	let bottomHeight = $derived(usableHeight - topHeight);
	let plotHeight = $derived(topHeight + AXES_GAP + bottomHeight);

	let years = $derived([...new Set(data.map((d) => d.year))].sort((a, b) => a - b));

	let xScale = $derived(
		d3
			.scaleTime()
			.domain([new Date(years[0] ?? 2015, 0, 1), new Date(years.at(-1) ?? 2024, 0, 1)])
			.range([0, plotWidth])
	);

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain(paddedExtent(data.map((d) => d.rate)))
			.range([topHeight, 0])
	);

	const xOf = (year: number) => xScale(new Date(year, 0, 1));

	type Point = InformalidadeDatum & { x: number; y: number; label: string };
	type Series = {
		group: string;
		points: Point[];
		color: string;
		markerColor: string;
		isFeatured: boolean;
		last: Point;
	};

	let groups = $derived<Series[]>(
		d3
			.groups(data, (d) => d.group)
			.map(([group, rows]) => {
				const isFeatured = group === featured;
				const points = rows
					.slice()
					.sort((a, b) => a.year - b.year)
					.map((d) => ({ ...d, x: xOf(d.year), y: yScale(d.rate), label: pctFormat(d.rate) }));

				return {
					group,
					points,
					color: isFeatured ? theme.palette.secondary : theme.palette.primary,
					markerColor: isFeatured
						? theme.palette.secondaryVariant
						: theme.palette.primaryVariant,
					isFeatured,
					last: points.at(-1)!
				};
			})
			.sort((a, b) => Number(a.isFeatured) - Number(b.isFeatured))
	);

	/** Gap in percentage points between the featured series and the baseline. */
	type Gap = { year: number; x: number; points: number; label: string; height: number };

	let gaps = $derived.by<Gap[]>(() => {
		const featuredRows = data.filter((d) => d.group === featured);
		const baselineRows = data.filter((d) => d.group === baseline);
		if (!featuredRows.length || !baselineRows.length) return [];

		const raw = years
			.map((year) => {
				const a = featuredRows.find((d) => d.year === year);
				const b = baselineRows.find((d) => d.year === year);
				if (!a || !b) return null;
				const points = (a.rate - b.rate) * 100;
				return { year, x: xOf(year), points, label: `${ppFormat(points)} pp`, height: 0 };
			})
			.filter((d) => d !== null);

		const max = d3.max(raw, (d) => Math.abs(d.points)) ?? 1;
		// Leave headroom so the tallest bar's label stays inside the panel.
		const scale = d3.scaleLinear().domain([0, max * 1.45]).range([0, bottomHeight]);

		return raw.map((d) => ({ ...d, height: scale(Math.abs(d.points)) }));
	});

	function visible(series: Series) {
		return series.isFeatured ? shows(1) : true;
	}

	function dimmed(series: Series) {
		return highlight !== null && highlight !== series.group;
	}

	/** Both series can end close together; their labels get pushed apart. */
	const END_LABEL_GAP = 46;

	let endLabelY = $derived(
		separateLabels(
			groups.map((series) => ({ key: series.group, y: series.last.y })),
			END_LABEL_GAP,
			Tokens.fontSize.lg,
			topHeight - Tokens.fontSize.lg
		)
	);

	/** Step reveal and highlight dimming resolve to a single opacity. */
	function seriesOpacity(series: Series) {
		if (!visible(series)) return 0;
		return dimmed(series) ? 0.2 : 1;
	}

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeYear = $derived(activeIndex === null ? null : years[activeIndex]);

	let tooltip = $derived.by(() => {
		if (activeYear === null) return null;

		const rows = groups
			.filter(visible)
			.map((series) => {
				const point = series.points.find((p) => p.year === activeYear);
				return point
					? {
							label: `Informalidade — ${series.group}`,
							value: point.label,
							color: series.color,
							emphasis: series.isFeatured
						}
					: null;
			})
			.filter((row) => row !== null)
			.sort((a, b) => Number(b.emphasis) - Number(a.emphasis));

		const gap = shows(2) ? gaps.find((g) => g.year === activeYear) : undefined;
		if (gap) {
			rows.push({
				label: 'Diferença',
				value: gap.label,
				color: theme.palette.neutral[200],
				emphasis: false
			});
		}

		return rows.length ? { title: String(activeYear), rows } : null;
	});

	/** Present at every width: direct labels shrink away, this does not. */
	let legend = $derived(
		groups
			.filter(visible)
			.map((series) => ({ label: series.group, color: series.color }))
			.reverse()
	);

	let table = $derived({
		caption: title ?? 'Taxa de informalidade por grupo e ano',
		columns: ['Ano', ...groups.map((s) => s.group), 'Diferença (pp)'],
		rows: years.map((year) => [
			year,
			...groups.map((s) => s.points.find((p) => p.year === year)?.label ?? '—'),
			gaps.find((g) => g.year === year)?.label ?? '—'
		])
	});

	function labelled(series: Series, index: number) {
		if (valueLabels === 'all') return true;
		return (
			index === 0 ||
			index === series.points.length - 1 ||
			(activeYear !== null && series.points[index].year === activeYear)
		);
	}

	function gapLabelled(gap: Gap, index: number) {
		if (valueLabels === 'all') return true;
		return index === gaps.length - 1 || gap.year === activeYear;
	}
</script>

<ChartShell
	{theme}
	{width}
	bind:measuredWidth={shellWidth}
	{height}
	margin={{ top: margin.top, right: margin.right, bottom: margin.bottom, left: margin.left }}
	{title}
	{subtitle}
	{source}
	{hover}
	{tooltip}
	{legend}
	{table}
	ariaLabel={title ?? 'Taxa de informalidade na Economia Criativa e no Brasil'}
>
	{#snippet children({ container })}
		{#if groups.length && plotWidth > 0}
			<GridColumns scale={xScale} height={topHeight} numTicks={years.length} />

			{#each groups as series (series.group)}
				{@const labelY = endLabelY.get(series.group) ?? series.last.y}
				<g class="fade" style:opacity={seriesOpacity(series)}>
					<LinePath
						data={series.points}
						x={(d) => d.x}
						y={(d) => d.y}
						stroke={series.color}
					/>

					{#each series.points as point (point.year)}
						{@const isActive = point.year === activeYear}
						<Circle
							x={point.x}
							y={point.y}
							size={isActive ? 8 : undefined}
							fill={series.markerColor}
							stroke={isActive ? theme.palette.base[100] : undefined}
							strokeWidth={isActive ? 2 : undefined}
						/>
					{/each}

					{#each series.points as point, i (point.year)}
						{#if labelled(series, i)}
							{@const isLast = i === series.points.length - 1}
							<Text
								dx={isLast ? point.x + Tokens.spacing.md : point.x}
								dy={isLast ? labelY - 2 : point.y - Tokens.spacing.md}
								text={point.label}
								fontSize={isLast ? Tokens.fontSize.lg : Tokens.fontSize.sm}
								fontWeight={isLast ? Tokens.fontWeight.bold : Tokens.fontWeight.medium}
								textAnchor={isLast ? 'start' : 'middle'}
								verticalAnchor="end"
								fill={series.isFeatured ? series.color : undefined}
							/>
						{/if}
					{/each}

					<Text
						dx={series.last.x + Tokens.spacing.md}
						dy={labelY + Tokens.spacing.sm}
						width={margin.right - Tokens.spacing.md}
						verticalAnchor="start"
						textAnchor="start"
						text={series.group}
						fontSize={Tokens.fontSize[margin.compact ? 'sm' : 'md']}
						fontWeight={series.isFeatured
							? Tokens.fontWeight.semibold
							: Tokens.fontWeight.medium}
						fill={series.isFeatured ? series.color : undefined}
					/>
				</g>
			{/each}

			<g class="fade" style:opacity={shows(2) ? 1 : 0}>
				<Text
					dx={-margin.left}
					dy={topHeight + AXES_GAP / 2}
					text="A taxa de informalidade na Economia Criativa superou a média do Brasil em..."
					verticalAnchor="middle"
					fill={theme.palette.neutral[100]}
					fontSize={Tokens.fontSize.sm}
				/>

				<Group id="diferenca" top={topHeight + AXES_GAP}>
					<GridColumns scale={xScale} height={bottomHeight} numTicks={years.length} />

					{#each gaps as gap, i (gap.year)}
						{@const isActive = gap.year === activeYear}
						{@const y = bottomHeight - gap.height}
						<rect
							x={gap.x - Tokens.strokeWidth.xs / 2}
							{y}
							width={Tokens.strokeWidth.xs}
							height={gap.height}
							fill={isActive ? theme.palette.neutral[300] : theme.palette.neutral[200]}
							rx={2}
						/>

						{#if gapLabelled(gap, i)}
							{@const isLast = i === gaps.length - 1}
							<Text
								dx={gap.x}
								dy={y - 4}
								text={isLast && !margin.compact
									? `${gap.label.replace(' pp', '')} pontos percentuais (pp)`
									: gap.label}
								fontSize={Tokens.fontSize.xs}
								fontWeight={Tokens.fontWeight.medium}
								fill={theme.palette.neutral[200]}
								textAnchor="middle"
								verticalAnchor="end"
								width={margin.right + 60}
							/>
						{/if}
					{/each}
				</Group>
			</g>

			<Axis orientation="bottom" scale={xScale} top={plotHeight} numTicks={years.length} />

			{#if interactive}
				{#if activeYear !== null}
					<Crosshair x={xOf(activeYear)} height={plotHeight} visible />
				{/if}
				<HoverLayer
					{hover}
					{container}
					positions={years.map(xOf)}
					labels={years.map((year) => String(year))}
					width={plotWidth}
					height={plotHeight}
					ariaLabel="Explorar a taxa de informalidade por ano"
				/>
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
