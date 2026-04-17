<script>
	import { onMount } from 'svelte';
	import { loadBrazilGeoJSON } from '../utils/geoLoader.js';
	import { drawChoroplethMap } from '../charts/choroplethMap.js';
	import { black, blue } from '../tokens.js';

	/**
	 * @type {{
	 *   states?: Record<string, object>,
	 *   metric?: string,
	 *   label?: string,
	 *   format?: (v: number) => string,
	 *   colorRange?: string[],
	 *   activeState?: object | null,
	 *   capitals?: import('../charts/choroplethMap.js').ChoroplethCapital[],
	 *   showCapitals?: boolean
	 * }}
	 */
	let {
		states = {},
		metric = 'execucaoFinanceira',
		label = '',
		format = (v) => v.toLocaleString('pt-BR'),
		colorRange = [black, blue],
		activeState = $bindable(null),
		capitals = [],
		showCapitals = false,
	} = $props();

	let svgEl;
	let containerEl;
	let tooltipEl;
	let geojson = $state(null);

	function draw() {
		if (!svgEl || !geojson) return;
		drawChoroplethMap(svgEl, containerEl, tooltipEl, geojson, {
			states,
			metric,
			label,
			format,
			colorRange,
			showCapitals,
			capitals,
			onStateChange: (s) => { activeState = s; },
		});
	}

	onMount(async () => {
		const container = svgEl.parentElement;
		const ro = new ResizeObserver(() => draw());
		ro.observe(container);
		geojson = await loadBrazilGeoJSON();
		draw();
		return () => ro.disconnect();
	});

	$effect(() => {
		metric; states; showCapitals;
		draw();
	});
</script>

<div bind:this={containerEl} class="choropleth-wrapper">
	<svg bind:this={svgEl} role="img" aria-label={label}></svg>
	<div class="tooltip" bind:this={tooltipEl}></div>
</div>

<style>
	.choropleth-wrapper {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.tooltip {
		display: none;
		position: absolute;
		background: rgba(0, 0, 0, 0.92);
		color: var(--color-white);
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 12px;
		pointer-events: none;
		line-height: 1.6;
		max-width: 220px;
		z-index: 10;
	}
</style>
