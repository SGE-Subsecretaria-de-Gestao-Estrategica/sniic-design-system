export interface LegendItem {
	label: string;
	color: string;
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
