<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tooltip from './Tooltip.svelte';
	import { relativePos, TOOLTIP_INITIAL, type TooltipState } from '../../utils/tooltipState.js';

	export interface TooltipHelpers {
		show: (e: MouseEvent, html: string) => void;
		move: (e: MouseEvent) => void;
		hide: () => void;
		wrapperEl: HTMLDivElement | undefined;
	}

	interface Props {
		offsetX?: number;
		offsetY?: number;
		children?: Snippet<[TooltipHelpers]>;
	}

	let {
		offsetX = 12,
		offsetY = -28,
		children,
	}: Props = $props();

	let wrapperEl: HTMLDivElement | undefined = $state();
	let tooltip: TooltipState = $state({ ...TOOLTIP_INITIAL });

	function show(e: MouseEvent, html: string) {
		if (!wrapperEl) return;
		tooltip = { visible: true, ...relativePos(e, wrapperEl), html };
	}

	function move(e: MouseEvent) {
		if (!wrapperEl) return;
		tooltip = { ...tooltip, ...relativePos(e, wrapperEl) };
	}

	function hide() {
		tooltip = { ...TOOLTIP_INITIAL };
	}
</script>

<div bind:this={wrapperEl} class="chart-tooltip-wrapper">
	{@render children?.({ show, move, hide, wrapperEl })}
	<Tooltip {...tooltip} {offsetX} {offsetY} />
</div>

<style>
	.chart-tooltip-wrapper {
		position: relative;
		width: 100%;
	}
</style>
