<script lang="ts">
	/**
	 * Linha com participação: uma série absoluta e, logo abaixo, a participação
	 * dela num total.
	 *
	 * Two stacked panels sharing one x axis: the absolute series on top, the
	 * share below as proportional-area bubbles. They are separate panels, not a
	 * second y scale on the same plot — the two measures never share an axis.
	 */
	import * as d3 from 'd3';
	import Group from '$lib/core/components/Group.svelte';
	import Text from '$lib/core/components/Text.svelte';
	import LabelMask from '$lib/core/components/annotation/LabelMask.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import LinePath from '$lib/core/components/shape/LinePath.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import Circle from '$lib/core/components/markers/Circle.svelte';
	import HoverLayer from '$lib/core/components/interaction/HoverLayer.svelte';
	import Crosshair from '$lib/core/components/interaction/Crosshair.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber, formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { LinhaParticipacaoDatum } from './data.js';
	import { createBreakScale, paddedExtent, responsiveMargin } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: LinhaParticipacaoDatum[];
			/** First year after a methodological break; omit for an unbroken series. */
			breakYear?: number;
			/**
			 * `selective` labels the first, last and hovered years — every other
			 * value stays in the tooltip and the table. `all` restores a number on
			 * every point.
			 */
			valueLabels?: 'selective' | 'all';
			/** Name of the series, written at the line's end and matched by `highlight`. */
			seriesLabel?: string;
			/** What the top panel counts — tooltip, table and screen-reader copy. */
			valueLabel?: string;
			/** What the bubble share is a share of, in the tooltip. */
			shareLabel?: string;
			/** Sentence introducing the share panel; omitted when not given. */
			shareIntro?: string;
			/** Words after the last bubble's percentage, when there is room. */
			shareSuffix?: string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		data,
		width,
		height = 320,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		breakYear,
		valueLabels = 'selective',
		seriesLabel,
		valueLabel = 'Valor',
		shareLabel = 'Participação no total',
		shareIntro,
		shareSuffix = 'do total',
		pillarId = 6
	}: Props = $props();

	const theme = $derived(getPillarTheme(pillarId));
	const pctFormat = formatLocale.format('.2%');

	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;

	// The shell measures, the chart sizes its margins from that measurement.
	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let margin = $derived(responsiveMargin(shellWidth));
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	let series = $derived([...data].sort((a, b) => a.year - b.year));
	let years = $derived(series.map((d) => d.year));

	let xScale = $derived(createBreakScale(years, plotWidth, { breakYear }));

	// Panel split: the absolute series carries the story, the share panel is a
	// supporting strip beneath it.
	const AXES_GAP = 28;
	let usableHeight = $derived(
		Math.max(0, height - margin.top - margin.bottom - AXES_GAP)
	);
	let topHeight = $derived(usableHeight * 0.74);
	let bottomHeight = $derived(usableHeight - topHeight);

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain(paddedExtent(series.map((d) => d.value)))
			.range([topHeight, 0])
	);

	// Bubble radius encodes share by area, never by radius.
	let areaScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(series, (d) => d.share) as [number, number])
			.range([150, 620])
	);

	let fillScale = $derived(
		d3
			.scaleSequential()
			.domain(d3.extent(series, (d) => d.share) as [number, number])
			.interpolator(d3.interpolateLab(theme.palette.primary, theme.palette.primaryVariant))
	);

	type Point = LinhaParticipacaoDatum & {
		x: number;
		y: number;
		r: number;
		fill: string;
		valueText: string;
		shareLabel: string;
	};

	let points = $derived<Point[]>(
		series.map((d) => ({
			...d,
			x: xScale.x(d.year),
			y: yScale(d.value),
			r: Math.sqrt(areaScale(d.share) / Math.PI),
			fill: fillScale(d.share),
			valueText: formatCompactNumber(d.value, 1),
			shareLabel: pctFormat(d.share)
		}))
	);

	let lastPoint = $derived(points.at(-1));
	let activeIndex = $derived(focusIndex ?? hover.index);
	let activePoint = $derived(activeIndex === null ? null : points[activeIndex]);

	/** Dimmed when the host highlights another series. */
	let dimmed = $derived(highlight !== null && highlight !== (seriesLabel ?? null));

	function labelled(index: number) {
		if (valueLabels === 'all') return true;
		return index === 0 || index === points.length - 1 || index === activeIndex;
	}

	let tooltip = $derived(
		activePoint
			? {
					title: String(activePoint.year),
					rows: [
						{
							label: seriesLabel ? `${valueLabel} — ${seriesLabel}` : valueLabel,
							value: activePoint.valueText,
							color: theme.palette.primary,
							emphasis: true
						},
						{
							label: shareLabel,
							value: activePoint.shareLabel,
							color: activePoint.fill
						}
					]
				}
			: null
	);

	let table = $derived({
		caption: title ?? `${valueLabel} por ano`,
		columns: ['Ano', valueLabel, shareLabel],
		rows: points.map((d) => [d.year, d.value.toLocaleString('pt-BR'), d.shareLabel])
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
	{table}
	ariaLabel={title ?? `${valueLabel} por ano`}
>
	{#snippet children({ container })}
		{#if points.length && plotWidth > 0}
			<g id="postos-de-trabalho" class="fade" style:opacity={dimmed ? 0.25 : 1}>
				<GridColumns scale={xScale.pre} height={topHeight} numTicks={xScale.preYears.length} />
				<GridColumns
					scale={xScale.post}
					height={topHeight}
					numTicks={xScale.postYears.length}
				/>

				<!-- Methodological break: the segments are drawn apart and the join is dashed,
				     so no one reads the jump as real change. -->
				<g class="fade" style:opacity={shows(2) ? 1 : 0}>
					<LinePath
						data={points.filter((d) => breakYear !== undefined && (d.year === breakYear - 1 || d.year === breakYear))}
						strokeOpacity={0.3}
						strokeWidth={8}
						stroke-dasharray="8,12"
					/>
				</g>

				<LinePath data={points.filter((d) => xScale.isPre(d.year))} />
				<LinePath data={points.filter((d) => !xScale.isPre(d.year))} />

				{#each points as d, i (d.year)}
					{@const isLast = i === points.length - 1}
					{@const isActive = i === activeIndex}
					<Circle
						x={d.x}
						y={d.y}
						size={isActive ? 9 : isLast ? 8 : undefined}
						fill={isLast || isActive ? theme.palette.accent : undefined}
						stroke={isActive ? theme.palette.base[100] : undefined}
						strokeWidth={isActive ? 2 : undefined}
					/>
				{/each}

				<g class="fade" style:opacity={shows(1) ? 1 : 0}>
					{#each points as d, i (d.year)}
						{#if labelled(i)}
							{@const isLast = i === points.length - 1}
							<LabelMask>
								<Text
									dx={d.x + (isLast ? Tokens.spacing.lg : 0)}
									dy={d.y - Tokens.spacing[isLast ? 'sm' : 'md']}
									text={d.valueText}
									fontSize={Tokens.fontSize[isLast ? 'lg' : 'sm']}
									fontWeight={Tokens.fontWeight[isLast ? 'bold' : 'medium']}
									textAnchor={isLast ? 'start' : 'middle'}
									fill={isLast ? theme.palette.accent : undefined}
								/>
							</LabelMask>
						{/if}
					{/each}
				</g>

				{#if lastPoint && seriesLabel}
					<g class="fade" style:opacity={shows(4) ? 1 : 0}>
						<Text
							dx={lastPoint.x + Tokens.spacing.lg}
							dy={lastPoint.y}
							width={margin.right - Tokens.spacing.md}
							verticalAnchor="start"
							text={seriesLabel}
							fontSize={Tokens.fontSize.md}
							fontWeight={500}
							textAnchor="start"
						/>
					</g>
				{/if}
			</g>

			<g class="fade" style:opacity={shows(3) ? 1 : 0}>
				{#if shareIntro}
					<Text
						dx={-margin.left}
						dy={topHeight + AXES_GAP / 2}
						text={shareIntro}
						verticalAnchor="middle"
						fill={theme.palette.neutral[200]}
						fontSize={Tokens.fontSize.sm}
					/>
				{/if}

				<Group id="participacao" top={topHeight + AXES_GAP}>
					<GridColumns
						scale={xScale.pre}
						height={bottomHeight}
						numTicks={xScale.preYears.length}
					/>
					<GridColumns
						scale={xScale.post}
						height={bottomHeight}
						numTicks={xScale.postYears.length}
					/>

					<Group top={bottomHeight * 0.6}>
						<Line
							from={{ x: xScale.gap.from }}
							to={{ x: xScale.gap.to }}
							stroke={theme.palette.primary}
							strokeOpacity={0.3}
							strokeWidth={Tokens.strokeWidth.sm}
							strokeDasharray="6,8"
							stroke-linecap="round"
						/>
						<Line
							from={{ x: 0 }}
							to={{ x: xScale.gap.from }}
							stroke={theme.palette.primary}
							strokeWidth={Tokens.strokeWidth.sm}
						/>
						<Line
							from={{ x: xScale.gap.to }}
							to={{ x: plotWidth }}
							stroke={theme.palette.primary}
							strokeWidth={Tokens.strokeWidth.sm}
						/>

						{#each points as d, i (d.year)}
							{@const isLast = i === points.length - 1}
							{@const isActive = i === activeIndex}
							<Group left={d.x}>
								<circle
									r={isActive ? d.r + 2 : d.r}
									fill={d.fill}
									stroke={isActive ? theme.palette.base[100] : 'none'}
									stroke-width={isActive ? 2 : 0}
								/>
								{#if labelled(i)}
									<!-- The last bubble spells out what the share means; the
									     narrow gutter only has room for the number. -->
									<LabelMask>
										<Text
											textAnchor={isLast ? 'start' : 'middle'}
											text={isLast && !margin.compact
												? `${d.shareLabel} ${shareSuffix}`
												: d.shareLabel}
											dx={isLast ? d.r + Tokens.spacing.md : 0}
											dy={isLast ? 0 : -(d.r + Tokens.spacing.sm)}
											fill={theme.palette.neutral[200]}
											fontSize={Tokens.fontSize.sm}
											fontWeight={Tokens.fontWeight.medium}
											width={margin.right - Tokens.spacing.md}
											verticalAnchor={isLast ? 'middle' : 'end'}
										/>
									</LabelMask>
								{/if}
							</Group>
						{/each}
					</Group>
				</Group>
			</g>

			<Group id="eixo-x">
				<Axis
					orientation="bottom"
					scale={xScale.pre}
					top={topHeight + AXES_GAP + bottomHeight}
					numTicks={xScale.preYears.length}
				/>
				<Axis
					orientation="bottom"
					scale={xScale.post}
					top={topHeight + AXES_GAP + bottomHeight}
					numTicks={xScale.postYears.length}
				/>
			</Group>

			{#if interactive}
				{#if activePoint}
					<Crosshair
						x={activePoint.x}
						height={topHeight + AXES_GAP + bottomHeight}
						visible
					/>
				{/if}
				<HoverLayer
					{hover}
					{container}
					positions={points.map((d) => d.x)}
					labels={points.map((d) => `${d.year}: ${valueLabel} ${d.valueText}, ${d.shareLabel} ${shareSuffix}`)}
					width={plotWidth}
					height={topHeight + AXES_GAP + bottomHeight}
					ariaLabel={`Explorar ${valueLabel.toLowerCase()} por ano`}
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
