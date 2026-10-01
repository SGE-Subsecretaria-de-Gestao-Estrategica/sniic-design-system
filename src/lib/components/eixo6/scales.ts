/**
 * X positioning for a yearly series that may break methodologically.
 *
 * Pre- and post-break years get their own time scale separated by a visible
 * gap, so the eye never reads across the break as if it were continuous. Both
 * segments stay on one x axis — the gap is the annotation, not a second scale.
 */
import * as d3 from 'd3';
import getStringWidth from '$lib/core/utils/getStringWidth';
import { wrapText } from '$lib/core/utils/wrapText';

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
	/** `breakYear` is the first year after the break; omit it for an unbroken series. */
	{ breakYear = Infinity, gapRatio = 0.11 }: { breakYear?: number; gapRatio?: number } = {}
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
		.domain([toDate(preYears[0] ?? postYears[0]), toDate(preYears.at(-1) ?? postYears[0])])
		.range([0, preSpan]);

	const post = d3
		.scaleTime()
		.domain([toDate(postYears[0] ?? preYears.at(-1)!), toDate(postYears.at(-1) ?? preYears.at(-1)!)])
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

/**
 * How many lines a `<Text>` with this `width` will wrap `text` into.
 *
 * Row layouts need it before drawing, so a long category name in a narrow
 * gutter grows its row instead of running into the next one. It measures with
 * the same unstyled measurer `<Text>` wraps with, so the count agrees with
 * what gets drawn.
 */
export function wrappedLineCount(text: string, width: number) {
	return wrapText(text, (line) => getStringWidth(line, '') ?? line.length * 7, width).length;
}

type PaletteLike = {
	primary?: string;
	primaryVariant?: string;
	categorical?: string[];
};

/**
 * The family's sequential ramp, light to dark, in `n` steps: from a pale
 * tint of the pillar's `primary` to a deepened `primaryVariant` — the same
 * ramp the bubble charts fill by value. For maps and matrices, where the
 * value is the colour.
 */
export function sequentialRamp(palette: PaletteLike, n: number): string[] {
	const light = d3.interpolateLab(palette.primary ?? '#F6B60E', '#ffffff')(0.72);
	const dark = d3.color(palette.primaryVariant ?? '#F68E0E')?.darker(0.9).formatHex() ?? '#9a4f00';
	const ramp = d3.interpolateLab(light, dark);
	return n <= 1 ? [ramp(1)] : d3.range(n).map((i) => ramp(i / (n - 1)));
}

/**
 * One colour per series, in order, from the pillar's categorical palette —
 * its three hues first, then their lightness variants.
 */
export function seriesColors(palette: PaletteLike, n: number): string[] {
	const base = palette.categorical?.length ? palette.categorical : ['#F6B60E', '#265C4F', '#D74D2A'];
	return d3.range(n).map((i) => base[i % base.length]);
}

/**
 * Classes from ascending lower bounds: `[10, 20]` makes three classes — below
 * 10, 10 to 20, 20 and above. Returns the class of a value and a label per
 * class, from `labels` when given or from the bounds themselves.
 */
export function classesFrom(
	breaks: number[],
	format: (value: number) => string,
	labels?: string[]
) {
	const classOf = (value: number) => d3.bisectRight(breaks, value);
	const auto = [
		`menos de ${format(breaks[0])}`,
		...breaks.slice(1).map((b, i) => `${format(breaks[i])} a ${format(b)}`),
		`${format(breaks.at(-1)!)} ou mais`
	];
	return { classOf, labels: labels ?? auto, count: breaks.length + 1 };
}
