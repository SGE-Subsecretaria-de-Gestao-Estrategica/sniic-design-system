<script lang="ts">
	/**
	 * Linhas em painéis: um painel por grupo, todos no mesmo eixo de anos e na
	 * mesma escala, com a série de referência repetida ao fundo de cada um.
	 *
	 * Small multiples instead of one tangle of lines: every group gets the
	 * family's thick round-capped line with its markers, the last point in
	 * the accent with its value beside it, and the reference — the country,
	 * say — as a pale line behind, so each panel reads as "this group against
	 * the whole" without a legend. One crosshair runs through every panel.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import GridColumns from '$lib/core/components/grid/GridColumns.svelte';
	import LinePath from '$lib/core/components/shape/LinePath.svelte';
	import HoverLayer from '$lib/core/components/interaction/HoverLayer.svelte';
	import Crosshair from '$lib/core/components/interaction/Crosshair.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { LinhasPainel } from './data.js';
	import { paddedExtent, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			years: number[];
			panels: LinhasPainel[];
			/** Background series repeated in every panel, in the order of `years`. */
			reference?: (number | null)[];
			referenceLabel?: string;
			formatValue?: (value: number) => string;
			/** Height of each panel's plot, in px. */
			panelHeight?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		years,
		panels,
		reference,
		referenceLabel = 'Referência',
		formatValue = (value: number) => formatLocale.format(',.1~f')(value),
		panelHeight = 56,
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

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	let gutter = $derived(compact ? 88 : 132);
	let valueSpace = $derived(compact ? 44 : 56);
	const AXIS_HEIGHT = 24;
	const PANEL_GAP = 18;
	let margin = $derived({ top: 8, right: valueSpace, bottom: AXIS_HEIGHT, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	/** Thinner than the full-size line: a panel is a fraction of the height. */
	let stroke = $derived(compact ? 5 : 6);
	let nameSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);

	/** A panel is as tall as its plot, or as its wrapped name and note. */
	function bandOf(panel: LinhasPainel) {
		const nameLines = wrappedLineCount(panel.label, gutter - Tokens.spacing.md);
		const textHeight = nameLines * nameSize * 1.1 + (panel.note ? Tokens.fontSize.xs * 1.3 : 0);
		return Math.max(panelHeight, textHeight) + PANEL_GAP;
	}

	let xScale = $derived(
		d3
			.scalePoint<number>()
			.domain(years)
			.range([0, plotWidth])
	);

	let yDomain = $derived(
		paddedExtent(
			[...panels.flatMap((p) => p.values), ...(reference ?? [])].filter(
				(v): v is number => v !== null
			),
			0.15
		)
	);

	type Pt = { year: number; value: number; x: number; y: number };

	/** Unbroken runs of measured years: a `null` breaks the line. */
	function runsOf(values: (number | null)[], y: d3.ScaleLinear<number, number>) {
		const runs: Pt[][] = [];
		let current: Pt[] = [];
		values.forEach((value, i) => {
			if (value === null || value === undefined) {
				if (current.length) runs.push(current);
				current = [];
				return;
			}
			current.push({ year: years[i], value, x: xScale(years[i]) ?? 0, y: y(value) });
		});
		if (current.length) runs.push(current);
		return runs;
	}

	let layout = $derived.by(() => {
		let cursor = 0;
		return panels.map((panel, index) => {
			const band = bandOf(panel);
			const top = cursor;
			cursor += band;
			const plotTop = top + (band - PANEL_GAP - panelHeight) / 2;
			const y = d3.scaleLinear().domain(yDomain).range([plotTop + panelHeight, plotTop]);
			const runs = runsOf(panel.values, y);
			const points = runs.flat();
			return {
				...panel,
				index,
				top,
				band,
				plotTop,
				runs,
				points,
				first: points[0],
				last: points.at(-1),
				referenceRuns: reference ? runsOf(reference, y) : []
			};
		});
	});

	let plotHeight = $derived(layout.reduce((sum, p) => sum + p.band, 0) - PANEL_GAP);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeYear = $derived(activeIndex === null ? null : years[activeIndex]);

	function panelOpacity(label: string) {
		return highlight !== null && highlight !== label ? 0.25 : 1;
	}

	let tooltip = $derived.by(() => {
		if (activeYear === null) return null;
		const i = years.indexOf(activeYear);
		const rows = shows(1)
			? panels
					.filter((p) => p.values[i] !== null && p.values[i] !== undefined)
					.map((p) => ({
						label: p.label,
						value: formatValue(p.values[i] as number),
						color: theme.palette.primary
					}))
			: [];
		const ref = reference?.[i];
		if (ref !== null && ref !== undefined) {
			rows.push({ label: referenceLabel, value: formatValue(ref), color: theme.palette.neutral[100] });
		}
		return rows.length ? { title: String(activeYear), rows } : null;
	});

	let legend = $derived(
		reference ? [{ label: referenceLabel, color: theme.palette.base[300] }] : []
	);

	let table = $derived({
		caption: title ?? 'Linhas em painéis',
		columns: ['', ...years.map(String)],
		rows: [
			...panels.map((p) => [p.label, ...p.values.map((v) => (v === null ? '—' : formatValue(v)))]),
			...(reference
				? [[referenceLabel, ...reference.map((v) => (v === null ? '—' : formatValue(v)))]]
				: [])
		]
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
	ariaLabel={title ?? 'Linhas em painéis'}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			<GridColumns scale={xScale} height={plotHeight} numTicks={years.length} />

			{#each layout as panel (panel.index)}
				<g class="fade" style:opacity={panelOpacity(panel.label)}>
					<Text
						dx={-Tokens.spacing.md}
						dy={panel.plotTop + panelHeight / 2}
						width={gutter - Tokens.spacing.md}
						text={panel.label}
						textAnchor="end"
						verticalAnchor={panel.note ? 'end' : 'middle'}
						fontSize={nameSize}
						fontWeight={Tokens.fontWeight.semibold}
						fill={theme.palette.neutral[300]}
					/>
					{#if panel.note}
						<Text
							dx={-Tokens.spacing.md}
							dy={panel.plotTop + panelHeight / 2 + 3}
							text={panel.note}
							textAnchor="end"
							verticalAnchor="start"
							fontSize={Tokens.fontSize.xs}
							fill={theme.palette.neutral[100]}
						/>
					{/if}

					{#each panel.referenceRuns as run, r (r)}
						<LinePath
							data={run}
							x={(d) => d.x}
							y={(d) => d.y}
							stroke={theme.palette.base[300]}
							strokeWidth={stroke}
						/>
					{/each}

					<g class="fade" style:opacity={shows(1) ? 1 : 0}>
						{#each panel.runs as run, r (r)}
							<LinePath data={run} x={(d) => d.x} y={(d) => d.y} strokeWidth={stroke} />
						{/each}
						{#each panel.points as point (point.year)}
							{@const isLast = point === panel.last}
							{@const isActive = point.year === activeYear}
							<circle
								cx={point.x}
								cy={point.y}
								r={isLast || isActive ? 4.5 : 2.5}
								fill={isLast ? theme.palette.accent : theme.palette.primaryVariant}
								stroke={isActive ? theme.palette.base[100] : 'none'}
								stroke-width={isActive ? 1.5 : 0}
							/>
						{/each}
					</g>

					<g class="fade" style:opacity={shows(2) ? 1 : 0}>
						{#if panel.first && panel.first !== panel.last}
							<Text
								dx={panel.first.x}
								dy={panel.first.y - Tokens.spacing.sm}
								text={formatValue(panel.first.value)}
								textAnchor="start"
								verticalAnchor="end"
								fontSize={Tokens.fontSize.xs}
								fill={theme.palette.neutral[200]}
							/>
						{/if}
						{#if panel.last}
							<Text
								dx={panel.last.x + Tokens.spacing.md}
								dy={panel.last.y}
								text={formatValue(panel.last.value)}
								textAnchor="start"
								verticalAnchor="middle"
								fontSize={nameSize}
								fontWeight={Tokens.fontWeight.bold}
								fill={theme.palette.accent}
							/>
						{/if}
					</g>
				</g>
			{/each}

			<Axis orientation="bottom" scale={xScale} top={plotHeight} numTicks={years.length} />

			{#if interactive}
				{#if activeYear !== null}
					<Crosshair x={xScale(activeYear) ?? 0} height={plotHeight} visible />
				{/if}
				<HoverLayer
					{hover}
					{container}
					positions={years.map((year) => xScale(year) ?? 0)}
					labels={years.map(String)}
					width={plotWidth}
					height={plotHeight}
					ariaLabel="Explorar os painéis por ano"
				/>
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
