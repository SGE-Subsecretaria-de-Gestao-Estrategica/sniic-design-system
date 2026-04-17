<script>
	import { useResizeObserver } from '../utils/resizeObserver.js';
	import { drawBubbleScatter } from '../charts/bubbleScatter.js';

	/** @type {{ states?: import('../charts/bubbleScatter.js').BubbleScatterRow }} */
	let { states = {} } = $props();

	let svgEl;
	let containerEl;
	let tooltipEl;

	useResizeObserver(
		() => containerEl,
		() => drawBubbleScatter(svgEl, containerEl, tooltipEl, states),
	);

	$effect(() => {
		states;
		if (svgEl) drawBubbleScatter(svgEl, containerEl, tooltipEl, states);
	});
</script>

<div bind:this={containerEl} class="chart-container">
	<svg bind:this={svgEl}></svg>
	<div class="tooltip" bind:this={tooltipEl}></div>
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
	}
	.tooltip {
		display: none;
		position: absolute;
		background: rgba(0, 0, 0, 0.92);
		color: #f8fafc;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 12px;
		pointer-events: none;
		line-height: 1.6;
		z-index: 10;
	}
</style>
