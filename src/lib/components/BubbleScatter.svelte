<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { green, amber, orange, blue, red, black } from '../tokens.js';

	/**
	 * @typedef {Object} Props
	 * @property {Record<string, object>} states
	 */

	/** @type {Props} */
	let { states = {} } = $props();

	let svgEl;
	let containerEl;
	let tooltipEl;

	const MARGIN = { top: 24, right: 24, bottom: 52, left: 72 };

	const BRL = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		notation: 'compact',
		maximumFractionDigits: 1
	});
	const NUM = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

	// Brazilian regions for coloring
	const REGION_COLOR = {
		Norte: green,
		Nordeste: amber,
		'Centro-Oeste': orange,
		Sudeste: blue,
		Sul: red
	};

	const UF_REGION = {
		Acre: 'Norte', Amapá: 'Norte', Amazonas: 'Norte', Pará: 'Norte',
		Rondônia: 'Norte', Roraima: 'Norte', Tocantins: 'Norte',
		Alagoas: 'Nordeste', Bahia: 'Nordeste', Ceará: 'Nordeste',
		Maranhão: 'Nordeste', Paraíba: 'Nordeste', Pernambuco: 'Nordeste',
		Piauí: 'Nordeste', 'Rio Grande do Norte': 'Nordeste', Sergipe: 'Nordeste',
		'Distrito Federal': 'Centro-Oeste', Goiás: 'Centro-Oeste',
		'Mato Grosso': 'Centro-Oeste', 'Mato Grosso do Sul': 'Centro-Oeste',
		'Espírito Santo': 'Sudeste', 'Minas Gerais': 'Sudeste',
		'Rio de Janeiro': 'Sudeste', 'São Paulo': 'Sudeste',
		Paraná: 'Sul', 'Rio Grande do Sul': 'Sul', 'Santa Catarina': 'Sul'
	};

	onMount(() => {
		draw();
		const ro = new ResizeObserver(() => draw());
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		states;
		if (svgEl) draw();
	});

	function draw() {
		if (!svgEl) return;

		const rows = Object.values(states).filter((s) => s.popTotal > 0 && s.valorRecebido > 0);

		const width = containerEl.clientWidth;
		const height = Math.max(380, width * 0.5);

		const svg = d3.select(svgEl).attr('width', width).attr('height', height);
		svg.selectAll('*').remove();

		const innerW = width - MARGIN.left - MARGIN.right;
		const innerH = height - MARGIN.top - MARGIN.bottom;

		const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

		const x = d3.scaleLog()
			.domain(d3.extent(rows, (d) => d.popTotal))
			.range([0, innerW])
			.nice();

		const y = d3.scaleLog()
			.domain(d3.extent(rows, (d) => d.valorRecebido))
			.range([innerH, 0])
			.nice();

		const r = d3.scaleSqrt()
			.domain([0, d3.max(rows, (d) => d.qtdFomentos) ?? 1])
			.range([4, 24]);

		// Gridlines
		g.append('g')
			.call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(''))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) => ax.selectAll('.tick line').attr('stroke', black).attr('stroke-dasharray', '3,3'));

		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(''))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) => ax.selectAll('.tick line').attr('stroke', black).attr('stroke-dasharray', '3,3'));

		// Bubbles
		const node = g.selectAll('.bubble')
			.data(rows)
			.join('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${x(d.popTotal)},${y(d.valorRecebido)})`)
			.style('cursor', 'pointer');

		node.append('circle')
			.attr('r', (d) => r(d.qtdFomentos))
			.attr('fill', (d) => REGION_COLOR[UF_REGION[d.uf]] ?? '#a0a0a0')
			.attr('opacity', 0.75)
			.attr('stroke', (d) => REGION_COLOR[UF_REGION[d.uf]] ?? '#a0a0a0')
			.attr('stroke-width', 1);

		// UF labels (only for larger bubbles to avoid clutter)
		node.filter((d) => r(d.qtdFomentos) > 10)
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.attr('font-size', 9)
			.attr('font-weight', 700)
			.attr('fill', black)
			.text((d) => d.uf.substring(0, 2).toUpperCase());

		// Tooltip
		node
			.on('mouseenter', (event, d) => {
				if (!tooltipEl) return;
				tooltipEl.innerHTML = `
					<strong>${d.uf}</strong><br/>
					Pop.: ${NUM.format(d.popTotal)}<br/>
					Recebido: ${BRL.format(d.valorRecebido)}<br/>
					Projetos: ${d.qtdFomentos.toLocaleString('pt-BR')}<br/>
					Per capita: ${BRL.format(d.valorPerCapita)}
				`;
				tooltipEl.style.display = 'block';
			})
			.on('mousemove', (event) => {
				if (!tooltipEl) return;
				const [mx, my] = d3.pointer(event, containerEl);
				tooltipEl.style.left = mx + 12 + 'px';
				tooltipEl.style.top = my - 20 + 'px';
			})
			.on('mouseleave', () => {
				if (tooltipEl) tooltipEl.style.display = 'none';
			});

		// Axes
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).ticks(5).tickFormat((v) => NUM.format(+v)))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) => ax.selectAll('.tick text').attr('fill', '#555555').attr('font-size', 10));

		g.append('g')
			.call(d3.axisLeft(y).ticks(5).tickFormat((v) => BRL.format(+v)))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) => ax.selectAll('.tick text').attr('fill', '#555555').attr('font-size', 10));

		// Axis labels
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', innerH + 44)
			.attr('text-anchor', 'middle')
			.attr('font-size', 11)
			.attr('fill', '#a0a0a0')
			.text('População total (escala log)');

		g.append('text')
			.attr('transform', `rotate(-90)`)
			.attr('x', -innerH / 2)
			.attr('y', -56)
			.attr('text-anchor', 'middle')
			.attr('font-size', 11)
			.attr('fill', '#a0a0a0')
			.text('Valor recebido (escala log)');

		// Region legend
		const legendG = svg.append('g').attr('transform', `translate(${MARGIN.left + innerW - 140}, ${MARGIN.top + 8})`);
		Object.entries(REGION_COLOR).forEach(([region, color], i) => {
			const row = legendG.append('g').attr('transform', `translate(0, ${i * 18})`);
			row.append('circle').attr('r', 5).attr('cx', 5).attr('cy', 5).attr('fill', color).attr('opacity', 0.8);
			row.append('text').attr('x', 14).attr('y', 9).attr('font-size', 10).attr('fill', '#a0a0a0').text(region);
		});

		// Bubble size legend note
		svg.append('text')
			.attr('x', MARGIN.left)
			.attr('y', height - 6)
			.attr('font-size', 10)
			.attr('fill', '#555555')
			.text('Tamanho da bolha = nº de projetos fomentados');
	}
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
