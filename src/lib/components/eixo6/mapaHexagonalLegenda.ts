/**
 * Layout of `MapaHexagonalLegenda`, apart from the component so the map can
 * know the legend's height before drawing it (to fit it in the map's empty
 * corner, or to stack it below).
 *
 * Everything is in the legend's own px, at scale 1; whoever draws it scales.
 */
import { Tokens } from '$lib/core/theme';
import { measureTextWidth } from '$lib/utils/labelHelpers';
import type { MapaHexagonalLegendaTexto } from './data.js';

export const LEGENDA_WIDTH = 440;

export const LEGENDA_FONT = {
	title: 19,
	body: 14,
	reference: 26,
	sample: 14,
	value: 11
} as const;
const LINE = 18;

export const LEGENDA_TEXTO_PADRAO: MapaHexagonalLegendaTexto = {
	title: 'Legenda',
	sampleLabel: 'UFs',
	totalLabel: 'Altura total de cada barra:',
	totalText: 'O valor da medida (%)',
	excessLabel: 'Parte em vermelho:',
	excessText: 'Marca quanto o valor supera a referência',
	referenceText: 'a referência, a mesma em todas as UFs',
	aLabel: 'À esquerda:',
	aText: 'O primeiro valor',
	bLabel: 'À direita:',
	bText: 'O segundo valor'
};

export type Word = { text: string; bold: boolean };
/** A wrapped block: its lines, each a run of words, and the first baseline. */
export type Block = {
	lines: Word[][];
	/** How many of the lines are the bold lead-in. */
	labelLines: number;
	x: number;
	y: number;
	anchor: 'start' | 'end';
};

/** Splits copy into words, `**…**` toggling bold. */
export function words(source: string, bold = false): Word[] {
	return source
		.split('**')
		.flatMap((part, i) =>
			part
				.split(/\s+/)
				.filter(Boolean)
				.map((text) => ({ text, bold: bold !== (i % 2 === 1) }))
		);
}

const measure = (line: Word[], size: number) =>
	line.reduce(
		(sum, w, i) =>
			sum +
			measureTextWidth(w.text, size, Tokens.fontFamily, w.bold ? Tokens.fontWeight.bold : Tokens.fontWeight.regular) +
			(i ? size * 0.28 : 0),
		0
	);

function wrap(ws: Word[], size: number, maxWidth: number): Word[][] {
	const lines: Word[][] = [];
	let current: Word[] = [];
	for (const w of ws) {
		if (current.length && measure([...current, w], size) > maxWidth) {
			lines.push(current);
			current = [w];
		} else current.push(w);
	}
	if (current.length) lines.push(current);
	return lines;
}

/** A bold lead-in followed by its explanation, wrapped to `maxWidth`. */
function block(label: string, text: string, maxWidth: number) {
	const head = wrap(words(label, true), LEGENDA_FONT.body, maxWidth);
	return { lines: [...head, ...wrap(words(text), LEGENDA_FONT.body, maxWidth)], labelLines: head.length };
}

/** A dashed pointer: a quadratic curve and the chevron at its end. */
export type Arrow = { d: string; head: string };
function arrow(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number): Arrow {
	const len = Math.hypot(x1 - cx, y1 - cy) || 1;
	const [ux, uy] = [(x1 - cx) / len, (y1 - cy) / len];
	const [px, py] = [-uy, ux];
	const back = [x1 - ux * 6, y1 - uy * 6];
	return {
		d: `M${x0},${y0}Q${cx},${cy} ${x1},${y1}`,
		head: `M${back[0] + px * 4},${back[1] + py * 4}L${x1},${y1}L${back[0] - px * 4},${back[1] - py * 4}`
	};
}

export function layoutLegenda(
	texto: MapaHexagonalLegendaTexto,
	{ reference, a, b }: { reference: number; a: number; b: number }
) {
	const lh = LINE;

	// Top: the swatch, its bracket, and what the bar's height means.
	const swatch = { x: 0, y: 34, width: 24, excess: 16, below: 24 };
	const swatchBottom = swatch.y + swatch.excess + swatch.below;
	const total: Block = { ...block(texto.totalLabel, texto.totalText, 250), x: 48, y: swatch.y + 12, anchor: 'start' };
	const topBottom = Math.max(swatchBottom, swatch.y + total.lines.length * lh);

	// The sample hexagon, with one bar past the reference and one short of it.
	const hex = { x: 150, y: topBottom + 44 + 54, r: 62 };
	const halfHeight = (Math.sqrt(3) / 2) * hex.r;
	const bar = { width: 20, gap: 4 };
	const base = hex.y + 20;
	const refPx = 26;
	const length = (v: number) => Math.min(44, Math.max(0, (v / (reference || 1)) * refPx));
	const aX = hex.x - bar.gap / 2 - bar.width;
	const bX = hex.x + bar.gap / 2;
	const refY = base - refPx;
	const aTop = base - length(a);
	const line = { x1: aX - 10, x2: bX + bar.width + 10, y: refY };
	const valueY = base + 15;

	// Right column: what the red part means, then the reference, printed large.
	const rx = hex.x + hex.r + 26;
	const rw = LEGENDA_WIDTH - rx;
	const excess: Block = { ...block(texto.excessLabel, texto.excessText, rw), x: rx, y: hex.y - 78, anchor: 'start' };
	const excessBottom = excess.y + (excess.lines.length - 1) * lh;
	const referenceY = Math.max(excessBottom + 38, hex.y + 30);
	const referenceLines = wrap(words(texto.referenceText), LEGENDA_FONT.body, rw);
	const referenceText: Block = { lines: referenceLines, labelLines: 0, x: rx, y: referenceY + lh + 2, anchor: 'start' };
	const referenceBottom = referenceText.y + (referenceLines.length - 1) * lh;

	// Bottom: which bar is which, either side of the hexagon's centre.
	const bottomY = hex.y + halfHeight + 52;
	const left: Block = { ...block(texto.aLabel, texto.aText, hex.x - 6), x: hex.x - 4, y: bottomY, anchor: 'end' };
	const right: Block = { ...block(texto.bLabel, texto.bText, rx - hex.x - 20), x: hex.x + 4, y: bottomY, anchor: 'start' };
	const bottom = bottomY + (Math.max(left.lines.length, right.lines.length) - 1) * lh;

	const redMid = aTop < refY ? (aTop + refY) / 2 : refY - 4;
	const arrows = [
		arrow(swatch.width / 2, swatchBottom + 8, swatch.width / 2, aTop + 4, aX - 6, aTop + 4),
		arrow(rx - 6, excess.y + lh - 4, rx - 34, redMid, aX + bar.width + 6, redMid),
		arrow(rx - 8, referenceY - 8, line.x2 + 24, referenceY - 8, line.x2 + 5, refY + 3),
		arrow(hex.x - 22, bottomY - 16, hex.x - 26, valueY + 18, aX + bar.width / 2 - 2, valueY + 5),
		arrow(hex.x + 16, bottomY - 16, hex.x + 14, valueY + 18, bX + bar.width / 2 + 1, valueY + 5)
	];

	return {
		width: LEGENDA_WIDTH,
		height: Math.max(bottom, referenceBottom) + 6,
		lh,
		swatch,
		total,
		hex,
		bar,
		base,
		aX,
		bX,
		lengthA: length(a),
		lengthB: length(b),
		refY,
		line,
		valueY,
		excess,
		reference: { x: rx, y: referenceY },
		referenceText,
		left,
		right,
		arrows
	};
}
