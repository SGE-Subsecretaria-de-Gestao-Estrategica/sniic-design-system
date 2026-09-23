<script lang="ts">
	/**
	 * Transparent pointer/focus target covering the whole plotting area.
	 *
	 * The reader aims at a date, not at a 2px line: the layer snaps to the
	 * nearest of `positions` and writes it to the shared `HoverState`. It is
	 * focusable and scrubbable with the arrow keys, so keyboard users get the
	 * same readout as the pointer does.
	 */
	import type { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { nearestIndex } from '$lib/core/interaction/nearest.js';

	type Props = {
		hover: HoverState;
		/** Plot-local x position of each datum, in the order the chart indexes them. */
		positions: number[];
		width: number;
		height: number;
		/** Container the tooltip is positioned inside; hover coords are relative to it. */
		container?: HTMLElement | null;
		/** Spoken name of each position, e.g. the year. Drives `aria-valuetext`. */
		labels?: string[];
		ariaLabel?: string;
	};

	let {
		hover,
		positions,
		width,
		height,
		container = null,
		labels = [],
		ariaLabel = 'Explorar valores do gráfico'
	}: Props = $props();

	let rect = $state<SVGRectElement | null>(null);

	/** Container-relative coords for the tooltip, from a pointer event. */
	function toContainer(event: PointerEvent | FocusEvent) {
		const host = container;
		if (!host || !('clientX' in event)) return null;
		const bounds = host.getBoundingClientRect();
		return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
	}

	/** Plot-local x, accounting for any CSS scaling applied to the <svg>. */
	function toPlot(event: PointerEvent) {
		if (!rect) return null;
		const bounds = rect.getBoundingClientRect();
		const scale = bounds.width === 0 ? 1 : width / bounds.width;
		return (event.clientX - bounds.left) * scale;
	}

	function onpointermove(event: PointerEvent) {
		const plotX = toPlot(event);
		if (plotX === null) return;

		const index = nearestIndex(positions, plotX);
		if (index === null) return;

		const point = toContainer(event);
		hover.set(index, point?.x ?? 0, point?.y ?? 0);
	}

	function onpointerleave() {
		hover.clear();
	}

	/** Keyboard scrubbing places the tooltip on the datum itself, not a pointer. */
	function focusIndex(index: number) {
		const clamped = Math.min(positions.length - 1, Math.max(0, index));
		if (!rect || !container) {
			hover.set(clamped, 0, 0, true);
			return;
		}
		const bounds = rect.getBoundingClientRect();
		const host = container.getBoundingClientRect();
		const scale = width === 0 ? 1 : bounds.width / width;
		hover.set(
			clamped,
			bounds.left - host.left + positions[clamped] * scale,
			bounds.top - host.top + height / 2,
			true
		);
	}

	function onfocus() {
		if (hover.index === null) focusIndex(0);
	}

	function onkeydown(event: KeyboardEvent) {
		const current = hover.index ?? 0;
		const last = positions.length - 1;

		const next = {
			ArrowRight: current + 1,
			ArrowUp: current + 1,
			ArrowLeft: current - 1,
			ArrowDown: current - 1,
			Home: 0,
			End: last
		}[event.key];

		if (next === undefined) {
			if (event.key === 'Escape') hover.clear();
			return;
		}

		event.preventDefault();
		focusIndex(next);
	}
</script>

<rect
	bind:this={rect}
	{width}
	{height}
	fill="transparent"
	class="hover-layer"
	tabindex="0"
	role="slider"
	aria-label={ariaLabel}
	aria-valuemin={0}
	aria-valuemax={Math.max(0, positions.length - 1)}
	aria-valuenow={hover.index ?? 0}
	aria-valuetext={labels[hover.index ?? 0]}
	{onpointermove}
	{onpointerleave}
	{onfocus}
	onblur={onpointerleave}
	{onkeydown}
/>

<style>
	.hover-layer {
		outline: none;
		cursor: crosshair;
		touch-action: pan-y;
	}

	.hover-layer:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
