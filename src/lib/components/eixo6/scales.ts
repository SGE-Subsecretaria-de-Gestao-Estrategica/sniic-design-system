/**
 * X positioning for the RAIS series, which breaks methodologically in 2022.
 *
 * Pre- and post-break years get their own time scale separated by a visible
 * gap, so the eye never reads across the break as if it were continuous. Both
 * segments stay on one x axis — the gap is the annotation, not a second scale.
 */
import * as d3 from 'd3';
import { RAIS_BREAK_YEAR } from './data.js';

export type BreakScale = {
	/** Scale for years before the break. */
	pre: d3.ScaleTime<number, number>;
	/** Scale for years from the break onwards. */
	post: d3.ScaleTime<number, number>;
	/** Pixel position of a year on whichever segment it belongs to. */
	x: (year: number) => number;
	isPre: (year: number) => boolean;
	preYears: number[];
	postYears: number[];
	/** Pixel span of the gap, for drawing the break annotation. */
	gap: { from: number; to: number };
};

export function createBreakScale(
	years: number[],
	width: number,
	{ breakYear = RAIS_BREAK_YEAR, gapRatio = 0.11 } = {}
): BreakScale {
	const sorted = [...new Set(years)].sort((a, b) => a - b);
	const preYears = sorted.filter((year) => year < breakYear);
	const postYears = sorted.filter((year) => year >= breakYear);

	const gapWidth = preYears.length && postYears.length ? width * gapRatio : 0;
	const usable = Math.max(0, width - gapWidth);

	// Space years evenly across both segments so the year-to-year rhythm stays
	// constant either side of the break.
	const intervals = Math.max(1, sorted.length - 1 - (postYears.length ? 1 : 0));
	const band = usable / intervals;

	const preSpan = band * Math.max(0, preYears.length - 1);
	const postStart = preYears.length ? preSpan + gapWidth : 0;

	const toDate = (year: number) => new Date(year, 0, 1);

	const pre = d3
		.scaleTime()
		.domain([toDate(preYears[0] ?? breakYear), toDate(preYears.at(-1) ?? breakYear)])
		.range([0, preSpan]);

	const post = d3
		.scaleTime()
		.domain([toDate(postYears[0] ?? breakYear), toDate(postYears.at(-1) ?? breakYear)])
		.range([postStart, width]);

	const isPre = (year: number) => year < breakYear;

	return {
		pre,
		post,
		isPre,
		preYears,
		postYears,
		x: (year: number) => (isPre(year) ? pre(toDate(year)) : post(toDate(year))),
		gap: { from: preSpan, to: postStart }
	};
}

/**
 * A y domain padded by `padding` of its own range, so lines never graze the
 * top or bottom of the plot.
 */
export function paddedExtent(values: number[], padding = 0.1): [number, number] {
	const [min = 0, max = 1] = d3.extent(values);
	const offset = (max - min) * padding || Math.abs(max) * padding || 1;
	return [min - offset, max + offset];
}

/**
 * Margins that hold up at any width.
 *
 * The right gutter always exists: end-of-line labels are how these charts name
 * their series, and dropping them at narrow widths would leave identity to
 * colour alone. It just gets narrower, and `compact` tells the chart to spend
 * it on the series name rather than the name plus its value.
 */
export function responsiveMargin(
	width: number,
	{ labelSpace = 120, compactLabelSpace = 88, compactAt = 520 } = {}
) {
	const compact = width < compactAt;
	return {
		top: 12,
		right: compact ? compactLabelSpace : labelSpace,
		bottom: 28,
		left: compact ? 12 : 24,
		compact
	};
}

/**
 * Pushes direct labels apart so end-of-line annotations never overlap.
 *
 * Four sectors that finish within a few pixels of each other would stack their
 * names on top of one another, which is the usual reason direct labelling gets
 * abandoned for a legend. One downward pass enforces the gap, then an upward
 * pass pulls the stack back inside the plot when it has run off the bottom.
 *
 * Returns the resolved y per key, in the same order as the input.
 */
export function separateLabels<T extends { key: string; y: number }>(
	items: T[],
	minGap: number,
	min = 0,
	max = Infinity
): Map<string, number> {
	const sorted = items.map((item) => ({ ...item })).sort((a, b) => a.y - b.y);

	for (let i = 1; i < sorted.length; i++) {
		const gap = sorted[i].y - sorted[i - 1].y;
		if (gap < minGap) sorted[i].y = sorted[i - 1].y + minGap;
	}

	const last = sorted.at(-1);
	if (last && last.y > max) {
		last.y = max;
		for (let i = sorted.length - 2; i >= 0; i--) {
			const gap = sorted[i + 1].y - sorted[i].y;
			if (gap < minGap) sorted[i].y = sorted[i + 1].y - minGap;
		}
	}

	// The upward pass can push the top label above the plot when the labels
	// simply do not fit; clamping is better than drawing outside the frame.
	if (sorted.length && sorted[0].y < min) {
		const shift = min - sorted[0].y;
		for (const item of sorted) item.y += shift;
	}

	return new Map(sorted.map((item) => [item.key, item.y]));
}
