<script lang="ts">
	/**
	 * Mapa por município: cada um dos 5.570 municípios na cor da classe do seu
	 * valor, com o contorno das UFs por cima.
	 *
	 * The same sequential ramp as `MapaUfChart`. Five thousand outlines are no
	 * target for a pointer, so the states are: hovering one reports how its
	 * municipalities split across the classes. The municipal mesh (1.1MB) is
	 * not shipped — the host passes its own, already projected.
	 */
	import * as d3 from 'd3';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import malhaUf from '../eixo1/data/malha-ufs.json';
	import type { MalhaMunicipiosProjetada } from '../eixo1/malhaMunicipal';
	import ChartShell from './ChartShell.svelte';
	import { classesFrom, sequentialRamp } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** Value by 7-digit IBGE code; a municipality without one stays grey. */
			values: Record<string, number>;
			mesh: MalhaMunicipiosProjetada;
			/** Ascending lower bounds of every class above the first. */
			breaks: number[];
			classLabels?: string[];
			formatValue?: (value: number) => string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		values,
		mesh,
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
	const intFormat = formatLocale.format(',d');
	const pctFormat = formatLocale.format('.1%');

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	let plotWidth = $derived(Math.max(0, Math.min(shellWidth - 8, 640)));
	let k = $derived(plotWidth / mesh.largura);
	let plotHeight = $derived(mesh.altura * k);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let classes = $derived(classesFrom(breaks, formatValue, classLabels));
	let ramp = $derived(sequentialRamp(theme.palette, classes.count));

	let fills = $derived(
		mesh.municipios.map((m) => {
			const value = values[m.c];
			return value === undefined ? theme.palette.base[200] : ramp[classes.classOf(value)];
		})
	);

	/** Per state: how many municipalities fall in each class. */
	let counts = $derived.by(() => {
		const out = new Map<string, number[]>();
		for (const m of mesh.municipios) {
			const value = values[m.c];
			if (value === undefined) continue;
			const row = out.get(m.uf) ?? Array(classes.count).fill(0);
			row[classes.classOf(value)] += 1;
			out.set(m.uf, row);
		}
		return out;
	});

	let national = $derived(
		d3.range(classes.count).map((i) => d3.sum([...counts.values()], (row) => row[i]))
	);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeState = $derived(activeIndex === null ? null : malhaUf.ufs[activeIndex]);

	function stateOpacity(uf: string) {
		return highlight !== null && highlight !== uf ? 0.3 : 1;
	}

	let tooltip = $derived.by(() => {
		if (!activeState || !shows(1)) return null;
		const row = counts.get(activeState.uf);
		if (!row) return { title: activeState.nome, rows: [{ label: 'Sem dado', value: '—' }] };
		const total = d3.sum(row) || 1;
		return {
			title: activeState.nome,
			rows: row.map((n, i) => ({
				label: classes.labels[i],
				value: `${intFormat(n)} · ${pctFormat(n / total)}`,
				color: ramp[i]
			}))
		};
	});

	let legend = $derived(classes.labels.map((label, i) => ({ label, color: ramp[i], dot: true })));

	let table = $derived({
		caption: title ?? 'Municípios por classe',
		columns: ['UF', ...classes.labels],
		rows: [
			...malhaUf.ufs.map((u) => [u.nome, ...(counts.get(u.uf) ?? []).map((n) => intFormat(n))]),
			['Brasil', ...national.map((n) => intFormat(n))]
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
	ariaLabel={title ?? 'Municípios por classe'}
>
	{#snippet children({ container })}
		{#if plotWidth > 0}
			<g transform="scale({k})">
				{#each mesh.municipios as m, i (m.c)}
					<path
						class="municipality"
						d={m.d}
						fill={shows(1) ? fills[i] : theme.palette.base[200]}
						opacity={stateOpacity(m.uf)}
					/>
				{/each}
				{#each malhaUf.ufs as u (u.uf)}
					<path
						d={u.d}
						fill="none"
						stroke={theme.palette.base[100]}
						stroke-width={1.4 / k}
						stroke-linejoin="round"
					/>
				{/each}
			</g>

			{#if interactive}
				{#each malhaUf.ufs as u, i (u.uf)}
					<HitTarget
						{hover}
						{container}
						index={i}
						x={0}
						y={0}
						d={u.d}
						transform="scale({k})"
						label={u.nome}
					/>
				{/each}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	.municipality {
		transition:
			fill 450ms ease-out,
			opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.municipality {
			transition: none;
		}
	}
</style>
