<script lang="ts">
	/**
	 * Postos de trabalho na Economia Criativa comparados a outros setores.
	 *
	 * Four series on one y scale. Identity comes from a direct label at each
	 * line's end, so colour only has to separate the highlighted sector from
	 * the rest — no eight-hue rotation for four lines that already carry names.
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
	import { formatCompactNumber } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import { SETOR_DESTAQUE } from './steps.js';
	import { RAIS_BREAK_YEAR, type SetorAnoDatum } from './data.js';
	import {
		createBreakScale,
		paddedExtent,
		responsiveMargin,
		separateLabels
	} from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: SetorAnoDatum[];
			breakYear?: number;
			/** Sector drawn in the emphasis colour and revealed on the first step. */
			featured?: string;
			valueLabels?: 'selective' | 'all';
		};

	let {
		data,
		width,
		height = 300,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		breakYear = RAIS_BREAK_YEAR,
		featured = SETOR_DESTAQUE,
		valueLabels = 'selective'
	}: Props = $props();

	const theme = getPillarTheme(6);
	const hover = new HoverState();

	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let margin = $derived(responsiveMargin(shellWidth));
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let plotHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	let years = $derived([...new Set(data.map((d) => d.year))].sort((a, b) => a - b));
	let xScale = $derived(createBreakScale(years, plotWidth, { breakYear }));

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain(paddedExtent(data.map((d) => d.workers)))
			.range([plotHeight, 0])
	);

	type Point = SetorAnoDatum & { x: number; y: number; label: string };
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
					.map((d) => ({
						...d,
						x: xScale.x(d.year),
						y: yScale(d.workers),
						label: formatCompactNumber(d.workers, d.workers >= 1e6 ? 1 : 0)
					}));

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
			// The featured sector paints last so it sits above the others.
			.sort((a, b) => Number(a.isFeatured) - Number(b.isFeatured))
	);

	/**
	 * Vertical slot for each series' end label. Four sectors can finish within a
	 * few pixels of each other, so the blocks are pushed apart rather than left
	 * to overlap; a leader line covers the displacement.
	 */
	const END_LABEL_GAP = 52;
	/** Compact labels are the name alone, which can still wrap to two lines. */
	const COMPACT_LABEL_GAP = 30;

	let endLabelY = $derived(
		separateLabels(
			groups.map((series) => ({ key: series.group, y: series.last.y })),
			margin.compact ? COMPACT_LABEL_GAP : END_LABEL_GAP,
			Tokens.fontSize.lg,
			plotHeight - Tokens.fontSize.lg
		)
	);

	/** Visible on the current step: the featured series leads, the rest follow. */
	function visible(series: Series) {
		return series.isFeatured || shows(1);
	}

	function dimmed(series: Series) {
		return highlight !== null && highlight !== series.group;
	}

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
							label: series.group,
							value: point.label,
							color: series.color,
							emphasis: series.isFeatured
						}
					: null;
			})
			.filter((row) => row !== null)
			.sort((a, b) => Number(b.emphasis) - Number(a.emphasis));

		return rows.length ? { title: String(activeYear), rows } : null;
	});

	/**
	 * Two keys, not four. The pillar palette affords three hues that survive
	 * colourblind vision, and this chart has four series, so colour separates
	 * the subject from its comparison set and the end labels carry the names.
	 * A key per sector would promise a distinction the colours do not make.
	 */
	let legend = $derived.by(() => {
		const featuredSeries = groups.find((series) => series.isFeatured);
		const rest = groups.filter((series) => !series.isFeatured && visible(series));

		return [
			...(featuredSeries && visible(featuredSeries)
				? [{ label: featuredSeries.group, color: featuredSeries.color }]
				: []),
			...(rest.length
				? [{ label: 'Outros setores (nomeados no gráfico)', color: rest[0].color }]
				: [])
		];
	});

	let table = $derived({
		caption: title ?? 'Postos de trabalho por setor e ano',
		columns: ['Ano', ...groups.map((s) => s.group)],
		rows: years.map((year) => [
			year,
			...groups.map(
				(s) => s.points.find((p) => p.year === year)?.workers.toLocaleString('pt-BR') ?? '—'
			)
		])
	});
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
	ariaLabel={title ?? 'Postos de trabalho na Economia Criativa e em outros setores'}
