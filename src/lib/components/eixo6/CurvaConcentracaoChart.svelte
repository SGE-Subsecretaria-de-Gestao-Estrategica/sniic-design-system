<script lang="ts">
	/**
	 * Curva de concentração (Lorenz): quanto do total se acumula conforme se
	 * percorrem as unidades, da que menos tem à que mais tem.
	 *
	 * The curve is the family's thick round-capped line; the diagonal of
	 * perfect equality is a thin dashed reference; the gap between them — the
	 * concentration itself — is a pale wash of the line's colour. Each reading
	 * ("the top 10% hold 59%") is a marker on the curve in the accent with its
	 * sentence beside it: the sentence, not a bare number, because the value
	 * of a mark is what lies between it and the top, not the point's height.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import LabelMask from '$lib/core/components/annotation/LabelMask.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import LinePath from '$lib/core/components/shape/LinePath.svelte';
	import HoverLayer from '$lib/core/components/interaction/HoverLayer.svelte';
	import Crosshair from '$lib/core/components/interaction/Crosshair.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { CurvaConcentracaoMarco, CurvaConcentracaoPonto } from './data.js';
	import { separateLabels } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** Cumulative points, both coordinates in 0–100, from (0, 0) to (100, 100). */
			points: CurvaConcentracaoPonto[];
			marks?: CurvaConcentracaoMarco[];
			/** Names of the axes and of the dashed diagonal. */
			xLabel?: string;
			yLabel?: string;
			diagonalLabel?: string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		points,
		marks = [],
		xLabel = '% das unidades, da menor à maior',
		yLabel = '% do total acumulado',
		diagonalLabel = 'Igualdade: todas as unidades com o mesmo valor',
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		focusIndex = null,
		interactive = true,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();
	const shows = (stage: number) => step < 0 || step >= stage;
	const pct = formatLocale.format(',.1~f');

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	let margin = $derived({ top: 12, right: 12, bottom: 44, left: 44 });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	/** Square when it can be: equal axes are what make the diagonal 45°. */
	let plotHeight = $derived(Math.min(plotWidth, compact ? 280 : 340));
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let x = $derived(d3.scaleLinear().domain([0, 100]).range([0, plotWidth]));
	let y = $derived(d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]));

	let sorted = $derived([...points].sort((a, b) => a[0] - b[0]));
	let curve = $derived(sorted.map(([u, t]) => ({ u, t, x: x(u), y: y(t) })));

	/** The gap between curve and diagonal, closed along the diagonal. */
	let gapPath = $derived.by(() => {
		if (curve.length < 2) return '';
		const along = curve.map((p) => `${p.x},${p.y}`).join(' L');
		const back = [...curve].reverse().map((p) => `${p.x},${y(p.u)}`).join(' L');
		return `M${along} L${back} Z`;
	});

	/** Height of the curve at a given % of units, interpolated. */
	function curveAt(u: number) {
		const i = d3.bisector((p: (typeof curve)[number]) => p.u).left(curve, u);
		const a = curve[Math.max(0, i - 1)];
		const b = curve[Math.min(curve.length - 1, i)];
		if (!a || !b || a.u === b.u) return (b ?? a)?.t ?? 0;
		return a.t + ((u - a.u) / (b.u - a.u)) * (b.t - a.t);
	}

	let markPoints = $derived(
		marks.map((m, i) => {
			const u = 100 - m.top;
			return { ...m, key: String(i), x: x(u), y: y(curveAt(u)) };
		})
	);

	/** Sentences sit left of their markers, pushed apart when they would collide. */
	let markLabelY = $derived(
		separateLabels(
			markPoints.map((m) => ({ key: m.key, y: m.y })),
			Tokens.fontSize.sm * 2.6,
			0,
			plotHeight
		)
	);
	let markLabelWidth = $derived(Math.min(compact ? 130 : 180, plotWidth * 0.5));

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activePoint = $derived(activeIndex === null ? null : curve[activeIndex]);

	let tooltip = $derived(
		activePoint && shows(1)
			? {
					title: `${pct(activePoint.u)}% das unidades`,
					rows: [
						{
							label: 'do total acumulado',
							value: `${pct(activePoint.t)}%`,
							color: theme.palette.primary,
							emphasis: true
						}
					]
				}
			: null
	);

	let table = $derived({
		caption: title ?? 'Curva de concentração',
		columns: [xLabel, yLabel],
		rows: curve.map((p) => [`${pct(p.u)}%`, `${pct(p.t)}%`])
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
	ariaLabel={title ?? 'Curva de concentração'}
>
	{#snippet children({ container })}
		{#if curve.length && plotWidth > 0}
			<Axis
				orientation="bottom"
				scale={x}
				top={plotHeight}
				numTicks={5}
				tickFormat={(v) => `${v}%`}
			/>
			<Axis orientation="left" scale={y} numTicks={5} tickFormat={(v) => `${v}%`} />
			<Text
				dx={plotWidth}
				dy={plotHeight + 30}
				text={xLabel}
				textAnchor="end"
				verticalAnchor="start"
				fontSize={Tokens.fontSize.sm}
				fill={theme.palette.neutral[100]}
			/>
			<Text
				dx={4}
				dy={0}
				text={yLabel}
				textAnchor="start"
				verticalAnchor="start"
				fontSize={Tokens.fontSize.sm}
				fill={theme.palette.neutral[100]}
			/>

			<!-- Equality: the diagonal every unequal curve sags beneath. -->
			<line
				x1={x(0)}
				y1={y(0)}
				x2={x(100)}
				y2={y(100)}
				stroke={theme.palette.neutral[100]}
				stroke-width={Tokens.strokeWidth.sm}
				stroke-dasharray="4,5"
			/>
			<LabelMask>
				<Text
					dx={x(50) - 6}
					dy={y(50) - 6}
					width={markLabelWidth}
					text={diagonalLabel}
					textAnchor="end"
					verticalAnchor="end"
					angle={0}
					fontSize={Tokens.fontSize.xs}
					fill={theme.palette.neutral[100]}
				/>
			</LabelMask>

			<g class="fade" style:opacity={shows(1) ? 1 : 0}>
				<path d={gapPath} fill={theme.palette.primary} fill-opacity={0.16} />
				<LinePath data={curve} x={(d) => d.x} y={(d) => d.y} strokeWidth={compact ? 6 : 8} curve={d3.curveMonotoneX} />
			</g>

			<g class="fade" style:opacity={shows(2) ? 1 : 0}>
				{#each markPoints as m (m.key)}
					{@const labelY = markLabelY.get(m.key) ?? m.y}
					<circle cx={m.x} cy={m.y} r={6} fill={theme.palette.accent} />
					<line
						x1={m.x - 8}
						y1={m.y}
						x2={m.x - 18}
						y2={labelY}
						stroke={theme.palette.accent}
						stroke-opacity={0.5}
					/>
					<LabelMask>
						<Text
							dx={m.x - 22}
							dy={labelY}
							width={markLabelWidth}
							text={m.label}
							textAnchor="end"
							verticalAnchor="middle"
							fontSize={Tokens.fontSize.sm}
							fontWeight={Tokens.fontWeight.semibold}
							fill={theme.palette.neutral[300]}
						/>
					</LabelMask>
				{/each}
			</g>

			{#if interactive}
				{#if activePoint && shows(1)}
					<Crosshair x={activePoint.x} height={plotHeight} visible />
					<circle cx={activePoint.x} cy={activePoint.y} r={5} fill={theme.palette.primaryVariant} stroke={theme.palette.base[100]} stroke-width={1.5} />
				{/if}
				<HoverLayer
					{hover}
					{container}
					positions={curve.map((p) => p.x)}
					labels={curve.map((p) => `${pct(p.u)}%`)}
					width={plotWidth}
					height={plotHeight}
					ariaLabel="Explorar a curva de concentração"
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
