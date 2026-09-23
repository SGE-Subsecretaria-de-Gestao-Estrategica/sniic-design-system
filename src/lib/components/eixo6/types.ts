/** Shared prop shapes for the Eixo 6 chart components. */

/** One entry in a chart's series key. */
export type LegendItem = {
	label: string;
	color: string;
	/** Draws the key as a hatched circle, matching a textured reference mark. */
	hatched?: boolean;
};

/** Accessible fallback rendered off-screen by every Eixo 6 chart. */
export type TableView = {
	caption: string;
	columns: string[];
	rows: (string | number)[][];
};

/**
 * One narrative stage of a chart.
 *
 * Charts are *controlled*: the host page owns which step is active and passes
 * it in. Each chart exports its own `…_STEPS` array so a scrollytelling page
 * can build its copy from the same source the chart reads.
 */
export type ChartStep = {
	/** Stable identifier, for hosts that would rather key on a name than an index. */
	id: string;
	/** Short description of what the stage reveals. Safe to use as section copy. */
	label: string;
};

/**
 * Props every Eixo 6 chart accepts on top of its own data.
 *
 * `step` counts from 0. Pass `-1` (the default) for the finished chart with
 * everything visible, which is what Storybook and static exports want.
 */
export type ScrollytellingProps = {
	/** Active narrative stage; `-1` renders every stage at once. */
	step?: number;
	/**
	 * Series or category to emphasise, dimming the rest. Independent of `step`
	 * so a host can drive it from a hover, a filter, or scroll position.
	 */
	highlight?: string | null;
	/**
	 * Index to show the tooltip for, driving the readout from outside the
	 * chart. `null` leaves it to the pointer.
	 */
	focusIndex?: number | null;
	/** Turns off pointer/keyboard hovering, for static exports. */
	interactive?: boolean;
};

/** Layout and framing props shared by the charts. */
export type FrameProps = {
	/** Fixed width; omit to fill the container. */
	width?: number;
	height?: number;
	title?: string;
	subtitle?: string;
	source?: string;
};
