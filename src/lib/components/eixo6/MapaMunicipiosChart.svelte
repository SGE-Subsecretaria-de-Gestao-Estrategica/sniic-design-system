<script lang="ts" module>
	import * as d3 from 'd3';

	/** Bounding box and visual centre of one municipality, in mesh units. */
	type Geometria = { x0: number; y0: number; x1: number; y1: number; cx: number; cy: number };

	/**
	 * The mesh paths are plain `M…L…Z` polygons. The marker goes on the
	 * centroid of the largest ring, so an island or exclave never drags it
	 * off the mainland.
	 */
	function geometria(d: string): Geometria {
		let x0 = Infinity;
		let y0 = Infinity;
		let x1 = -Infinity;
		let y1 = -Infinity;
		let maior: [number, number][] = [];
		let maiorArea = -1;
		for (const anel of d.split('M').filter(Boolean)) {
			const pontos = [...anel.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(
				(p) => [+p[1], +p[2]] as [number, number]
			);
			for (const [x, y] of pontos) {
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
			const area = pontos.length > 2 ? Math.abs(d3.polygonArea(pontos)) : 0;
			if (area > maiorArea) {
				maiorArea = area;
				maior = pontos;
			}
		}
		const [cx, cy] = maior.length > 2 ? d3.polygonCentroid(maior) : [(x0 + x1) / 2, (y0 + y1) / 2];
		return { x0, y0, x1, y1, cx, cy };
	}

	/** A camera view, `[centre x, centre y, size]` in mesh units — what d3.interpolateZoom animates. */
	type View = [number, number, number];
</script>

<script lang="ts">
	/**
	 * Mapa por município: o território em cinza e só os `top` maiores valores
	 * marcados, numerados na ordem do ranking.
	 *
	 * Painting all 5,570 municipalities turned the map into noise; the story is
	 * almost always "where are the biggest ones". So the land stays neutral, the
	 * leaders get their own shape filled and a numbered marker on top — sized
	 * for the pointer, since a capital is a couple of pixels at country scale —
	 * and a ranked list names them. `zoomTo` frames any set of municipalities,
	 * animated, which is what a scrollytelling host drives. The municipal mesh
	 * (1.1MB) is not shipped — the host passes its own, already projected.
	 *
	 * When the spread is the story, `breaks` turns it into a mosaic: every
	 * municipality in its class colour on the theme's sequential ramp, with a
	 * legend, and the state under the pointer reports how its municipalities
	 * split across the classes. `highlight` then takes a state code and dims the
	 * rest, `top` defaults to 0 (pass it to mark leaders on top of the mosaic),
	 * and the steps are `MAPA_CLASSES_STEPS`.
	 */
	import { untrack } from 'svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import malhaUf from '../eixo1/data/malha-ufs.json';
	import type { MalhaMunicipiosProjetada } from '../eixo1/malhaMunicipal';
	import ChartShell from './ChartShell.svelte';
	import { classesFrom, sequentialRamp } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			/** Value by 7-digit IBGE code. Only the `top` largest are marked. */
			values: Record<string, number>;
			mesh: MalhaMunicipiosProjetada;
			/** Municipality name by IBGE code; without one the ranking shows the code. */
			names?: Record<string, string>;
			/**
			 * Ascending lower bounds of every class above the first. Given, every
			 * municipality is painted by class (a mosaic) instead of only the `top`.
			 */
			breaks?: number[];
			/** One name per class; without them the legend writes the ranges. */
			classLabels?: string[];
			/** How many municipalities to mark. Defaults to 10, or 0 with `breaks`. */
			top?: number;
			/** What the value measures, for the tooltip and the accessible table. */
			valueLabel?: string;
			formatValue?: (value: number) => string;
			/**
			 * IBGE codes to frame, animated. One code zooms onto that municipality
			 * and its neighbours; several frame them all; `null` shows the country.
			 */
			zoomTo?: string[] | null;
			/** Draws the ranked list beside (or under) the map. */
			ranking?: boolean;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		values,
		mesh,
		names = {},
		breaks,
		classLabels,
		top = breaks ? 0 : 10,
		valueLabel = 'Valor',
		formatValue = (value: number) => formatLocale.format(',.1~f')(value),
		zoomTo = null,
		ranking = true,
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
	const clipId = $props.id();
	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	const MARKER_R = 9;
	const ROW_H = 26;
	const GAP = 24;
	/** Smallest stretch of territory a zoom shows, in mesh units (~4 km each). */
	const MIN_SPAN = 70;

	let byCode = $derived(new Map(mesh.municipios.map((m) => [m.c, m])));

	// ---- classes (mosaic mode) ----------------------------------------------
	let classes = $derived(breaks ? classesFrom(breaks, formatValue, classLabels) : null);
	let ramp = $derived(classes ? sequentialRamp(theme.palette, classes.count) : []);
	const intFormat = formatLocale.format(',d');
	const pctFormat = formatLocale.format('.1%');

	/** Per state: how many municipalities fall in each class. */
	let counts = $derived.by(() => {
		const out = new Map<string, number[]>();
		if (!classes) return out;
		for (const m of mesh.municipios) {
			const value = values[m.c];
			if (value === undefined) continue;
			const row = out.get(m.uf) ?? Array(classes.count).fill(0);
			row[classes.classOf(value)] += 1;
			out.set(m.uf, row);
		}
		return out;
	});

	function municipalityFill(code: string, leader: boolean) {
		if (classes) {
			if (!shows(1)) return theme.palette.base[300];
			const value = values[code];
			return value === undefined ? theme.palette.base[200] : ramp[classes.classOf(value)];
		}
		return leader ? theme.palette.primary : theme.palette.base[300];
	}

	let leaders = $derived(
		mesh.municipios
			.filter((m) => values[m.c] !== undefined)
			.sort((a, b) => values[b.c] - values[a.c])
			.slice(0, top)
			.map((m, i) => ({
				code: m.c,
				uf: m.uf,
				rank: i + 1,
				name: names[m.c] ?? m.c,
				value: values[m.c],
				geo: geometria(m.d)
			}))
	);
	let leaderCodes = $derived(new Set(leaders.map((l) => l.code)));

	// ---- layout -------------------------------------------------------------
	let available = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let showList = $derived(ranking && leaders.length > 0);
	let listBeside = $derived(showList && available >= 600);
	let listWidth = $derived(listBeside ? Math.min(260, available * 0.36) : available);
	let listColumns = $derived(!showList || listBeside ? 1 : available >= 380 ? 2 : 1);
	let listRows = $derived(showList ? Math.ceil(leaders.length / listColumns) : 0);
	let listHeight = $derived(listRows * ROW_H);
	let columnWidth = $derived(listColumns > 1 ? (listWidth - GAP) / 2 : listWidth);

	let mapWidth = $derived(Math.min(listBeside ? available - listWidth - GAP : available, 640));
	let mapHeight = $derived((mesh.altura * mapWidth) / mesh.largura);
	let listX = $derived(listBeside ? mapWidth + GAP : 0);
	let listY = $derived(
		listBeside ? Math.max(0, (mapHeight - listHeight) / 2) : mapHeight + (showList ? 16 : 0)
	);
	let plotHeight = $derived(listBeside || !showList ? mapHeight : listY + listHeight);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	// ---- camera -------------------------------------------------------------
	// d3.interpolateZoom pulls out before travelling, so a jump from São Paulo
	// to Manaus reads as a flight over the country, not a smear across it.
	let fitSize = $derived(Math.min(mesh.largura, mesh.altura));
	let overview = $derived<View>([mesh.largura / 2, mesh.altura / 2, fitSize]);

	let target = $derived.by((): View => {
		const geos = (zoomTo ?? []).flatMap((c) => {
			const m = byCode.get(c);
			if (!m) return [];
			return [leaders.find((l) => l.code === c)?.geo ?? geometria(m.d)];
		});
		if (!geos.length) return overview;
		const x0 = d3.min(geos, (g) => g.x0)!;
		const x1 = d3.max(geos, (g) => g.x1)!;
		const y0 = d3.min(geos, (g) => g.y0)!;
		const y1 = d3.max(geos, (g) => g.y1)!;
		const spanX = Math.max((x1 - x0) * 1.5, MIN_SPAN);
		const spanY = Math.max((y1 - y0) * 1.5, MIN_SPAN);
		// The tighter side sets the zoom; never wider than the country.
		const size = fitSize * Math.max(spanX / mesh.largura, spanY / mesh.altura);
		return [(x0 + x1) / 2, (y0 + y1) / 2, Math.min(size, fitSize)];
	});

	const camera = new Tween<View>(
		untrack(() => target),
		{
			easing: cubicInOut,
			interpolate: (a, b) => {
				const zoom = d3.interpolateZoom(a, b);
				return (t) => zoom(t) as View;
			}
		}
	);

	$effect(() => {
		const next = target;
		const [x, y, size] = camera.target;
		if (x === next[0] && y === next[1] && size === next[2]) return;
		// Long flights get more time, within bounds a reader will sit through.
		const distance = d3.interpolateZoom(camera.current, next).duration;
		camera.set(next, {
			duration: prefersReducedMotion.current ? 0 : Math.min(1800, Math.max(700, distance * 0.9))
		});
	});

	let zoomFactor = $derived(fitSize / camera.current[2]);
	/** Pixels per mesh unit at the current zoom. */
	let scale = $derived((mapWidth / mesh.largura) * zoomFactor);
	let tx = $derived(mapWidth / 2 - camera.current[0] * scale);
	let ty = $derived(mapHeight / 2 - camera.current[1] * scale);

	// Municipal borders are noise at country scale and the context once zoomed in.
	let borderOpacity = $derived(Math.max(0, Math.min(1, (zoomFactor - 2) / 4)));

	// ---- emphasis -----------------------------------------------------------
	let emphasised = $derived(
		highlight !== null ? new Set([highlight]) : zoomTo?.length ? new Set(zoomTo) : null
	);
	// Markers take indices 0…n-1; in mosaic mode the states follow, from n.
	let activeIndex = $derived(focusIndex ?? hover.index);
	let active = $derived(activeIndex === null ? null : (leaders[activeIndex] ?? null));
	let activeState = $derived(
		classes && activeIndex !== null && activeIndex >= leaders.length
			? (malhaUf.ufs[activeIndex - leaders.length] ?? null)
			: null
	);

	const isEmphasised = (code: string) => active?.code === code || (emphasised?.has(code) ?? false);
	const leaderOpacity = (code: string) =>
		emphasised === null && active === null ? 1 : isEmphasised(code) ? 1 : 0.35;
	const markerFill = (code: string) =>
		isEmphasised(code) ? theme.palette.accent : theme.palette.secondary;

	let markers = $derived(
		leaders.map((l) => {
			const x = tx + l.geo.cx * scale;
			const y = ty + l.geo.cy * scale;
			const inside =
				x >= -MARKER_R && x <= mapWidth + MARKER_R && y >= -MARKER_R && y <= mapHeight + MARKER_R;
			return { ...l, x, y, inside };
		})
	);

	// ---- readouts -----------------------------------------------------------
	let tooltip = $derived.by(() => {
		if (!shows(1)) return null;
		if (activeState && classes) {
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
		}
		if (!active) return null;
		return {
			title: `${active.name} (${active.uf})`,
			rows: [
				{ label: valueLabel, value: formatValue(active.value), color: theme.palette.primary },
				{ label: 'Posição', value: `${active.rank}º de ${leaders.length}` }
			]
		};
	});

	let caption = $derived(
		title ?? (classes ? 'Municípios por classe' : `Os ${leaders.length} municípios com os maiores valores`)
	);

	let legend = $derived(
		classes && shows(1) ? classes.labels.map((label, i) => ({ label, color: ramp[i], dot: true })) : []
	);

	let table = $derived.by(() => {
		if (classes) {
			const national = d3
				.range(classes.count)
				.map((i) => d3.sum([...counts.values()], (row) => row[i]));
			return {
				caption,
				columns: ['UF', ...classes.labels],
				rows: [
					...malhaUf.ufs.map((u) => [
						u.nome,
						...(counts.get(u.uf) ?? Array(classes.count).fill(0)).map((n) => intFormat(n))
					]),
					['Brasil', ...national.map((n) => intFormat(n))]
				]
			};
		}
		return {
			caption,
			columns: ['Município', 'Posição', 'UF', valueLabel],
			rows: leaders.map((l) => [l.name, `${l.rank}º`, l.uf, formatValue(l.value)])
		};
	});

	function stateOpacity(uf: string) {
		if (!classes) return 1;
		if (highlight !== null) return highlight === uf ? 1 : 0.3;
		return activeState && activeState.uf !== uf ? 0.45 : 1;
	}
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
	ariaLabel={caption}
>
	{#snippet children({ container })}
		{#if mapWidth > 0}
			<defs>
				<clipPath id="{clipId}-mapa">
					<rect width={mapWidth} height={mapHeight} />
				</clipPath>
			</defs>

			<g clip-path="url(#{clipId}-mapa)">
				<g
					transform="translate({tx},{ty}) scale({scale})"
					stroke={borderOpacity > 0 ? theme.palette.base[100] : 'none'}
					stroke-opacity={borderOpacity}
				>
					{#each mesh.municipios as m (m.c)}
						{@const leader = shows(1) && leaderCodes.has(m.c)}
						<path
							class="municipality"
							d={m.d}
							fill={municipalityFill(m.c, leader)}
							opacity={classes ? stateOpacity(m.uf) : leader ? leaderOpacity(m.c) : 1}
						/>
					{/each}
					{#each malhaUf.ufs as u (u.uf)}
						<path
							class="state"
							d={u.d}
							fill="none"
							stroke={theme.palette.base[100]}
							stroke-opacity="1"
							stroke-linejoin="round"
						/>
					{/each}
				</g>
			</g>

			<!-- Outside the clip: a marker on the coast may overhang the map's edge. -->
			{#if shows(1)}
				{#each markers as mk (mk.code)}
					{#if mk.inside}
						<g class="fade" style:opacity={leaderOpacity(mk.code)}>
							<circle
								cx={mk.x}
								cy={mk.y}
								r={MARKER_R}
								fill={markerFill(mk.code)}
								stroke={theme.palette.base[100]}
								stroke-width="1.5"
							/>
							<text
								class="rank"
								x={mk.x}
								y={mk.y}
								dy="0.35em"
								text-anchor="middle"
								font-size={Tokens.fontSize.sm}
								font-weight={Tokens.fontWeight.bold}
								fill={theme.palette.base[100]}>{mk.rank}</text
							>
							{#if zoomFactor >= 2.5}
								<text
									class="halo"
									x={mk.x + MARKER_R + 5}
									y={mk.y}
									dy="0.35em"
									font-size={Tokens.fontSize.md}
									font-weight={Tokens.fontWeight.semibold}
									fill={theme.palette.neutral[300]}
									stroke={theme.palette.base[100]}>{mk.name}</text
								>
							{/if}
						</g>
					{/if}
				{/each}
			{/if}

			{#if showList && shows(2)}
				<g class="fade" transform="translate({listX},{listY})">
					{#each leaders as l, i (l.code)}
						{@const x = Math.floor(i / listRows) * (columnWidth + GAP)}
						{@const y = (i % listRows) * ROW_H}
						<g class="fade" transform="translate({x},{y})" style:opacity={leaderOpacity(l.code)}>
							<circle cx={MARKER_R} cy={ROW_H / 2} r={MARKER_R} fill={markerFill(l.code)} />
							<text
								class="rank"
								x={MARKER_R}
								y={ROW_H / 2}
								dy="0.35em"
								text-anchor="middle"
								font-size={Tokens.fontSize.sm}
								font-weight={Tokens.fontWeight.bold}
								fill={theme.palette.base[100]}>{l.rank}</text
							>
							<text
								x={MARKER_R * 2 + 8}
								y={ROW_H / 2}
								dy="0.35em"
								font-size={Tokens.fontSize.md}
								font-weight={isEmphasised(l.code)
									? Tokens.fontWeight.semibold
									: Tokens.fontWeight.regular}
								fill={theme.palette.neutral[300]}
								>{l.name} <tspan fill={theme.palette.neutral[100]}>{l.uf}</tspan></text
							>
							<text
								x={columnWidth}
								y={ROW_H / 2}
								dy="0.35em"
								text-anchor="end"
								font-size={Tokens.fontSize.md}
								font-weight={Tokens.fontWeight.semibold}
								fill={theme.palette.neutral[300]}>{formatValue(l.value)}</text
							>
						</g>
					{/each}
				</g>
			{/if}

			{#if interactive && shows(1)}
				{#if classes}
					<!-- Clipped like the map, so a zoomed-in state never answers off the map. -->
					<g clip-path="url(#{clipId}-mapa)">
						{#each malhaUf.ufs as u, i (u.uf)}
							<HitTarget
								{hover}
								{container}
								index={leaders.length + i}
								x={0}
								y={0}
								d={u.d}
								transform="translate({tx},{ty}) scale({scale})"
								label={u.nome}
							/>
						{/each}
					</g>
				{/if}
				{#each markers as mk, i (mk.code)}
					{#if mk.inside}
						<HitTarget
							{hover}
							{container}
							index={i}
							x={mk.x}
							y={mk.y}
							r={MARKER_R}
							label="{mk.rank}º {mk.name}"
						/>
					{/if}
				{/each}
				{#if showList && shows(2)}
					{#each leaders as l, i (l.code)}
						<HitTarget
							{hover}
							{container}
							index={i}
							x={listX + Math.floor(i / listRows) * (columnWidth + GAP)}
							y={listY + (i % listRows) * ROW_H}
							width={columnWidth}
							height={ROW_H}
							label="{l.rank}º {l.name}"
						/>
					{/each}
				{/if}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	/* Stroke widths are in screen pixels, so borders stay hairlines at any zoom. */
	.municipality,
	.state {
		vector-effect: non-scaling-stroke;
	}

	.municipality {
		stroke-width: 0.6px;
		transition:
			fill 450ms ease-out,
			opacity 450ms ease-out;
	}

	.state {
		stroke-width: 1.4px;
	}

	.rank,
	.halo {
		pointer-events: none;
	}

	.halo {
		paint-order: stroke;
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	.fade {
		transition: opacity 300ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.municipality,
		.fade {
			transition: none;
		}
	}
</style>
