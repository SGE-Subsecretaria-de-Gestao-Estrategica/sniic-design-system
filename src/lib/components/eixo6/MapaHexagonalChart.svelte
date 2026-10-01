<script lang="ts">
	/**
	 * Mapa hexagonal: o Brasil esquemático, uma célula por UF, com duas barras
	 * em cada uma e uma linha de referência atravessando todas.
	 *
	 * The hexagonal grid is the Eixo 1 one (`mapaUf`), so a reader who learned
	 * where each state sits keeps that knowledge. The marks are the family's:
	 * two vertical `CapsuleBar`s per cell — the first value in the pillar's
	 * second hue, the second in the default bar gradient — and the reference
	 * as a dark line across the cell. A second value that clears the reference
	 * gets its tip dot in the accent, the way a line chart marks the point that
	 * matters, so "who beats the national mean" reads across the map at once.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import CapsuleBar from '$lib/core/components/shape/CapsuleBar.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { CONTORNOS, MEIA_LINHA, REGIOES, S, caminhoHex, centro } from '../eixo1/mapaUf';
	import ChartShell from './ChartShell.svelte';
	import type { MapaHexagonalValor } from './data.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			values: MapaHexagonalValor[];
			/** The value of the reference line — a national mean, say. */
			reference: number;
			/** Names of the two values and of the reference — legend, tooltip, table. */
			aLabel?: string;
			bLabel?: string;
			referenceLabel?: string;
			formatValue?: (value: number) => string;
			/** Top of the bar scale; defaults to the largest value or the reference. */
			max?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		values,
		reference,
		aLabel = 'Primeiro valor',
		bLabel = 'Segundo valor',
		referenceLabel = 'Referência',
		formatValue = (value: number) => `${Math.round(value)}%`,
		max,
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

	/** Every cell, with its centre in the grid's own domain. */
	const cells = Object.entries(REGIOES).flatMap(([regiao, { celulas }]) =>
		Object.keys(celulas).map((uf) => {
			const [cx, cy] = centro(regiao, uf);
			return { uf, regiao, cx, cy };
		})
	);
	const bounds = {
		x0: d3.min(cells, (c) => c.cx - S)! - 8,
		x1: d3.max(cells, (c) => c.cx + S)! + 8,
		y0: Math.min(d3.min(cells, (c) => c.cy - MEIA_LINHA)!, ...Object.values(REGIOES).map((r) => r.rotulo[1] - 30)) - 8,
		y1: d3.max(cells, (c) => c.cy + MEIA_LINHA)! + 8
	};

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	let plotWidth = $derived(Math.max(0, Math.min(shellWidth - 8, 720)));
	let k = $derived(plotWidth / (bounds.x1 - bounds.x0));
	let plotHeight = $derived((bounds.y1 - bounds.y0) * k);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	/** Grid domain → px. */
	const px = (x: number, y: number) => [(x - bounds.x0) * k, (y - bounds.y0) * k] as const;

	let byUf = $derived(new Map(values.map((v) => [v.uf, v])));
	let top = $derived(max ?? Math.max(reference, d3.max(values, (v) => Math.max(v.a, v.b)) ?? 1));

	/** Bar geometry inside a cell, in px. */
	let barArea = $derived({
		height: MEIA_LINHA * 1.05 * k,
		width: S * 0.3 * k,
		gap: S * 0.1 * k,
		baseOffset: MEIA_LINHA * 0.62 * k
	});
	let length = $derived((v: number) => (Math.max(0, v) / top) * barArea.height);

	let layout = $derived(
		cells.map((cell, index) => {
			const [x, y] = px(cell.cx, cell.cy);
			const v = byUf.get(cell.uf);
			const base = y + barArea.baseOffset;
			return {
				...cell,
				index,
				x,
				y,
				base,
				v,
				aX: x - barArea.gap / 2 - barArea.width,
				bX: x + barArea.gap / 2,
				refY: base - length(reference),
				beats: v ? v.b > reference : false
			};
		})
	);

	let secondary = $derived([theme.palette.secondary, theme.palette.secondaryVariant] as const);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeCell = $derived(activeIndex === null ? null : layout[activeIndex]);

	function cellOpacity(uf: string) {
		return highlight !== null && highlight !== uf ? 0.3 : 1;
	}

	let tooltip = $derived.by(() => {
		if (!activeCell?.v) return null;
		const rows = [
			{ label: aLabel, value: formatValue(activeCell.v.a), color: theme.palette.secondary }
		];
		if (shows(1)) {
			rows.push({
				label: bLabel,
				value: formatValue(activeCell.v.b),
				color: theme.palette.primaryVariant
			});
		}
		if (shows(2)) {
			rows.push({ label: referenceLabel, value: formatValue(reference), color: theme.palette.neutral[400] });
		}
		return { title: activeCell.uf, rows };
	});

	let legend = $derived([
		{ label: aLabel, color: theme.palette.secondary },
		...(shows(1) ? [{ label: bLabel, color: theme.palette.primaryVariant }] : []),
		...(shows(2) ? [{ label: `${referenceLabel}: ${formatValue(reference)}`, color: theme.palette.neutral[400] }] : [])
	]);

	let table = $derived({
		caption: title ?? 'Valores por UF',
		columns: ['UF', aLabel, bLabel],
		rows: layout.map((c) => [c.uf, c.v ? formatValue(c.v.a) : '—', c.v ? formatValue(c.v.b) : '—'])
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
	ariaLabel={title ?? 'Valores por UF'}
>
	{#snippet children({ container })}
		{#if plotWidth > 0}
			<g transform="scale({k}) translate({-bounds.x0},{-bounds.y0})">
				{#each layout as cell (cell.uf)}
					<path
						d={caminhoHex(cell.cx, cell.cy)}
						fill={theme.palette.base[100]}
						stroke={theme.palette.base[300]}
						stroke-width={1.5 / k}
						opacity={cellOpacity(cell.uf)}
					/>
				{/each}
				<!-- Each region's outer edge, a shade darker, so regions read as clusters. -->
				{#each CONTORNOS as contorno (contorno.regiao)}
					{#each contorno.arestas as [x1, y1, x2, y2], i (i)}
						<line {x1} {y1} {x2} {y2} stroke={theme.palette.neutral[100]} stroke-opacity={0.5} stroke-width={1.5 / k} stroke-linecap="round" />
					{/each}
				{/each}
			</g>

			{#each Object.entries(REGIOES) as [regiao, r] (regiao)}
				{@const [rx, ry] = px(r.rotulo[0], r.rotulo[1])}
				<Text
					dx={rx}
					dy={ry}
					text={regiao}
					textAnchor="middle"
					verticalAnchor="middle"
					fontSize={Tokens.fontSize.md}
					fontWeight={Tokens.fontWeight.semibold}
					fill={theme.palette.neutral[200]}
				/>
			{/each}

			{#each layout as cell (cell.uf)}
				<g class="fade" style:opacity={cellOpacity(cell.uf)}>
					<Text
						dx={cell.x}
						dy={cell.y - MEIA_LINHA * 0.62 * k}
						text={cell.uf}
						textAnchor="middle"
						verticalAnchor="middle"
						fontSize={Tokens.fontSize.sm}
						fontWeight={Tokens.fontWeight.bold}
						fill={theme.palette.neutral[300]}
					/>
					{#if cell.v}
						<CapsuleBar
							orientation="vertical"
							x={cell.aX}
							y={cell.base - length(cell.v.a)}
							width={barArea.width}
							height={length(cell.v.a)}
							fill={secondary}
							dotFill={theme.palette.secondaryVariant}
						/>
						<g class="fade" style:opacity={shows(1) ? 1 : 0}>
							<CapsuleBar
								orientation="vertical"
								x={cell.bX}
								y={cell.base - length(cell.v.b)}
								width={barArea.width}
								height={length(cell.v.b)}
								dotFill={shows(2) && cell.beats ? theme.palette.accent : undefined}
							/>
						</g>
						<g class="fade" style:opacity={shows(2) ? 1 : 0}>
							<line
								x1={cell.aX - 3}
								x2={cell.bX + barArea.width + 3}
								y1={cell.refY}
								y2={cell.refY}
								stroke={theme.palette.neutral[400]}
								stroke-width={Tokens.strokeWidth.md}
								stroke-linecap="round"
							/>
						</g>
						{#if k > 0.42}
							<Text
								dx={cell.x}
								dy={cell.base + 3}
								text={`${formatValue(cell.v.a)}  ${shows(1) ? formatValue(cell.v.b) : ''}`}
								textAnchor="middle"
								verticalAnchor="start"
								fontSize={Tokens.fontSize.xs}
								fill={theme.palette.neutral[200]}
							/>
						{/if}
					{/if}
				</g>
			{/each}

			{#if interactive}
				{#each layout as cell (cell.uf)}
					<HitTarget
						{hover}
						{container}
						index={cell.index}
						x={0}
						y={0}
						d={caminhoHex(cell.cx, cell.cy)}
						transform="scale({k}) translate({-bounds.x0},{-bounds.y0})"
						label="{cell.uf}: {cell.v ? `${aLabel} ${formatValue(cell.v.a)}, ${bLabel} ${formatValue(cell.v.b)}` : 'sem dado'}"
					/>
				{/each}
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
