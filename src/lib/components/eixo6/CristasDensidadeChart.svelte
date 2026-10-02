<script lang="ts">
	/**
	 * Cristas de densidade: a forma da distribuição de cada grupo, uma sob a
	 * outra, partidas por uma referência.
	 *
	 * Each ridge is the family's line — a thick round-capped outline — over a
	 * pale wash of the pillar's colour; past the reference, the wash deepens
	 * to the emphasis colour, so "how much of this group clears the line" is
	 * an area you can see before you read the number at the ridge's end. The
	 * densities share one vertical scale, so peakedness compares; every ridge
	 * is normalised to the same area, so what compares is shape, not size.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import Axis from '$lib/core/components/axis/Axis.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import ChartShell from './ChartShell.svelte';
	import type { CristaDensidade } from './data.js';
	import { sequentialRamp, wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			ridges: CristaDensidade[];
			/** The grid every `density` is sampled on runs from 0 to `xMax`. */
			xMax: number;
			/** The vertical line that splits each ridge — a target, a mean. */
			reference: number;
			referenceLabel?: string;
			formatX?: (value: number) => string;
			/** Height of a ridge's row; the peak may rise past it into the row above. */
			ridgeHeight?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		ridges,
		xMax,
		reference,
		referenceLabel = 'Referência',
		formatX = (value: number) => String(value),
		ridgeHeight = 44,
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
	const uid = $props.id();

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	const HEADER = 22;
	const AXIS_HEIGHT = 24;
	/** How far a peak may climb into the row above. */
	const OVERLAP = 0.6;
	let gutter = $derived(compact ? 88 : 130);
	let valueSpace = $derived(compact ? 44 : 56);
	let margin = $derived({ top: 4, right: valueSpace, bottom: AXIS_HEIGHT, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let nameSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);

	let x = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotWidth]));
	let peak = $derived(d3.max(ridges.flatMap((r) => r.density)) || 1);
	/** Peak height in px: the row plus the overlap into the one above. */
	let rise = $derived(ridgeHeight * (1 + OVERLAP));

	let [wash, deep] = $derived([
		sequentialRamp(theme.palette, 5)[0],
		theme.palette.primaryVariant
	]);

	let layout = $derived.by(() => {
		let cursor = HEADER + ridgeHeight * OVERLAP;
		return ridges.map((ridge, index) => {
			const nameLines = wrappedLineCount(ridge.label, gutter - Tokens.spacing.md);
			const textHeight = nameLines * nameSize * 1.1 + (ridge.note ? Tokens.fontSize.xs * 1.3 : 0);
			const band = Math.max(ridgeHeight, textHeight + 6);
			const base = cursor + band;
			cursor += band;
			const n = ridge.density.length;
			const points = ridge.density.map((d, i) => ({
				x: x((i / Math.max(1, n - 1)) * xMax),
				y: base - (d / peak) * rise
			}));
			const area = d3
				.area<{ x: number; y: number }>()
				.x((p) => p.x)
				.y0(base)
				.y1((p) => p.y)
				.curve(d3.curveBasis)(points);
			const line = d3
				.line<{ x: number; y: number }>()
				.x((p) => p.x)
				.y((p) => p.y)
				.curve(d3.curveBasis)(points);
			return { ...ridge, index, base, band, top: base - band, area: area ?? '', line: line ?? '' };
		});
	});

	let plotHeight = $derived(layout.at(-1)?.base ?? 0);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);
	let refX = $derived(x(reference));

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRidge = $derived(activeIndex === null ? null : layout[activeIndex]);

	function ridgeOpacity(label: string) {
		return highlight !== null && highlight !== label ? 0.25 : 1;
	}

	let tooltip = $derived(
		activeRidge
			? {
					title: activeRidge.label,
					rows: [
						...(activeRidge.value
							? [{ label: `Além de ${formatX(reference)}`, value: activeRidge.value, color: deep, emphasis: true }]
							: []),
						...(activeRidge.note ? [{ label: 'Base', value: activeRidge.note }] : [])
					]
				}
			: null
	);

	let legend = $derived(
		shows(1) ? [{ label: referenceLabel, color: theme.palette.neutral[400] }] : []
	);

	let table = $derived({
		caption: title ?? 'Cristas de densidade',
		columns: ['Grupo', `Além de ${formatX(reference)}`, 'Base'],
		rows: ridges.map((r) => [r.label, r.value ?? '—', r.note ?? '—'])
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
	ariaLabel={title ?? 'Cristas de densidade'}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			<defs>
				<!-- Everything right of the reference: where the wash deepens. -->
				<clipPath id="{uid}-past">
					<rect x={refX} y={-rise} width={Math.max(0, plotWidth - refX)} height={plotHeight + rise * 2} />
				</clipPath>
			</defs>

			<!-- Drawn top to bottom, so each ridge's peak overlaps the row above it. -->
			{#each layout as ridge (ridge.index)}
				<g class="fade" style:opacity={ridgeOpacity(ridge.label)}>
					<path d={ridge.area} fill={wash} />
					<g class="fade" style:opacity={shows(1) ? 1 : 0}>
						<path d={ridge.area} fill={deep} fill-opacity={0.75} clip-path="url(#{uid}-past)" />
					</g>
					<path d={ridge.line} fill="none" stroke={theme.palette.primary} stroke-width={compact ? 2.5 : 3} stroke-linecap="round" />
					<line x1={0} x2={plotWidth} y1={ridge.base} y2={ridge.base} stroke={theme.palette.base[300]} stroke-width={1} />

					<Text
						dx={-Tokens.spacing.md}
						dy={ridge.base - 4}
						width={gutter - Tokens.spacing.md}
						text={ridge.label}
						textAnchor="end"
						verticalAnchor="end"
						fontSize={nameSize}
						fontWeight={Tokens.fontWeight.semibold}
						fill={theme.palette.neutral[300]}
					/>
					{#if ridge.note}
						<Text
							dx={-Tokens.spacing.md}
							dy={ridge.base - 2}
							text={ridge.note}
							textAnchor="end"
							verticalAnchor="start"
							fontSize={Tokens.fontSize.xs}
							fill={theme.palette.neutral[100]}
						/>
					{/if}

					{#if ridge.value}
						<g class="fade" style:opacity={shows(2) ? 1 : 0}>
							<Text
								dx={plotWidth + Tokens.spacing.sm}
								dy={ridge.base - 4}
								text={ridge.value}
								textAnchor="start"
								verticalAnchor="end"
								fontSize={nameSize}
								fontWeight={Tokens.fontWeight.bold}
								fill={theme.palette.accent}
							/>
						</g>
					{/if}

					{#if interactive}
						<HitTarget
							{hover}
							{container}
							index={ridge.index}
							x={-gutter}
							y={ridge.top}
							width={gutter + plotWidth + margin.right}
							height={ridge.band}
							label="{ridge.label}{ridge.value ? `: ${ridge.value}` : ''}"
						/>
					{/if}
				</g>
			{/each}

			<g class="fade" style:opacity={shows(1) ? 1 : 0}>
				<line
					x1={refX}
					x2={refX}
					y1={HEADER - 4}
					y2={plotHeight}
					stroke={theme.palette.neutral[400]}
					stroke-width={Tokens.strokeWidth.md}
				/>
				<Text
					dx={refX}
					dy={0}
					text={`${referenceLabel}: ${formatX(reference)}`}
					textAnchor="middle"
					verticalAnchor="start"
					fontSize={Tokens.fontSize.sm}
					fontWeight={Tokens.fontWeight.semibold}
					fill={theme.palette.neutral[400]}
				/>
			</g>

			<Axis orientation="bottom" scale={x} top={plotHeight} numTicks={compact ? 4 : 8} tickFormat={(v) => formatX(Number(v))} />
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
