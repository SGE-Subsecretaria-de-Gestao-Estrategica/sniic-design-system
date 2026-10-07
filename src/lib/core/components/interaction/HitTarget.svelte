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
	import { hitRadius, hitTargetHandlers } from '$lib/core/interaction/hitTarget';
	import type { HitTargetProps } from '$lib/types/HitTarget';

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
	}: HitTargetProps = $props();

	let attrs = $derived({
		fill: 'transparent',
		tabindex: 0,
		role: 'button',
		'aria-label': label,
		...hitTargetHandlers(hover, index, () => container)
	});
</script>

{#if d}
	<path {d} {transform} class="hit-target path" {...attrs} />
{:else if width !== undefined && height !== undefined}
	<rect
		{x}
		{y}
		width={Math.max(0, width)}
		height={Math.max(minSize, height)}
		class="hit-target rect"
		{...attrs}
	/>
{:else}
	<circle cx={x} cy={y} r={hitRadius(r, minSize)} class="hit-target" {...attrs} />
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
