<script>
	import { useResizeObserver } from '../utils/resizeObserver.js';
	import { drawAgeGroupChart } from '../charts/ageGroupChart.js';

	/** @type {{ data?: import('../charts/ageGroupChart.js').StateAgeRow[] }} */
	let { data = [] } = $props();

	let svgEl;
	let containerEl;

	useResizeObserver(() => containerEl, () => drawAgeGroupChart(svgEl, containerEl, data));

	$effect(() => {
		data;
		if (svgEl) drawAgeGroupChart(svgEl, containerEl, data);
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
	}
</style>
