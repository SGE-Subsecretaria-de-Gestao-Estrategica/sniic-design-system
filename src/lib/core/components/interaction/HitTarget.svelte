<script lang="ts">
	/**
	 * Transparent hit area for a single mark.
	 *
	 * An 8px bubble is a pinpoint nobody hits reliably, so the target is grown
	 * to at least `minSize` across and carries the focus handlers itself — the
	 * mark stays purely decorative.
	 *
	 * Given `width` and `height`, the target is a rect instead, anchored at its
	 * top-left `x`/`y` — for a bar, whose whole row should answer the pointer.
	 * Given `d`, it is that path — a map region answering over its own outline.
	 */
	import type { HoverState } from '$lib/core/interaction/hover.svelte.js';

	type Props = {
		hover: HoverState;
		index: number;
		x: number;
		y: number;
		/** Radius of the painted mark; the target grows from here. */
		r?: number;
		/** Rect target: its size, with `x`/`y` as the top-left corner. */
		width?: number;
		height?: number;
		/** Path target: an SVG path in the same coordinates as the mark it covers. */
		d?: string;
		/** Extra transform for a path target drawn in another coordinate space. */
		transform?: string;
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
		width,
		height,
		d,
		transform,
		minSize = 24,
		container = null,
		label
	}: Props = $props();

	let radius = $derived(Math.max(r + 4, minSize / 2));
	let target = $state<SVGGraphicsElement | null>(null);
	let isRect = $derived(width !== undefined && height !== undefined);

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
		if (!target || !container) {
			hover.set(index, 0, 0, true);
			return;
		}
		const bounds = target.getBoundingClientRect();
		const host = container.getBoundingClientRect();
		hover.set(
			index,
			bounds.left - host.left + bounds.width / 2,
			bounds.top - host.top,
			true
		);
	}
</script>

{#if d}
	<path
		bind:this={target}
		{d}
		{transform}
		fill="transparent"
		class="hit-target path"
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
{:else if isRect}
	<rect
		bind:this={target}
		{x}
		{y}
		width={Math.max(0, width ?? 0)}
		height={Math.max(minSize, height ?? 0)}
		fill="transparent"
		class="hit-target rect"
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
{:else}
	<circle
		bind:this={target}
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
{/if}

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

	.hit-target.path:focus-visible {
		outline: none;
		stroke: currentColor;
		stroke-width: 2px;
		vector-effect: non-scaling-stroke;
	}

	.hit-target.rect:focus-visible {
		border-radius: 4px;
	}
</style>
