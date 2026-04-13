<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { black, blue } from '../tokens.js';

	/**
	 * @typedef {Object} Props
	 * @property {Record<string, Record<string, object>>} tiers - keyed by tier label, then UF name
	 * @property {string} [metric]
	 * @property {(v: number) => string} [format]
	 */

	/** @type {Props} */
	let {
		tiers = {},
		metric = 'execucaoFinanceira',
		format = (v) => `${v.toFixed(1)}%`
	} = $props();

	const TIER_ORDER = ['Capitais', 'Grande Porte', 'Médio Porte', 'Pequeno Porte II', 'Pequeno Porte I'];
	const TIER_SUBTITLES = {
		Capitais: 'Capital estadual',
		'Grande Porte': 'Mais de 100k hab.',
		'Médio Porte': '50k – 100k hab.',
		'Pequeno Porte II': '20k – 50k hab.',
		'Pequeno Porte I': 'Até 20k hab.'
	};

	// Shared color palette across all panels (same scale = comparable)
	const COLOR_RANGE = [black, blue];

	/** @type {HTMLElement[]} */
	let panelEls = $state([]);
	let containerEl;

	/** Cached geojson */
	let _geojson = null;

	onMount(async () => {
		_geojson = await fetch('/geo/brazil-states.geojson').then((r) => r.json());
		drawAll();
		const ro = new ResizeObserver(() => drawAll());
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		metric; tiers;
		if (_geojson) drawAll();
	});

	function drawAll() {
		if (!_geojson || !panelEls.length) return;

		// Build a shared domain across all tiers for the chosen metric
		const allValues = TIER_ORDER.flatMap((tier) =>
			Object.values(tiers[tier] ?? {}).map((d) => d[metric] ?? 0)
		).filter((v) => v > 0);

		const sharedMax = d3.max(allValues) ?? 1;
		const colorScale = d3
			.scaleSequential()
			.domain([0, sharedMax])
			.interpolator(d3.interpolateRgb(COLOR_RANGE[0], COLOR_RANGE[1]));

		TIER_ORDER.forEach((tier, i) => {
			const el = panelEls[i];
			if (!el) return;
			drawPanel(el, tier, tiers[tier] ?? {}, colorScale, sharedMax);
		});
	}

	/**
	 * @param {HTMLElement} container
	 * @param {string} tier
	 * @param {Record<string, object>} data - UF → metrics
	 * @param {d3.ScaleSequential} colorScale
	 * @param {number} sharedMax
	 */
	function drawPanel(container, tier, data, colorScale, sharedMax) {
		const width = container.clientWidth;
		const height = width * 0.72;

		let svg = d3.select(container).select('svg');
		if (svg.empty()) {
			svg = d3.select(container).append('svg');
		}
		svg.attr('width', width).attr('height', height).selectAll('*').remove();

		const projection = d3.geoMercator().fitSize([width, height], _geojson);
		const path = d3.geoPath().projection(projection);

		const g = svg.append('g');

		g.selectAll('path')
			.data(_geojson.features)
			.join('path')
			.attr('d', path)
			.attr('fill', (d) => {
				const row = data[d.properties.name];
				const val = row?.[metric] ?? 0;
				return val > 0 ? colorScale(val) : black;
			})
			.attr('stroke', black)
			.attr('stroke-width', 0.5);

		// Shared gradient legend at the bottom of each panel
		const legendW = Math.min(100, width * 0.45);
		const legendH = 5;
		const lx = width / 2 - legendW / 2;
		const ly = height - 20;

		const defs = svg.append('defs');
		const gradId = `tg-${tier.replace(/\s/g, '')}-${Math.random().toString(36).slice(2)}`;
		const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
		grad.append('stop').attr('offset', '0%').attr('stop-color', COLOR_RANGE[0]);
		grad.append('stop').attr('offset', '100%').attr('stop-color', COLOR_RANGE[1]);

		const lg = svg.append('g').attr('transform', `translate(${lx},${ly})`);
		lg.append('rect').attr('width', legendW).attr('height', legendH).attr('rx', 1).attr('fill', `url(#${gradId})`);
		lg.append('text').attr('x', 0).attr('y', legendH + 10).attr('font-size', 7).attr('fill', '#555555').text(format(0));
		lg.append('text').attr('x', legendW).attr('y', legendH + 10).attr('text-anchor', 'end').attr('font-size', 7).attr('fill', '#555555').text(format(sharedMax));
	}
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

	/* Last row: 2 panels — centre them */
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
