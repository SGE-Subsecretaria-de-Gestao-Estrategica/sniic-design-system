import { color as d3color } from 'd3';

export interface LegendItem {
	label: string;
	color: string;
}

/**
 * A light-to-dark 5-step ramp built from a single base colour, for sequential
 * scales (choropleths, heatmaps) that should follow a theme's primary hue
 * instead of a fixed palette.
 */
export function buildSequentialRange(base: string): string[] {
	const c = d3color(base);
	if (!c) return [base, base, base, base, base];
	return [c.brighter(2.2), c.brighter(1.1), c, c.darker(0.9), c.darker(1.8)].map((s) =>
		s.toString(),
	);
}

/**
 * Maps each key to a color from the palette (wrapping around if needed).
 */
export function buildColorMap(
	keys: string[],
	colors: readonly string[],
): Record<string, string> {
	return Object.fromEntries(keys.map((key, i) => [key, colors[i % colors.length]]));
}

/**
 * Builds legend items from keys, a color map, and optional display labels.
 */
export function buildLegendItems(
	keys: string[],
	colorMap: Record<string, string>,
	labels: Record<string, string> = {},
): LegendItem[] {
	return keys.map((key) => ({ label: labels[key] ?? key, color: colorMap[key] }));
}
