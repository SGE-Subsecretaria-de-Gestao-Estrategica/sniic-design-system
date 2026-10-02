<script lang="ts">
	/**
	 * Mapa hexagonal: o Brasil esquemático, uma célula por UF, com duas barras
	 * em cada uma e uma linha de referência atravessando todas.
	 *
	 * The hexagonal grid is the Eixo 1 one (`mapaUf`), so a reader who learned
	 * where each state sits keeps that knowledge. Each cell holds two flat bars
	 * — the first value in the pillar's second hue, the second in its first —
	 * and the reference as a dark line across them. Whatever passes the line is
	 * painted in the accent, so "who beats the reference, and by how much" reads
	 * across the map before any number does. No region is outlined unless the
	 * host names some in `emphasizedRegions`; a unit with one value (the DF, say)
	 * gets a single centred bar.
	 *
	 * In scrollytelling, after the reference each region gets a stage of its own
	 * (outlined, the rest dimmed).
	 *
	 * The legend is `MapaHexagonalLegenda`: drawn in the map's empty lower-left
	 * corner when there is room for it at a readable size, below the map when
	 * there is not, or left to the host with `legend="none"`.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { CONTORNOS, MEIA_LINHA, REGIOES, S, caminhoHex, centro } from '../eixo1/mapaUf';
	import BarraReferencia from './BarraReferencia.svelte';
	import ChartShell from './ChartShell.svelte';
	import MapaHexagonalLegenda from './MapaHexagonalLegenda.svelte';
	import { LEGENDA_TEXTO_PADRAO, LEGENDA_WIDTH, layoutLegenda } from './mapaHexagonalLegenda.js';
	import type { MapaHexagonalLegendaTexto, MapaHexagonalValor } from './data.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			values: MapaHexagonalValor[];
			/** The value of the reference line — a national mean, say. */
			reference: number;
			/** Names of the two values and of the reference — tooltip, table, legend. */
			aLabel?: string;
			bLabel?: string;
			referenceLabel?: string;
			formatValue?: (value: number) => string;
			/** Top of the bar scale; defaults to the largest value or the reference. */
			max?: number;
			/** Regions drawn with a darker outline once the reference is in. None by default. */
			emphasizedRegions?: string[];
			/**
			 * Where the legend goes: in the map's empty corner, below it, or nowhere
			 * (the host places `MapaHexagonalLegenda` itself). `auto` puts it in the
			 * corner when it stays readable there.
			 */
			legend?: 'auto' | 'inline' | 'below' | 'none';
			/** The legend's copy; `aText`, `bText`, `referenceText` default to the labels above. */
			legendText?: Partial<MapaHexagonalLegendaTexto>;
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
		emphasizedRegions,
		legend = 'auto',
		legendText = {},
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
	const mapBounds = {
		x0: d3.min(cells, (c) => c.cx - S)! - 8,
		x1: d3.max(cells, (c) => c.cx + S)! + 8,
		y0: Math.min(d3.min(cells, (c) => c.cy - MEIA_LINHA)!, ...Object.values(REGIOES).map((r) => r.rotulo[1] - 30)) - 8,
		y1: d3.max(cells, (c) => c.cy + MEIA_LINHA)! + 8
	};

	/** The empty lower-left corner of the grid, where the legend fits. */
	const LEGEND_BOX = { x: 36, y: 592, width: 490 };
	const LEGEND_MIN_SCALE = 0.75;
	const LEGEND_GAP = 24;
	const MAX_WIDTH = 980;

	let legendCopy = $derived({
		...LEGENDA_TEXTO_PADRAO,
		aText: aLabel,
		bText: bLabel,
		referenceText: referenceLabel,
		...legendText
	});
	let legendHeight = $derived(
		layoutLegenda(legendCopy, { reference, a: reference * 1.8, b: reference * 0.83 }).height
	);

	const margin = { top: 4, right: 4, bottom: 4, left: 4 };
	let plotWidth = $derived(Math.max(0, Math.min(shellWidth - 8, MAX_WIDTH)));

	/** The grid bounds with the legend's corner included. */
	let inlineBounds = $derived({
		...mapBounds,
		x0: Math.min(mapBounds.x0, LEGEND_BOX.x - 8),
		y1: Math.max(mapBounds.y1, LEGEND_BOX.y + (legendHeight * LEGEND_BOX.width) / LEGENDA_WIDTH + 8)
	});
	let inlineScale = $derived(
		((plotWidth / (inlineBounds.x1 - inlineBounds.x0)) * LEGEND_BOX.width) / LEGENDA_WIDTH
	);
	let legendMode = $derived(
		legend === 'auto' ? (inlineScale >= LEGEND_MIN_SCALE ? 'inline' : 'below') : legend
	);

	let bounds = $derived(legendMode === 'inline' ? inlineBounds : mapBounds);
	let k = $derived(plotWidth / (bounds.x1 - bounds.x0));
	let plotHeight = $derived((bounds.y1 - bounds.y0) * k);

	let belowScale = $derived(Math.min(1, plotWidth / (LEGENDA_WIDTH + 4)));
	let belowHeight = $derived(legendMode === 'below' ? LEGEND_GAP + legendHeight * belowScale : 0);
	let figureHeight = $derived(height ?? plotHeight + belowHeight + margin.top + margin.bottom);

	/** Grid domain → px. */
	let px = $derived((x: number, y: number) => [(x - bounds.x0) * k, (y - bounds.y0) * k] as const);

	let byUf = $derived(new Map(values.map((v) => [v.uf, v])));
	let top = $derived(max ?? Math.max(reference, d3.max(values, (v) => Math.max(v.a, v.b ?? 0)) ?? 1));

	/** Type follows the map's scale, within readable limits. */
	const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
	let type = $derived({
		uf: clamp(20 * k, 9, 15),
		value: clamp(16 * k, 8, 12.5),
		region: clamp(21 * k, 10, 16)
	});

	/** Bar geometry inside a cell, in px. */
	let bar = $derived({
		width: S * 0.44 * k,
		gap: S * 0.06 * k,
		overhang: S * 0.14 * k,
		maxHeight: MEIA_LINHA * 1.05 * k,
		baseOffset: MEIA_LINHA * 0.6 * k
	});
	let length = $derived((v: number) => (Math.max(0, v) / top) * bar.maxHeight);

	const hasB = (v: MapaHexagonalValor | undefined): v is MapaHexagonalValor & { b: number } =>
		v?.b !== undefined && v?.b !== null;

	let layout = $derived(
		cells.map((cell, index) => {
			const [x, y] = px(cell.cx, cell.cy);
			const v = byUf.get(cell.uf);
			const base = y + bar.baseOffset;
			const bars = !v
				? []
				: hasB(v)
					? [
							{ x: x - bar.gap / 2 - bar.width, value: v.a, fill: theme.palette.secondary, stage: 0 },
							{ x: x + bar.gap / 2, value: v.b, fill: theme.palette.primary, stage: 1 }
						]
					: [{ x: x - bar.width / 2, value: v.a, fill: theme.palette.secondary, stage: 0 }];
			const span = bars.length ? [bars[0].x, bars[bars.length - 1].x + bar.width] : [x, x];
			return {
				...cell,
				index,
				x,
				y,
				base,
				v,
				bars,
				line: { x1: span[0] - bar.overhang, x2: span[1] + bar.overhang },
				refY: base - length(reference)
			};
		})
	);

	/** Stages 3… walk the regions one by one, in the order of `REGIOES`. */
	const REGION_STAGE = 3;
	const regionNames = Object.keys(REGIOES);

	/**
	 * The region in focus: the one of the current stage, or a region name passed
	 * as `highlight`.
	 */
	let focusRegion = $derived(
		step >= REGION_STAGE && step < REGION_STAGE + regionNames.length
			? regionNames[step - REGION_STAGE]
			: highlight !== null && highlight in REGIOES
				? highlight
				: null
	);

	/** Regions outlined now: the focused one, or those the host emphasized. */
	let outlined = $derived(new Set(focusRegion !== null ? [focusRegion] : (emphasizedRegions ?? [])));

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeCell = $derived(activeIndex === null ? null : layout[activeIndex]);

	function cellOpacity(uf: string, regiao: string) {
		if (focusRegion !== null) return regiao === focusRegion ? 1 : 0.3;
		return highlight !== null && highlight !== uf ? 0.3 : 1;
	}

	let tooltip = $derived.by(() => {
		const v = activeCell?.v;
		if (!activeCell || !v) return null;
		const rows = [{ label: aLabel, value: formatValue(v.a), color: theme.palette.secondary }];
		if (shows(1) && hasB(v)) {
			rows.push({ label: bLabel, value: formatValue(v.b), color: theme.palette.primary });
		}
		if (shows(2)) {
			rows.push({ label: referenceLabel, value: formatValue(reference), color: theme.palette.neutral[400] });
		}
		return { title: activeCell.uf, rows };
	});

	const describe = (v: MapaHexagonalValor | undefined) =>
		!v
			? 'sem dado'
			: [`${aLabel} ${formatValue(v.a)}`, ...(hasB(v) ? [`${bLabel} ${formatValue(v.b)}`] : [])].join(', ');

	let table = $derived({
		caption: title ?? 'Valores por UF',
		columns: ['UF', aLabel, bLabel],
		rows: layout.map((c) => [c.uf, c.v ? formatValue(c.v.a) : '—', hasB(c.v) ? formatValue(c.v.b) : '—'])
	});

	let gridTransform = $derived(`scale(${k}) translate(${-bounds.x0},${-bounds.y0})`);
	let legendOrigin = $derived(px(LEGEND_BOX.x, LEGEND_BOX.y));
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
	ariaLabel={title ?? 'Valores por UF'}
