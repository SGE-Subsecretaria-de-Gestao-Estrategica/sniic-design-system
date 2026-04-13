<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { black, white, blue, red, amber, green } from '../tokens.js';

	/**
	 * @typedef {Object} Capital
	 * @property {string} uf
	 * @property {string} city
	 * @property {number} lat
	 * @property {number} lng
	 * @property {number} execucaoFinanceira
	 * @property {number} valorRecebido
	 * @property {number} valorPerCapita
	 * @property {number} qtdFomentos
	 * @property {number} valorMedio
	 * @property {number} pctValorFeminino
	 *
	 * @typedef {Object} Props
	 * @property {Record<string, object>} states - state data keyed by UF name
	 * @property {string} metric - key on each state object to visualize
	 * @property {string} [label] - human-readable metric label
	 * @property {(v: number) => string} [format] - value formatter
	 * @property {string[]} [colorRange] - two-color range for the scale
	 * @property {object|null} [activeState] - currently hovered/selected state
	 * @property {Capital[]} [capitals] - optional capital city bubbles overlay
	 * @property {boolean} [showCapitals] - whether to render the bubble layer
	 */

	/** @type {Props} */
	let {
		states = {},
		metric = 'execucaoFinanceira',
		label = '',
		format = (v) => v.toLocaleString('pt-BR'),
		colorRange = [black, blue],
		activeState = $bindable(null),
		capitals = [],
		showCapitals = false
	} = $props();

	let svgEl;
	let tooltipEl;
	let width = $state(800);
	let height = $state(560);

	const BRL = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0
	});

	/** @type {Map<string, number>} */
	let valueByName = $derived(
		new Map(Object.entries(states).map(([name, d]) => [name, d[metric] ?? 0]))
	);

	let colorScale = $derived.by(() => {
		const values = [...valueByName.values()].filter((v) => v > 0);
		return d3
			.scaleSequential()
			.domain([0, d3.max(values) ?? 1])
			.interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]));
	});

	// Exec-rate color for capital bubbles (red→yellow→green)
	const execColor = d3
		.scaleSequential()
		.domain([80, 100])
		.interpolator(d3.interpolateRgbBasis([red, amber, green]))
		.clamp(true);

	onMount(async () => {
		const container = svgEl.parentElement;
		const ro = new ResizeObserver((entries) => {
			width = entries[0].contentRect.width;
			height = width * 0.7;
			draw();
		});
		ro.observe(container);
		width = container.clientWidth;
		height = width * 0.7;
		await draw();
		return () => ro.disconnect();
	});

	$effect(() => {
		metric; states; showCapitals;
		if (svgEl) draw();
	});

	/** Cached geojson so we only fetch once */
	let _geojson = null;

	async function draw() {
		if (!svgEl) return;

		if (!_geojson) {
			_geojson = await fetch('/geo/brazil-states.geojson').then((r) => r.json());
		}

		const projection = d3.geoMercator().fitSize([width, height], _geojson);
		const path = d3.geoPath().projection(projection);

		const svg = d3.select(svgEl).attr('width', width).attr('height', height);
		svg.selectAll('*').remove();

		const g = svg.append('g');

		// ── State polygons ────────────────────────────────────────────────────
		g.selectAll('path')
			.data(_geojson.features)
			.join('path')
			.attr('d', path)
			.attr('fill', (d) => {
				const val = valueByName.get(d.properties.name);
				return val != null && val > 0 ? colorScale(val) : black;
			})
			.attr('stroke', black)
			.attr('stroke-width', 0.6)
			.style('cursor', 'pointer')
			.on('mouseenter', (event, d) => {
				const name = d.properties.name;
				activeState = states[name] ?? null;
				d3.select(event.currentTarget).raise().attr('stroke', white).attr('stroke-width', 1.5);
				if (tooltipEl && activeState) {
					const val = valueByName.get(name) ?? 0;
					tooltipEl.innerHTML = `<strong>${name}</strong><br/>${label}: ${format(val)}`;
					tooltipEl.style.display = 'block';
				}
			})
			.on('mousemove', (event) => {
				if (!tooltipEl) return;
				const [mx, my] = d3.pointer(event, svgEl.parentElement);
				tooltipEl.style.left = mx + 12 + 'px';
				tooltipEl.style.top = my - 28 + 'px';
			})
			.on('mouseleave', (event) => {
				activeState = null;
				d3.select(event.currentTarget).attr('stroke', black).attr('stroke-width', 0.6);
				if (tooltipEl) tooltipEl.style.display = 'none';
			});

		// ── Capital bubbles layer ─────────────────────────────────────────────
		if (showCapitals && capitals.length) {
			const maxVal = d3.max(capitals, (d) => d.valorRecebido) ?? 1;
			const r = d3.scaleSqrt().domain([0, maxVal]).range([4, 22]);

			const bubbleG = g.append('g').attr('class', 'capitals-layer');

			const nodes = bubbleG
				.selectAll('.capital')
				.data(capitals)
				.join('g')
				.attr('class', 'capital')
				.attr('transform', (d) => {
					const [x, y] = projection([d.lng, d.lat]) ?? [0, 0];
					return `translate(${x},${y})`;
				})
				.style('cursor', 'pointer');

			// Outer glow ring
			nodes
				.append('circle')
				.attr('r', (d) => r(d.valorRecebido) + 3)
				.attr('fill', 'none')
				.attr('stroke', (d) => execColor(d.execucaoFinanceira))
				.attr('stroke-width', 1.5)
				.attr('opacity', 0.5);

			// Main bubble
			nodes
				.append('circle')
				.attr('r', (d) => r(d.valorRecebido))
				.attr('fill', (d) => execColor(d.execucaoFinanceira))
				.attr('opacity', 0.85);

			// City abbreviation label (only on larger bubbles)
			nodes
				.filter((d) => r(d.valorRecebido) >= 10)
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('dy', '0.35em')
				.attr('font-size', 8)
				.attr('font-weight', 700)
				.attr('fill', black)
				.attr('pointer-events', 'none')
				.text((d) => d.uf.substring(0, 2).toUpperCase());

			// Tooltip events
			nodes
				.on('mouseenter', (event, d) => {
					if (!tooltipEl) return;
					tooltipEl.innerHTML = `
						<strong>${d.city}</strong> (${d.uf})<br/>
						Recebido: ${BRL.format(d.valorRecebido)}<br/>
						Execução: ${d.execucaoFinanceira.toFixed(1)}%<br/>
						Per capita: ${BRL.format(d.valorPerCapita)}<br/>
						Projetos: ${d.qtdFomentos.toLocaleString('pt-BR')}
					`;
					tooltipEl.style.display = 'block';
				})
				.on('mousemove', (event) => {
					if (!tooltipEl) return;
					const [mx, my] = d3.pointer(event, svgEl.parentElement);
					tooltipEl.style.left = mx + 12 + 'px';
					tooltipEl.style.top = my - 28 + 'px';
				})
				.on('mouseleave', () => {
					if (tooltipEl) tooltipEl.style.display = 'none';
				});

			// Bubble legend
			drawBubbleLegend(svg, r, maxVal);
		}

		// ── Choropleth legend ─────────────────────────────────────────────────
		drawGradientLegend(svg);
	}

	/** @param {d3.Selection} svg */
	function drawGradientLegend(svg) {
		const values = [...valueByName.values()].filter((v) => v > 0);
		const maxVal = d3.max(values) ?? 1;
		const legendW = Math.min(180, width * 0.28);
		const legendH = 8;
		const x = 16;
		const y = height - 36;

		const defs = svg.append('defs');
		const gradId = `cgrad-${Math.random().toString(36).slice(2)}`;
		const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
		grad.append('stop').attr('offset', '0%').attr('stop-color', colorRange[0]);
		grad.append('stop').attr('offset', '100%').attr('stop-color', colorRange[1]);

		const lg = svg.append('g').attr('transform', `translate(${x},${y})`);
		lg.append('rect').attr('width', legendW).attr('height', legendH).attr('rx', 2).attr('fill', `url(#${gradId})`);
		lg.append('text').attr('x', 0).attr('y', legendH + 13).attr('font-size', 9).attr('fill', '#a0a0a0').text(format(0));
		lg.append('text').attr('x', legendW).attr('y', legendH + 13).attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#a0a0a0').text(format(maxVal));
	}

	/**
	 * @param {d3.Selection} svg
	 * @param {d3.ScalePower} rScale
	 * @param {number} maxVal
	 */
	function drawBubbleLegend(svg, rScale, maxVal) {
		const x = width - 120;
		const y = height - 100;
		const lg = svg.append('g').attr('transform', `translate(${x},${y})`);

		lg.append('text').attr('x', 0).attr('y', -8).attr('font-size', 9).attr('fill', '#a0a0a0').text('Tamanho = valor recebido');

		const BRLc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
		[0.25, 1].forEach((frac, i) => {
			const val = maxVal * frac;
			const rad = rScale(val);
			const cx = 20 + i * 56;
			lg.append('circle').attr('cx', cx).attr('cy', 0).attr('r', rad).attr('fill', 'none').attr('stroke', '#555555').attr('stroke-width', 1);
			lg.append('text').attr('x', cx).attr('y', rad + 12).attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#555555').text(BRLc.format(val));
		});

		// Exec color legend
		const execY = 60;
		lg.append('text').attr('x', 0).attr('y', execY - 8).attr('font-size', 9).attr('fill', '#a0a0a0').text('Cor = execução (%)');
		[['< 90%', '#d2301d'], ['~95%', '#ecb42d'], ['≥ 100%', '#4f8c4e']].forEach(([lbl, color], i) => {
			const row = lg.append('g').attr('transform', `translate(0, ${execY + i * 16})`);
			row.append('circle').attr('r', 4).attr('cx', 4).attr('fill', color).attr('opacity', 0.85);
			row.append('text').attr('x', 12).attr('y', 4).attr('font-size', 9).attr('fill', '#a0a0a0').text(lbl);
		});
	}
</script>

<div class="choropleth-wrapper">
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
