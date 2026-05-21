export interface BoxStats {
	min: number;
	q1: number;
	median: number;
	q3: number;
	max: number;
	outliers?: number[];
}

export interface BoxSeries {
	label: string;
	/** Pre-computed statistics. If omitted, `values` must be provided. */
	stats?: BoxStats;
	/** Raw values — statistics will be computed via `computeBoxStats`. */
	values?: number[];
}

function quantile(sorted: number[], p: number): number {
	const h = (sorted.length - 1) * p;
	const lo = Math.floor(h);
	const hi = Math.ceil(h);
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}

/**
 * Computes box-plot statistics from a raw array of numbers.
 * Outliers are defined as values beyond `iqrFactor` × IQR from the box edges.
 */
export function computeBoxStats(values: number[], iqrFactor = 1.5): BoxStats {
	if (values.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };

	const sorted = [...values].sort((a, b) => a - b);
	const q1 = quantile(sorted, 0.25);
	const median = quantile(sorted, 0.5);
	const q3 = quantile(sorted, 0.75);
	const iqr = q3 - q1;
	const lowerFence = q1 - iqrFactor * iqr;
	const upperFence = q3 + iqrFactor * iqr;

	const nonOutliers = sorted.filter((v) => v >= lowerFence && v <= upperFence);
	const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

	return {
		min: nonOutliers.length > 0 ? nonOutliers[0] : sorted[0],
		q1,
		median,
		q3,
		max: nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : sorted[sorted.length - 1],
		outliers: outliers.length > 0 ? outliers : undefined,
	};
}