>
	{#snippet children({ container })}
		{#if plotWidth > 0}
			<g transform={gridTransform}>
				{#each layout as cell (cell.uf)}
					<path
						d={caminhoHex(cell.cx, cell.cy)}
						fill={theme.palette.base[100]}
						stroke={theme.palette.base[300]}
						stroke-width={3}
						class="fade"
						style:opacity={cellOpacity(cell.uf, cell.regiao)}
					/>
				{/each}
				<!-- The darker outline: the region in focus, or those the host emphasized. -->
				<g class="fade" style:opacity={shows(2) ? 1 : 0}>
					{#each CONTORNOS.filter((c) => outlined.has(c.regiao)) as contorno (contorno.regiao)}
						{#each contorno.arestas as [x1, y1, x2, y2], i (i)}
							<line
								{x1}
								{y1}
								{x2}
								{y2}
								stroke={theme.palette.neutral[100]}
								stroke-width={4}
								stroke-linecap="round"
							/>
						{/each}
					{/each}
				</g>
			</g>

			{#each Object.entries(REGIOES) as [regiao, r] (regiao)}
				{@const [rx, ry] = px(r.rotulo[0], r.rotulo[1])}
				<g class="fade" style:opacity={focusRegion !== null && regiao !== focusRegion ? 0.3 : 1}>
					<Text
						dx={rx}
						dy={ry}
						text={regiao}
						textAnchor="middle"
						verticalAnchor="end"
						fontSize={type.region}
						fontWeight={Tokens.fontWeight.bold}
						fill={regiao === focusRegion ? theme.palette.neutral[100] : theme.palette.neutral[300]}
					/>
				</g>
			{/each}

			{#each layout as cell (cell.uf)}
				<g class="fade" style:opacity={cellOpacity(cell.uf, cell.regiao)}>
					<Text
						dx={cell.x - S * 0.44 * k}
						dy={cell.y - MEIA_LINHA * 0.72 * k}
						text={cell.uf}
						textAnchor="start"
						verticalAnchor="middle"
						fontSize={type.uf}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>
					{#each cell.bars as b (b.stage)}
						<g class="fade" style:opacity={shows(b.stage) ? 1 : 0}>
							<BarraReferencia
								x={b.x}
								base={cell.base}
								width={bar.width}
								height={length(b.value)}
								refY={shows(2) ? cell.refY : null}
								fill={b.fill}
								excessFill={theme.palette.accent}
								radius={Math.max(1, 2.5 * k)}
							/>
							{#if k > 0.42}
								<Text
									dx={b.x + bar.width / 2}
									dy={cell.base + 3}
									text={formatValue(b.value)}
									textAnchor="middle"
									verticalAnchor="start"
									fontSize={type.value}
									fill={theme.palette.neutral[200]}
								/>
							{/if}
						</g>
					{/each}
					{#if cell.v}
						<g class="fade" style:opacity={shows(2) ? 1 : 0}>
							<line
								x1={cell.line.x1}
								x2={cell.line.x2}
								y1={cell.refY}
								y2={cell.refY}
								stroke={theme.palette.neutral[400]}
								stroke-width={Math.max(1.5, 3 * k)}
							/>
						</g>
					{/if}
				</g>
			{/each}

			{#if legendMode === 'inline'}
				<MapaHexagonalLegenda
					{reference}
					{formatValue}
					texto={legendCopy}
					{pillarId}
					x={legendOrigin[0]}
					y={legendOrigin[1]}
					scale={inlineScale}
				/>
			{:else if legendMode === 'below'}
				<MapaHexagonalLegenda
					{reference}
					{formatValue}
					texto={legendCopy}
					{pillarId}
					x={2}
					y={plotHeight + LEGEND_GAP}
					scale={belowScale}
				/>
			{/if}

			{#if interactive}
				{#each layout as cell (cell.uf)}
					<HitTarget
						{hover}
						{container}
						index={cell.index}
						x={0}
						y={0}
						d={caminhoHex(cell.cx, cell.cy)}
						transform={gridTransform}
						label="{cell.uf}: {describe(cell.v)}"
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
