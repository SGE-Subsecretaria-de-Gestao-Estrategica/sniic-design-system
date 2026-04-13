<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { blue, orange, black } from '../tokens.js';

	/**
	 * @typedef {Object} Props
	 * @property {Array<{uf: string, audiovisual: number, demais: number}>} data
	 */

	/** @type {Props} */
	let { data = [] } = $props();

	let svgEl;
	let containerEl;

	const MARGIN = { top: 16, right: 120, bottom: 32, left: 130 };
	const ROW_HEIGHT = 28;
	const COLORS = {
		audiovisual: blue,
		demais: orange
	};

	const BRL = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		notation: 'compact',
		maximumFractionDigits: 1
	});

	onMount(() => {
		draw();
		const ro = new ResizeObserver(() => draw());
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		data;
		if (svgEl) draw();
	});

	function draw() {
		if (!svgEl || !data.length) return;

		const sorted = [...data]
			.filter((d) => d.uf !== 'Todos (Brasil)')
			.sort((a, b) => b.audiovisual + b.demais - (a.audiovisual + a.demais));

		const width = containerEl.clientWidth;
		const height = sorted.length * ROW_HEIGHT + MARGIN.top + MARGIN.bottom;

		const svg = d3
			.select(svgEl)
			.attr('width', width)
			.attr('height', height);

		svg.selectAll('*').remove();

		const innerW = width - MARGIN.left - MARGIN.right;
		const innerH = height - MARGIN.top - MARGIN.bottom;

		const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

		// Scales
		const xMax = d3.max(sorted, (d) => d.audiovisual + d.demais) ?? 1;
		const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]).nice();
		const y = d3.scaleBand()
			.domain(sorted.map((d) => d.uf))
			.range([0, innerH])
			.padding(0.3);

		// Stack
		const stack = d3.stack().keys(['audiovisual', 'demais']);
		const series = stack(sorted);

		// Gridlines
		g.append('g')
			.attr('class', 'grid')
			.call(
				d3.axisBottom(x)
					.ticks(5)
					.tickSize(innerH)
					.tickFormat('')
			)
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g.selectAll('.tick line')
					.attr('stroke', black)
					.attr('stroke-dasharray', '3,3')
			);

		// Bars
		g.selectAll('.series')
			.data(series)
			.join('g')
			.attr('class', 'series')
			.attr('fill', (d) => COLORS[d.key])
			.selectAll('rect')
			.data((d) => d)
			.join('rect')
			.attr('y', (d) => y(d.data.uf))
			.attr('x', (d) => x(d[0]))
			.attr('width', (d) => Math.max(0, x(d[1]) - x(d[0])))
			.attr('height', y.bandwidth())
			.attr('rx', 3);

		// Total labels
		g.selectAll('.total-label')
			.data(sorted)
			.join('text')
			.attr('class', 'total-label')
			.attr('x', (d) => x(d.audiovisual + d.demais) + 6)
			.attr('y', (d) => (y(d.uf) ?? 0) + y.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('font-size', 10)
			.attr('fill', '#a0a0a0')
			.text((d) => BRL.format(d.audiovisual + d.demais));

		// Y axis (UF labels)
		g.append('g')
			.call(d3.axisLeft(y).tickSize(0))
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g.selectAll('.tick text')
					.attr('fill', '#a0a0a0')
					.attr('font-size', 11)
					.attr('dx', -8)
			);

		// X axis
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(
				d3.axisBottom(x)
					.ticks(5)
					.tickFormat((v) => BRL.format(+v))
			)
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g.selectAll('.tick text')
					.attr('fill', '#555555')
					.attr('font-size', 10)
			);

		// Legend
		const legend = svg
			.append('g')
			.attr('transform', `translate(${width - MARGIN.right + 12}, ${MARGIN.top + 8})`);

		Object.entries(COLORS).forEach(([key, color], i) => {
			const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
			row.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', color);
			row
				.append('text')
				.attr('x', 16)
				.attr('y', 10)
				.attr('font-size', 11)
				.attr('fill', '#a0a0a0')
				.text(key === 'audiovisual' ? 'Audiovisual' : 'Demais Áreas');
		});
	}
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
