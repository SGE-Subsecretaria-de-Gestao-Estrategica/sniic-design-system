<script lang="ts">
	/**
	 * Legenda do mapa hexagonal: um hexágono de amostra com as duas barras e a
	 * referência, e cada elemento apontado por uma seta tracejada até o texto
	 * que o explica — a altura da barra, a parte que passa da referência, o
	 * valor da referência e qual barra é qual.
	 *
	 * `MapaHexagonalChart` desenha esta legenda no canto vazio do mapa (ou abaixo
	 * dele, em colunas estreitas). Com `standalone` ela tem o próprio `<svg>`,
	 * para o host que passa `legend="none"` ao mapa e a põe em outro lugar.
	 */
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import BarraReferencia from './BarraReferencia.svelte';
	import { LEGENDA_FONT, LEGENDA_TEXTO_PADRAO, layoutLegenda, type Block } from './mapaHexagonalLegenda.js';
	import type { MapaHexagonalLegendaTexto } from './data.js';

	type Props = {
		/** The value of the reference line, printed large. */
		reference: number;
		/** Sample values: the left bar clears the reference, the right one does not. */
		a?: number;
		b?: number;
		formatValue?: (value: number) => string;
		/** Copy; anything left out keeps the default. */
		texto?: Partial<MapaHexagonalLegendaTexto>;
		/** Wraps the legend in its own `<svg>`, to place it outside the map. */
		standalone?: boolean;
		/** Position and scale inside a parent `<svg>`. Ignored when standalone. */
		x?: number;
		y?: number;
		scale?: number;
		pillarId?: number;
	};

	let {
		reference,
		a,
		b,
		formatValue = (value: number) => `${Math.round(value)}%`,
		texto = {},
		standalone = false,
		x = 0,
		y = 0,
		scale = 1,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	let copy = $derived({ ...LEGENDA_TEXTO_PADRAO, ...texto });
	let sampleA = $derived(a ?? reference * 1.8);
	let sampleB = $derived(b ?? reference * 0.83);
	let l = $derived(layoutLegenda(copy, { reference, a: sampleA, b: sampleB }));

	let colors = $derived({
		a: theme.palette.secondary,
		b: theme.palette.primary,
		excess: theme.palette.accent,
		line: theme.palette.neutral[400],
		text: theme.palette.neutral[300],
		muted: theme.palette.neutral[200],
		arrow: theme.palette.neutral[100],
		hex: theme.palette.base[300]
	});

	let ariaLabel = $derived(
		`${copy.title}: ${copy.totalLabel} ${copy.totalText}. ${copy.excessLabel} ${copy.excessText}. ` +
			`${formatValue(reference)} ${copy.referenceText}. ${copy.aLabel} ${copy.aText}. ${copy.bLabel} ${copy.bText}.`
	);
	let ariaText = $derived(ariaLabel.replaceAll('**', ''));

	const hexPath = (cx: number, cy: number, r: number) =>
		`M${[0, 60, 120, 180, 240, 300]
			.map((g) => {
				const rad = (g * Math.PI) / 180;
				return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
			})
			.join('L')}Z`;
</script>

{#snippet text(block: Block, leadColor: string)}
	{#each block.lines as line, i (i)}
		<text
			x={block.x}
			y={block.y + i * l.lh}
			text-anchor={block.anchor}
			font-size={LEGENDA_FONT.body}
			fill={i < block.labelLines ? leadColor : colors.text}
		>
			{#each line as word, j (j)}<tspan font-weight={word.bold ? Tokens.fontWeight.bold : Tokens.fontWeight.regular}
					>{j ? ' ' : ''}{word.text}</tspan
				>{/each}
		</text>
	{/each}
{/snippet}

{#snippet legenda()}
	<g font-family={Tokens.fontFamily}>
		<text y={LEGENDA_FONT.title} font-size={LEGENDA_FONT.title} font-weight={Tokens.fontWeight.semibold} fill={colors.text}
			>{copy.title}</text
		>

		<!-- A bar's two parts, and the bracket that measures them together. -->
		<rect x={l.swatch.x} y={l.swatch.y} width={l.swatch.width} height={l.swatch.excess} fill={colors.excess} />
		<rect
			x={l.swatch.x}
			y={l.swatch.y + l.swatch.excess}
			width={l.swatch.width}
			height={l.swatch.below}
			fill={colors.a}
		/>
		<path
			d="M31,{l.swatch.y}H37M34,{l.swatch.y}V{l.swatch.y + l.swatch.excess + l.swatch.below}M31,{l.swatch.y +
				l.swatch.excess +
				l.swatch.below}H37"
			stroke={colors.muted}
			stroke-width="1"
			fill="none"
		/>
		{@render text(l.total, colors.text)}

		<!-- The sample cell. -->
		<path d={hexPath(l.hex.x, l.hex.y, l.hex.r)} fill={theme.palette.base[100]} stroke={colors.hex} stroke-width="2.5" />
		<text
			x={l.hex.x}
			y={l.hex.y - 30}
			text-anchor="middle"
			font-size={LEGENDA_FONT.sample}
			font-weight={Tokens.fontWeight.bold}
			fill={colors.text}>{copy.sampleLabel}</text
		>
		<BarraReferencia
			x={l.aX}
			base={l.base}
			width={l.bar.width}
			height={l.lengthA}
			refY={l.refY}
			fill={colors.a}
			excessFill={colors.excess}
		/>
		<BarraReferencia
			x={l.bX}
			base={l.base}
			width={l.bar.width}
			height={l.lengthB}
			refY={l.refY}
			fill={colors.b}
			excessFill={colors.excess}
		/>
		<line x1={l.line.x1} x2={l.line.x2} y1={l.line.y} y2={l.line.y} stroke={colors.line} stroke-width="2.5" />
		{#each [[l.aX, sampleA], [l.bX, sampleB]] as [bx, v], i (i)}
			<text
				x={bx + l.bar.width / 2}
				y={l.valueY}
				text-anchor="middle"
				font-size={LEGENDA_FONT.value}
				fill={colors.muted}>{formatValue(v)}</text
			>
		{/each}

		<!-- What each element means. -->
		{@render text(l.excess, colors.excess)}
		<text
			x={l.reference.x}
			y={l.reference.y}
			font-size={LEGENDA_FONT.reference}
			font-weight={Tokens.fontWeight.semibold}
			fill={colors.text}>{formatValue(reference)}</text
		>
		{@render text(l.referenceText, colors.text)}
		{@render text(l.left, colors.text)}
		{@render text(l.right, colors.text)}

		{#each l.arrows as arrow, i (i)}
			<path d={arrow.d} fill="none" stroke={colors.arrow} stroke-width="1.2" stroke-dasharray="3 3" />
			<path d={arrow.head} fill="none" stroke={colors.arrow} stroke-width="1.2" stroke-linecap="round" />
		{/each}
	</g>
{/snippet}

{#if standalone}
	<svg
		viewBox="-2 0 {l.width + 4} {l.height}"
		width="100%"
		style:max-width="{l.width + 4}px"
		style:display="block"
		role="img"
		aria-label={ariaText}
	>
		{@render legenda()}
	</svg>
{:else}
	<g transform="translate({x},{y}) scale({scale})" aria-hidden="true">
		{@render legenda()}
	</g>
{/if}
