<script lang="ts">
	/**
	 * Mapa por UF: cada unidade federativa na cor da classe do seu valor, sobre
	 * a malha do IBGE.
	 *
	 * Colour is the pillar's sequential ramp — pale to deep, the same ramp the
	 * bubble charts fill by value — one step per class. States wide enough
	 * carry their code and value inside; the small ones of the North-east are
	 * left to the tooltip and the table rather than to labels crammed over
	 * their borders. Every state answers the pointer and the keyboard over its
	 * own outline.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import { pickContrastInk } from '$lib/core/utils/contrastColor';
	import malha from '../eixo1/data/malha-ufs.json';
	import ChartShell from './ChartShell.svelte';
	import type { MapaUfValor } from './data.js';
	import { classesFrom, sequentialRamp } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			values: MapaUfValor[];
			/** Ascending lower bounds of every class above the first. */
			breaks: number[];
			/** One name per class; without them the legend writes the ranges. */
			classLabels?: string[];
			formatValue?: (value: number) => string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		values,
		breaks,
		classLabels,
		formatValue = (value: number) => formatLocale.format(',.1~f')(value),
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

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	let plotWidth = $derived(Math.max(0, Math.min(shellWidth - 8, 640)));
	let k = $derived(plotWidth / malha.largura);
	let plotHeight = $derived(malha.altura * k);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let classes = $derived(classesFrom(breaks, formatValue, classLabels));
	let ramp = $derived(sequentialRamp(theme.palette, classes.count));
	let byUf = $derived(new Map(values.map((v) => [v.uf, v.value])));

	let states = $derived(
		malha.ufs.map((u, index) => {
			const value = byUf.get(u.uf);
			const fill = value === undefined ? theme.palette.base[200] : ramp[classes.classOf(value)];
			return {
				...u,
				index,
				value,
				fill,
				ink: pickContrastInk(d3.color(fill)?.formatHex() ?? '#ffffff', {
					light: '#FFFFFF',
					dark: theme.palette.neutral[400]
				}),
				/** Room for a label inside, in px. */
				room: u.folga * k
			};
		})
	);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeState = $derived(activeIndex === null ? null : states[activeIndex]);

	function stateOpacity(uf: string) {
		return highlight !== null && highlight !== uf ? 0.3 : 1;
	}

	let tooltip = $derived(
		activeState
			? {
					title: activeState.nome,
					rows:
						activeState.value === undefined
							? [{ label: 'Sem dado', value: '—' }]
							: [
									{
										label: classes.labels[classes.classOf(activeState.value)],
										value: formatValue(activeState.value),
										color: activeState.fill,
										emphasis: true
									}
								]
				}
			: null
	);

	let legend = $derived(classes.labels.map((label, i) => ({ label, color: ramp[i], dot: true })));

	let table = $derived({
		caption: title ?? 'Valor por UF',
		columns: ['UF', 'Valor', 'Classe'],
		rows: states.map((s) => [
			s.nome,
			s.value === undefined ? '—' : formatValue(s.value),
			s.value === undefined ? '—' : classes.labels[classes.classOf(s.value)]
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
	ariaLabel={title ?? 'Valor por UF'}
>
	{#snippet children({ container })}
		{#if plotWidth > 0}
			<g transform="scale({k})">
				{#each states as s (s.uf)}
					<path
						class="state"
						d={s.d}
						fill={shows(1) ? s.fill : theme.palette.base[200]}
						stroke={theme.palette.base[100]}
						stroke-width={1.2 / k}
						stroke-linejoin="round"
						opacity={stateOpacity(s.uf)}
					/>
				{/each}
			</g>

			{#each states as s (s.uf)}
				{#if s.room >= 11}
					<g class="fade" style:opacity={stateOpacity(s.uf)}>
						<Text
							dx={s.rotulo[0] * k}
							dy={s.rotulo[1] * k - (shows(1) && s.room >= 18 && s.value !== undefined ? 6 : 0)}
							text={s.uf}
							textAnchor="middle"
							verticalAnchor="middle"
							fontSize={Tokens.fontSize.sm}
							fontWeight={Tokens.fontWeight.bold}
							fill={shows(1) ? s.ink : theme.palette.neutral[200]}
						/>
						{#if shows(1) && s.room >= 18 && s.value !== undefined}
							<Text
								dx={s.rotulo[0] * k}
								dy={s.rotulo[1] * k + 7}
								text={formatValue(s.value)}
								textAnchor="middle"
								verticalAnchor="middle"
								fontSize={Tokens.fontSize.xs}
								fontWeight={Tokens.fontWeight.medium}
								fill={s.ink}
							/>
						{/if}
					</g>
				{/if}
			{/each}

			{#if interactive}
				{#each states as s (s.uf)}
					<HitTarget
						{hover}
						{container}
						index={s.index}
						x={0}
						y={0}
						d={s.d}
						transform="scale({k})"
						label="{s.nome}: {s.value === undefined ? 'sem dado' : formatValue(s.value)}"
					/>
				{/each}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	.fade,
	.state {
		transition:
			opacity 450ms ease-out,
			fill 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade,
		.state {
			transition: none;
		}
	}
</style>
