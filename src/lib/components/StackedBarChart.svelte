<script>
	import { useResizeObserver } from '../utils/resizeObserver.js';
	import { drawStackedBarChart } from '../charts/stackedBarChart.js';

	/** @type {{ data?: import('../charts/stackedBarChart.js').StackedBarRow[] }} */
	let { data = [] } = $props();

	let svgEl;
	let containerEl;

	useResizeObserver(() => containerEl, () => drawStackedBarChart(svgEl, containerEl, data));

	$effect(() => {
		data;
		if (svgEl) drawStackedBarChart(svgEl, containerEl, data);
	});
</script>

<div bind:this={containerEl} class="chart-container">
	<svg bind:this={svgEl}></svg>
</div>

<style>
	.chart-container {
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		overflow: visible;
	}
</style>
