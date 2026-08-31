/**
 * Shared hover state for interactive charts.
 *
 * A chart owns one `HoverState`. The hover layer writes to it, the marks read
 * from it to lift the hovered item, and the tooltip renders from it. Keeping it
 * in one object (instead of a prop per concern) is what lets a host page drive
 * the same highlight from outside — scrollytelling steps set `index` directly.
 */

export type TooltipRow = {
	/** Series or category name. Rendered as text — never interpolated as HTML. */
	label: string;
	/** Pre-formatted value. Leads the row visually; the label follows. */
	value: string;
	/** Series colour, drawn as a short stroke key beside the row. */
	color?: string;
	/** Marks the row the pointer is actually on, when several share a tooltip. */
	emphasis?: boolean;
};

export type TooltipContent = {
	title?: string;
	rows: TooltipRow[];
};

export class HoverState {
	/** Index into the chart's hover positions, or `null` when nothing is hovered. */
	index = $state<number | null>(null);
	/** Pointer position in chart-container coordinates, for tooltip placement. */
	x = $state(0);
	y = $state(0);
	/** True while the hover came from the keyboard, so focus styling can differ. */
	keyboard = $state(false);

	active = $derived(this.index !== null);

	/** Point at `index`, positioning the tooltip at the given container coords. */
	set(index: number, x: number, y: number, keyboard = false) {
		this.index = index;
		this.x = x;
		this.y = y;
		this.keyboard = keyboard;
	}

	/** Move the tooltip without changing which datum is hovered. */
	move(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	clear() {
		this.index = null;
		this.keyboard = false;
	}

	is(index: number) {
		return this.index === index;
	}
}

/**
 * Pointer position relative to an element, which is the coordinate space an
 * absolutely-positioned tooltip inside that element needs.
 */
export function relativeTo(event: { clientX: number; clientY: number }, el: Element) {
	const rect = el.getBoundingClientRect();
	return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