>
	{#snippet children({ container })}
		{#if groups.length && plotWidth > 0}
			<GridColumns scale={xScale.pre} height={plotHeight} numTicks={xScale.preYears.length} />
			<GridColumns scale={xScale.post} height={plotHeight} numTicks={xScale.postYears.length} />

			{#each groups as series (series.group)}
				{@const labelY = endLabelY.get(series.group) ?? series.last.y}
				<g class="fade" style:opacity={seriesOpacity(series)}>
					<!-- RAIS break: dashed, low-contrast join so the reader does not
					     read the discontinuity as a real movement. -->
					<g class="fade" style:opacity={shows(2) ? 1 : 0}>
						<LinePath
							data={series.points.filter(
								(d) => d.year === breakYear - 1 || d.year === breakYear
							)}
							x={(d) => d.x}
							y={(d) => d.y}
							stroke={series.color}
							strokeOpacity={0.3}
							strokeWidth={8}
							stroke-dasharray="8,12"
						/>
					</g>

					<LinePath
						data={series.points.filter((d) => xScale.isPre(d.year))}
						x={(d) => d.x}
						y={(d) => d.y}
						stroke={series.color}
					/>
					<LinePath
						data={series.points.filter((d) => !xScale.isPre(d.year))}
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

					<!-- Hovered year only by default: every other value lives in the
					     tooltip and the table, so the plot never carries a number per
					     point. `valueLabels="all"` restores the dense labelling. -->
					{#each series.points as point (point.year)}
						{#if (valueLabels === 'all' || point.year === activeYear) && point.year !== series.last.year}
							<Text
								dx={point.x}
								dy={point.y - Tokens.spacing.md}
								text={point.label}
								fontSize={Tokens.fontSize.sm}
								fontWeight={Tokens.fontWeight.medium}
								textAnchor="middle"
								verticalAnchor="end"
								fill={series.isFeatured ? series.color : undefined}
							/>
						{/if}
					{/each}

					<!-- End label in the right gutter. Wide: value over name. Narrow:
					     the name alone — identity must survive, and the value is a hover
					     and a table row away. -->
					<g class="fade" style:opacity={shows(3) ? 1 : 0}>
						{#if Math.abs(labelY - series.last.y) > 6}
							<line
								x1={series.last.x + 4}
								y1={series.last.y}
								x2={series.last.x + Tokens.spacing.md - 2}
								y2={labelY}
								stroke={series.color}
								stroke-width="1"
								stroke-opacity="0.5"
							/>
						{/if}

						{#if !margin.compact}
							<Text
								dx={series.last.x + Tokens.spacing.md}
								dy={labelY - 2}
								text={series.last.label}
								fontSize={Tokens.fontSize.lg}
								fontWeight={Tokens.fontWeight.bold}
								textAnchor="start"
								verticalAnchor="end"
								fill={series.isFeatured ? series.color : undefined}
							/>
						{/if}

						<Text
							text={series.group}
							dx={series.last.x + Tokens.spacing.md}
							dy={margin.compact ? labelY : labelY + 2}
							width={margin.right - Tokens.spacing.md}
							textAnchor="start"
							verticalAnchor={margin.compact ? 'middle' : 'start'}
							fontSize={Tokens.fontSize[margin.compact ? 'sm' : 'md']}
							fill={series.isFeatured ? series.color : undefined}
							fontWeight={series.isFeatured
								? Tokens.fontWeight.semibold
								: Tokens.fontWeight.medium}
						/>
					</g>
				</g>
			{/each}

			<Group id="eixo-x">
				<Axis
					orientation="bottom"
					scale={xScale.pre}
					top={plotHeight}
					numTicks={xScale.preYears.length}
				/>
				<Axis
					orientation="bottom"
					scale={xScale.post}
					top={plotHeight}
					numTicks={xScale.postYears.length}
				/>
			</Group>

			{#if interactive}
				{#if activeYear !== null}
					<Crosshair x={xScale.x(activeYear)} height={plotHeight} visible />
				{/if}
				<HoverLayer
					{hover}
					{container}
					positions={years.map((year) => xScale.x(year))}
					labels={years.map((year) => String(year))}
					width={plotWidth}
					height={plotHeight}
					ariaLabel="Explorar postos de trabalho por setor e ano"
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
