<script lang="ts">
	/**
	 * Transparent hit area for a single mark.
	 *
	 * An 8px bubble is a pinpoint nobody hits reliably, so the target is grown
	 * to at least `minSize` across and carries the focus handlers itself — the
	 * mark stays purely decorative.
	 */
	import type { HoverState } from '$lib/core/interaction/hover.svelte.js';

	type Props = {
		hover: HoverState;
		index: number;
		x: number;
		y: number;
		/** Radius of the painted mark; the target grows from here. */
		r?: number;
		/** Minimum diameter of the target, per the 24px hit-area floor. */
		minSize?: number;
		container?: HTMLElement | null;
		label?: string;
	};

	let {
		hover,
		index,
		x,
		y,
		r = 0,
		minSize = 24,
		container = null,
		label
	}: Props = $props();

	let radius = $derived(Math.max(r + 4, minSize / 2));
	let circle = $state<SVGCircleElement | null>(null);

	function toContainer(event: PointerEvent) {
		if (!container) return { x: 0, y: 0 };
		const bounds = container.getBoundingClientRect();
		return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
	}

	function onpointerenter(event: PointerEvent) {
		const point = toContainer(event);
		hover.set(index, point.x, point.y);
	}

	function onpointermove(event: PointerEvent) {
		const point = toContainer(event);
		hover.set(index, point.x, point.y);
	}

	function onfocus() {
		if (!circle || !container) {
			hover.set(index, 0, 0, true);
			return;
		}
		const bounds = circle.getBoundingClientRect();
		const host = container.getBoundingClientRect();
		hover.set(
			index,
			bounds.left - host.left + bounds.width / 2,
			bounds.top - host.top,
			true
		);
	}
</script>

<circle
	bind:this={circle}
	cx={x}
	cy={y}
	r={radius}
	fill="transparent"
	class="hit-target"
	tabindex="0"
	role="button"
	aria-label={label}
	{onpointerenter}
	{onpointermove}
	onpointerleave={() => hover.clear()}
	{onfocus}
	onblur={() => hover.clear()}
	onkeydown={(event) => event.key === 'Escape' && hover.clear()}
/>

<style>
	.hit-target {
		outline: none;
		cursor: pointer;
	}

	.hit-target:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		border-radius: 50%;
	}
</style>
