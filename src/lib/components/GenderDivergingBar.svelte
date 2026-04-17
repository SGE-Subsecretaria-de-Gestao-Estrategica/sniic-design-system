<script>
	import { useResizeObserver } from '../utils/resizeObserver.js';
	import { drawGenderDivergingBar } from '../charts/genderDivergingBar.js';

	/**
	 * @type {{
	 *   data?: import('../charts/genderDivergingBar.js').GenderRow[],
	 *   nationalAvg?: number
	 * }}
	 */
	let { data = [], nationalAvg = 0 } = $props();

	let svgEl;
	let containerEl;

	useResizeObserver(
		() => containerEl,
		() => drawGenderDivergingBar(svgEl, containerEl, data, nationalAvg),
	);

	$effect(() => {
		data; nationalAvg;
		if (svgEl) drawGenderDivergingBar(svgEl, containerEl, data, nationalAvg);
	});
</script>

<div bind:this={containerEl} class="chart-container">
	<svg bind:this={svgEl}></svg>
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
</style>
