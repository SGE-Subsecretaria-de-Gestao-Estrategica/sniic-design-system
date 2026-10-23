<script lang="ts">
	/**
	 * Barra de partição: as partes de um todo como linhas de barras, todas do
	 * mesmo zero, cada uma sobre um trilho claro que vale o todo (100%). Uma
	 * parte com pedaços é seguida de uma linha mais fina por pedaço, sobre um
	 * trilho do comprimento da parte.
	 *
	 * Made for the "of those that have it, how many…" sentence: 63.2% of
	 * schools have no library; of the 36.8% that do, 56.5% have no librarian.
	 * The pieces stay on the whole's scale — their bars add up to their
	 * part's — while their track shows the part they are a share of, so the
	 * second percentage reads against the right base. The bars are the
	 * ranking's: `CapsuleBar`, one hue, names in the gutter, values in a
	 * column past the 100% end.
	 *
	 * The geometry is `partitionBarsLayout` and the drawing `PartitionBars`,
	 * the same pair the builder uses.
	 */
	import PartitionBars from '$lib/core/components/partitionBars/PartitionBars.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { partitionBarsLayout } from '$lib/core/layouts/partitionBars';
	import type { PartitionRow } from '$lib/core/layouts/partitionBars';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatCompactNumber, formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { BarraParticaoLinha } from './data.js';
	import { wrappedLineCount } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: BarraParticaoLinha[];
			/** Text of a share (0–1), in the value column and the tooltip. */
			formatShare?: (share: number) => string;
			/** Text of an absolute value, in the tooltip and the table. */
			formatValue?: (value: number) => string;
			/** Written after a piece's share, which is of its part: "56,5% da parte". */
			pieceSuffix?: string;
			/** What the values count — tooltip, table and screen-reader copy. */
			valueLabel?: string;
			/** Header of the whole column, in the accessible table. */
			rowLabel?: string;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	const pct1 = formatLocale.format('.1%');

	let {
		data,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		formatShare = (share: number) => pct1(share),
		formatValue = (value: number) => formatCompactNumber(value, value >= 1e6 ? 1 : 0),
		pieceSuffix = 'da parte',
		valueLabel = 'Valor',
		rowLabel = 'Todo',
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();

	/** A stage shows once the reader has reached it; `-1` shows everything. */
	const shows = (stage: number) => step < 0 || step >= stage;

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	// The ranking's measures, so the two read as one family.
	let compact = $derived(shellWidth < 520);
	let gutter = $derived(compact ? 104 : 176);
	let labelSize = $derived(Tokens.fontSize[compact ? 'sm' : 'md']);
	let pieceSize = $derived(Tokens.fontSize[compact ? 'xs' : 'sm']);
	let labelWidth = $derived(gutter - Tokens.spacing.md);
	let thickness = $derived(compact ? 24 : 32);
	let rowGap = $derived(compact ? 12 : 16);
	let pieceGap = $derived(compact ? 6 : 8);
	let margin = $derived({ top: 4, right: 4, bottom: 4, left: gutter });
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));

	type Tidy = { whole: string; part: string; sub: string; value: number };
	/** Long rows, one per piece (or per part without pieces), for the layout. */
	let tidy = $derived(
		data.flatMap((line) =>
			line.parts.flatMap((part): Tidy[] =>
				part.parts?.length
					? part.parts.map((p) => ({ whole: line.label ?? '', part: part.label, sub: p.label, value: p.value }))
					: [{ whole: line.label ?? '', part: part.label, sub: '', value: part.value ?? 0 }]
			)
		)
	);

	/** A part's row grows for a name that wraps, as in the ranking. */
	let tallestName = $derived(
		Math.max(0, ...tidy.map((d) => wrappedLineCount(d.part, labelWidth) * labelSize * 1.1))
	);

	let layout = $derived(
		partitionBarsLayout(tidy, {
			getCategory: (d) => d.whole,
			getPart: (d) => d.part,
			getSubpart: (d) => d.sub,
			getValue: (d) => d.value,
			width: plotWidth,
			barThickness: Math.max(thickness, tallestName),
			pieceThickness: Math.round(thickness * 0.6),
			rowGap,
			pieceGap,
			headerHeight: labelSize * 2.2,
			valueSpace: compact ? 80 : 112
		})
	);

	/** Height follows the rows unless the host pins it. */
	let figureHeight = $derived(height ?? layout.height + margin.top + margin.bottom);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeRow = $derived(activeIndex === null ? null : (layout.rows[activeIndex] ?? null));

	/** `highlight` names a part or a piece; a part keeps its pieces lit. */
	function dimmed(row: PartitionRow) {
		return highlight !== null && highlight !== row.label && highlight !== row.part;
	}

	function valueText(row: PartitionRow) {
		const share = formatShare(row.share);
		return row.kind === 'piece' && pieceSuffix ? `${share} ${pieceSuffix}` : share;
	}

	let named = $derived(layout.blocks.some((b) => b.header));

	let tooltip = $derived(
		activeRow
			? {
					title: activeRow.kind === 'piece' ? `${activeRow.part} · ${activeRow.label}` : activeRow.label,
					rows: [
						{
							label: activeRow.kind === 'piece' ? `Parcela de ${activeRow.part.toLowerCase()}` : 'Parcela do total',
							value: formatShare(activeRow.share),
							color: theme.palette.primaryVariant,
							emphasis: true
						},
						...(activeRow.kind === 'piece'
							? [{ label: 'Parcela do total', value: formatShare(activeRow.shareOfTotal) }]
							: []),
						{ label: valueLabel, value: formatValue(activeRow.value) },
						...(named ? [{ label: rowLabel, value: activeRow.whole }] : [])
					]
				}
			: null
	);

	let table = $derived({
		caption: title ?? `${valueLabel} por parte`,
		columns: [...(named ? [rowLabel] : []), 'Parte', valueLabel, 'Parcela do total', 'Parcela da parte'],
		rows: layout.rows.map((row) => [
			...(named ? [row.whole] : []),
			row.kind === 'piece' ? `${row.part} · ${row.label}` : row.label,
			formatValue(row.value),
			formatShare(row.shareOfTotal),
			row.kind === 'piece' ? formatShare(row.share) : '—'
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
	{table}
	ariaLabel={title ?? `${valueLabel} por parte`}
>
	{#snippet children({ container })}
		{#if layout.rows.length && plotWidth > 0}
			<PartitionBars
				class="particao"
				{layout}
				fontSize={labelSize}
				pieceFontSize={pieceSize}
				fontWeight={Tokens.fontWeight.medium}
				valueWeight={Tokens.fontWeight.semibold}
				labelFill={theme.palette.neutral[300]}
				categoryWidth={labelWidth}
				headerLeft={-gutter}
				formatValue={valueText}
				rowOpacity={(row) => (dimmed(row) ? 0.25 : 1)}
				piecesOpacity={shows(1) ? 1 : 0}
				baselineStroke={theme.palette.base[300]}
				baselineWidth={Tokens.strokeWidth.md}
			/>

			{#if interactive}
				{#each layout.rows as row (row.key)}
					<!-- The whole row answers the pointer, name included; hidden pieces don't. -->
					{#if row.kind === 'part' || shows(1)}
						<HitTarget
							{hover}
							{container}
							index={row.index}
							x={-gutter}
							y={row.y - (row.kind === 'part' ? rowGap : pieceGap) / 2}
							width={gutter + plotWidth + margin.right}
							height={row.thickness + (row.kind === 'part' ? rowGap : pieceGap)}
							label="{row.label}: {valueText(row)}"
						/>
					{/if}
				{/each}
			{/if}
		{/if}
	{/snippet}
</ChartShell>

<style>
	/* One pattern for every reveal and dim: the element owns its opacity,
	   this owns the easing. */
	:global(.particao .partition-bars__row) {
		transition: opacity 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.particao .partition-bars__row) {
			transition: none;
		}
	}
</style>
