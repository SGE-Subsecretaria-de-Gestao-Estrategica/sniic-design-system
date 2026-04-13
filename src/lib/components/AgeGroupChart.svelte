<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { amber, blue, green, black } from '../tokens.js';

	/**
	 * @typedef {Object} StateAgeRow
	 * @property {string} uf
	 * @property {number} youth   - 15–29
	 * @property {number} adult   - 30–59
	 * @property {number} senior  - 60+
	 *
	 * @typedef {Object} Props
	 * @property {StateAgeRow[]} data
	 */

	/** @type {Props} */
	let { data = [] } = $props();

	let svgEl;
	let containerEl;

	const MARGIN = { top: 40, right: 24, bottom: 48, left: 60 };
	const COLORS = {
		youth: amber,
		adult: blue,
		senior: green
	};
	const LABELS = {
		youth: '15–29 anos',
		adult: '30–59 anos',
		senior: '60+ anos'
	};

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

		// Normalise to % of total per state so states are comparable
		const normalised = data.map((d) => {
			const total = d.youth + d.adult + d.senior || 1;
			return {
				uf: d.uf,
				youth: (d.youth / total) * 100,
				adult: (d.adult / total) * 100,
				senior: (d.senior / total) * 100
			};
		});

		// Sort by youth % descending
		normalised.sort((a, b) => b.youth - a.youth);

		const width = containerEl.clientWidth;
		const BAR_W = Math.max(8, Math.min(28, (width - MARGIN.left - MARGIN.right) / normalised.length - 4));
		const height = 260;

		const svg = d3.select(svgEl).attr('width', width).attr('height', height);
		svg.selectAll('*').remove();

		const innerW = width - MARGIN.left - MARGIN.right;
		const innerH = height - MARGIN.top - MARGIN.bottom;

		const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

		const x = d3.scaleBand()
			.domain(normalised.map((d) => d.uf))
			.range([0, innerW])
			.padding(0.25);

		const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

		// Gridlines
		g.append('g')
			.call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat((v) => `${v}%`))
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g.selectAll('.tick line')
					.attr('stroke', black)
					.attr('stroke-dasharray', '3,3')
			)
			.call((g) =>
				g.selectAll('.tick text')
					.attr('fill', '#555555')
					.attr('font-size', 10)
			);

		// Stack
		const stack = d3.stack().keys(['senior', 'adult', 'youth']); // bottom to top
		const series = stack(normalised);

		g.selectAll('.series')
			.data(series)
			.join('g')
			.attr('fill', (d) => COLORS[d.key])
			.selectAll('rect')
			.data((d) => d)
			.join('rect')
			.attr('x', (d) => x(d.data.uf) ?? 0)
			.attr('y', (d) => y(d[1]))
			.attr('height', (d) => Math.max(0, y(d[0]) - y(d[1])))
			.attr('width', x.bandwidth())
			.attr('rx', 2);

		// X axis — UF labels, rotated
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).tickSize(0))
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g.selectAll('.tick text')
					.attr('fill', '#555555')
					.attr('font-size', 9)
					.attr('transform', 'rotate(-45)')
					.attr('text-anchor', 'end')
					.attr('dy', '0.5em')
					.attr('dx', '-0.5em')
			);

		// Legend (top)
		const legendData = Object.entries(COLORS);
		const legendG = svg.append('g').attr('transform', `translate(${MARGIN.left}, 14)`);
		legendData.forEach(([key, color], i) => {
			const row = legendG.append('g').attr('transform', `translate(${i * 110}, 0)`);
			row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', color);
			row
				.append('text')
				.attr('x', 14)
				.attr('y', 9)
				.attr('font-size', 11)
				.attr('fill', '#a0a0a0')
				.text(LABELS[key]);
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
	}
</style>
