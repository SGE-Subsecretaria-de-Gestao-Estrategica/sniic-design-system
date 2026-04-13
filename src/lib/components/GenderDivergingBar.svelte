<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { red, blue, black, amber } from '../tokens.js';

	/**
	 * @typedef {Object} GenderRow
	 * @property {string} uf
	 * @property {number} pctFeminino   - 0–100
	 * @property {number} qtdFeminino
	 * @property {number} qtdMasculino
	 *
	 * @typedef {Object} Props
	 * @property {GenderRow[]} data
	 * @property {number} [nationalAvg]
	 */

	/** @type {Props} */
	let { data = [], nationalAvg = 0 } = $props();

	let svgEl;
	let containerEl;
	let tooltipEl;

	const MARGIN = { top: 32, right: 16, bottom: 16, left: 130 };
	const ROW_H = 22;
	const COLOR_F = red;
	const COLOR_M = blue;

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

		const sorted = [...data].sort((a, b) => b.pctFeminino - a.pctFeminino);
		const width = containerEl.clientWidth;
		const height = sorted.length * ROW_H + MARGIN.top + MARGIN.bottom;

		const svg = d3.select(svgEl).attr('width', width).attr('height', height);
		svg.selectAll('*').remove();

		const innerW = width - MARGIN.left - MARGIN.right;
		const innerH = height - MARGIN.top - MARGIN.bottom;

		const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

		// x goes 0→100 (left = 100% female, right = 100% male)
		const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
		const y = d3.scaleBand().domain(sorted.map((d) => d.uf)).range([0, innerH]).padding(0.25);

		// Midline (50%)
		g.append('line')
			.attr('x1', x(50)).attr('x2', x(50))
			.attr('y1', 0).attr('y2', innerH)
			.attr('stroke', black)
			.attr('stroke-width', 1);

		// National avg reference line
		if (nationalAvg > 0) {
			g.append('line')
				.attr('x1', x(nationalAvg)).attr('x2', x(nationalAvg))
				.attr('y1', -8).attr('y2', innerH)
				.attr('stroke', amber)
				.attr('stroke-width', 1)
				.attr('stroke-dasharray', '4,3');

			g.append('text')
				.attr('x', x(nationalAvg) + 4)
				.attr('y', -12)
				.attr('font-size', 9)
				.attr('fill', amber)
				.text(`média ${nationalAvg.toFixed(1)}%`);
		}

		// Bars — female portion (left from 0 to pctFeminino)
		g.selectAll('.bar-f')
			.data(sorted)
			.join('rect')
			.attr('class', 'bar-f')
			.attr('x', 0)
			.attr('y', (d) => y(d.uf) ?? 0)
			.attr('width', (d) => x(d.pctFeminino))
			.attr('height', y.bandwidth())
			.attr('rx', 2)
			.attr('fill', COLOR_F)
			.attr('opacity', 0.85);

		// Bars — male portion (right from pctFeminino to 100)
		g.selectAll('.bar-m')
			.data(sorted)
			.join('rect')
			.attr('class', 'bar-m')
			.attr('x', (d) => x(d.pctFeminino))
			.attr('y', (d) => y(d.uf) ?? 0)
			.attr('width', (d) => x(100 - d.pctFeminino))
			.attr('height', y.bandwidth())
			.attr('rx', 2)
			.attr('fill', COLOR_M)
			.attr('opacity', 0.65);

		// Pct label on female side
		g.selectAll('.lbl-f')
			.data(sorted)
			.join('text')
			.attr('class', 'lbl-f')
			.attr('x', (d) => x(d.pctFeminino) - 4)
			.attr('y', (d) => (y(d.uf) ?? 0) + y.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'end')
			.attr('font-size', 9)
			.attr('fill', black)
			.attr('font-weight', 600)
			.text((d) => (d.pctFeminino > 12 ? `${d.pctFeminino.toFixed(0)}%` : ''));

		// Y axis
		g.append('g')
			.call(d3.axisLeft(y).tickSize(0))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) =>
				ax.selectAll('.tick text')
					.attr('fill', '#a0a0a0')
					.attr('font-size', 11)
					.attr('dx', -8)
			);

		// X axis ticks
		g.append('g')
			.attr('transform', `translate(0,${innerH + 4})`)
			.call(d3.axisBottom(x).ticks(5).tickFormat((v) => `${v}%`).tickSize(0))
			.call((ax) => ax.select('.domain').remove())
			.call((ax) =>
				ax.selectAll('.tick text').attr('fill', '#555555').attr('font-size', 9)
			);

		// Legend (top)
		const legendG = svg.append('g').attr('transform', `translate(${MARGIN.left}, 12)`);
		[['Feminino', COLOR_F], ['Masculino', COLOR_M]].forEach(([label, color], i) => {
			const row = legendG.append('g').attr('transform', `translate(${i * 100}, 0)`);
			row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', color);
			row.append('text').attr('x', 14).attr('y', 9).attr('font-size', 11).attr('fill', '#a0a0a0').text(label);
		});
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
		background: rgba(0, 0, 0, 0.9);
		color: #f8fafc;
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 12px;
		pointer-events: none;
	}
</style>
