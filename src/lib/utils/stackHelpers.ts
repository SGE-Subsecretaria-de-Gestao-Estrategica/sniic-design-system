/**
 * Derives effective numeric keys from stacked data when none are explicitly provided.
 */
export function deriveEffectiveKeys(
	data: Record<string, string | number>[],
	keys: string[],
	categoryKey: string,
	extraExclusions: string[] = [],
): string[] {
	if (keys.length > 0) return keys;
	if (data.length === 0) return [];
	const excluded = new Set([categoryKey, ...extraExclusions]);
	return Object.keys(data[0]).filter(
		(k) => !excluded.has(k) && typeof data[0][k] === 'number',
	);
}

/**
 * Processes stacked data rows: coerces values to numbers, optionally
 * normalizes to percentages, and optionally sorts by a single key.
 */
export function processStackedRows(
	data: Record<string, string | number>[],
	keys: string[],
	categoryKey: string,
	options: {
		normalize?: boolean;
		sortBy?: string;
		sortDirection?: 'asc' | 'desc';
	} = {},
): Record<string, string | number>[] {
	const { normalize = false, sortBy, sortDirection = 'desc' } = options;

	let rows = data.map((d) => {
		const row: Record<string, string | number> = { [categoryKey]: d[categoryKey] };
		if (normalize) {
			const total = keys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0) || 1;
			for (const k of keys) row[k] = ((Number(d[k]) || 0) / total) * 100;
		} else {
			for (const k of keys) row[k] = Number(d[k]) || 0;
		}
		return row;
	});

	if (sortBy) {
		rows = rows.sort((a, b) => {
			const diff = (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0);
			return sortDirection === 'asc' ? -diff : diff;
		});
	}
	return rows;
}

/**
 * Computes the sum of numeric keys in a row.
 */
export function rowTotal(
	row: Record<string, string | number>,
	keys: string[],
): number {
	return keys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
}

/**
 * Sorts data rows by the sum of specified keys.
 */
export function sortByTotal(
	data: Record<string, string | number>[],
	keys: string[],
	direction: 'asc' | 'desc' = 'desc',
): Record<string, string | number>[] {
	return [...data].sort((a, b) => {
		const diff = rowTotal(b, keys) - rowTotal(a, keys);
		return direction === 'asc' ? -diff : diff;
	});
}
