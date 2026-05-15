import { typography } from '../tokens.js';

const LABEL_FONT_WEIGHT = 700;
let _measureCtx: CanvasRenderingContext2D | null = null;

/**
 * Computes a font size for segment labels that scales with the bar band height.
 * Clamps between 11px and 13px.
 */
export function segmentLabelFontSize(bandHeight: number): number {
	return Math.min(13, Math.max(11, bandHeight * 0.38));
}

/**
 * Measures text width using a canvas context.
 * Falls back to a character-width estimate on the server.
 */
export function measureTextWidth(
	text: string,
	fontSize: number,
	fontFamily: string = typography.chartValueFontFamily,
	fontWeight: number = LABEL_FONT_WEIGHT,
): number {
	if (typeof document === 'undefined') return text.length * fontSize * 0.62;
	if (!_measureCtx) {
		const c = document.createElement('canvas');
		_measureCtx = c.getContext('2d');
	}
	const ctx = _measureCtx;
	if (!ctx) return text.length * fontSize * 0.62;
	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	return ctx.measureText(text).width;
}

/**
 * Checks whether a label fits inside a bar segment of the given width,
 * accounting for left padding and right margin.
 */
/**
 * Checks whether a label fits inside a circle of the given radius.
 * Uses the horizontal chord width at the text's vertical offset to determine available space.
 */
export function labelFitsInCircle(
	text: string,
	fontSize: number,
	radius: number,
	dyFraction: number = 0,
	padding: number = 6,
): boolean {
	if (radius <= 0) return false;
	const yOffset = Math.abs(dyFraction * fontSize);
	if (yOffset >= radius) return false;
	const chordHalfWidth = Math.sqrt(radius * radius - yOffset * yOffset);
	const availableWidth = chordHalfWidth * 2;
	const textW = measureTextWidth(text, fontSize);
	return availableWidth >= textW + padding;
}

export function labelFitsInBar(
	text: string,
	fontSize: number,
	availableWidth: number,
	padding: number = 6,
	rightMargin: number = 4,
): boolean {
	if (availableWidth <= 0) return false;
	const textW = measureTextWidth(text, fontSize);
	return availableWidth >= padding + textW + rightMargin;
}
