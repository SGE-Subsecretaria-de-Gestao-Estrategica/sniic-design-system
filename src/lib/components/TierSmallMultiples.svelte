<script>
	import { onMount } from 'svelte';
	import { loadBrazilGeoJSON } from '../utils/geoLoader.js';
	import {
		TIER_ORDER,
		TIER_SUBTITLES,
		buildSharedColorScale,
		drawTierPanel,
	} from '../charts/tierSmallMultiples.js';

	/**
	 * @type {{
	 *   tiers?: Record<string, Record<string, object>>,
	 *   metric?: string,
	 *   format?: (v: number) => string
	 * }}
	 */
	let {
		tiers = {},
		metric = 'execucaoFinanceira',
		format = (v) => `${v.toFixed(1)}%`,
	} = $props();

	/** @type {HTMLElement[]} */
	let panelEls = $state([]);
	let containerEl;
	let geojson = $state(null);

	function drawAll() {
		if (!geojson || !panelEls.length) return;
		const { colorScale, sharedMax } = buildSharedColorScale(tiers, metric);
		TIER_ORDER.forEach((tier, i) => {
			if (panelEls[i]) {
				drawTierPanel(panelEls[i], tiers[tier] ?? {}, colorScale, sharedMax, geojson, metric, format);
			}
		});
	}

	onMount(async () => {
		geojson = await loadBrazilGeoJSON();
		drawAll();
		const ro = new ResizeObserver(() => drawAll());
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		metric; tiers;
		drawAll();
	});
</script>

<div bind:this={containerEl} class="multiples-container">
	{#each TIER_ORDER as tier, i}
		<div class="panel">
			<div class="panel-header">
				<span class="panel-title">{tier}</span>
				<span class="panel-sub">{TIER_SUBTITLES[tier]}</span>
			</div>
			<div bind:this={panelEls[i]} class="panel-map"></div>
		</div>
	{/each}
</div>

<style>
	.multiples-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	/* Last row: centre the 2 remaining panels */
	.panel:nth-child(4) {
		grid-column: 1;
	}
	.panel:nth-child(5) {
		grid-column: 2;
	}

	@media (max-width: 700px) {
		.multiples-container {
			grid-template-columns: repeat(2, 1fr);
		}
		.panel:nth-child(4),
		.panel:nth-child(5) {
			grid-column: auto;
		}
	}

	.panel {
		background: var(--color-black);
		border: 1px solid #1e1e1e;
		border-radius: 10px;
		overflow: hidden;
	}

	.panel-header {
		padding: 10px 12px 6px;
		border-bottom: 1px solid #1e1e1e;
	}

	.panel-title {
		display: block;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--color-white);
	}

	.panel-sub {
		font-size: 0.72rem;
		color: #555555;
	}

	.panel-map {
		width: 100%;
	}

	:global(.panel-map svg) {
		display: block;
		width: 100%;
	}
</style>
