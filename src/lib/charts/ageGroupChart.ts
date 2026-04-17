import * as d3 from 'd3';
import { amber, blue, green, black } from '../tokens.js';
import { removeDomain, tickText, gridLines } from '../utils/axisHelpers.js';

export interface StateAgeRow {
  uf: string;
  youth: number;
  adult: number;
  senior: number;
}

const MARGIN = { top: 40, right: 24, bottom: 48, left: 60 };

const COLORS = { youth: amber, adult: blue, senior: green };
const LABELS = { youth: '15–29 anos', adult: '30–59 anos', senior: '60+ anos' };

export function drawAgeGroupChart(
  svgEl: SVGSVGElement,
  containerEl: HTMLElement,
  data: StateAgeRow[],
): void {
  if (!svgEl || !data.length) return;

  // Normalise each state to % of total so states are comparable
  const normalised = data.map((d) => {
    const total = d.youth + d.adult + d.senior || 1;
    return {
      uf: d.uf,
      youth: (d.youth / total) * 100,
      adult: (d.adult / total) * 100,
      senior: (d.senior / total) * 100,
    };
  });
  normalised.sort((a, b) => b.youth - a.youth);

  const width = containerEl.clientWidth;
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

  // Gridlines + Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat((v) => `${v}%`))
    .call(removeDomain)
    .call(gridLines(black))
    .call(tickText('#555555', 10));

  // Stacked bars (bottom → top: senior, adult, youth)
  const stack = d3.stack<(typeof normalised)[0]>().keys(['senior', 'adult', 'youth']);
  g.selectAll('.series')
    .data(stack(normalised))
    .join('g')
    .attr('fill', (d) => COLORS[d.key as keyof typeof COLORS])
    .selectAll('rect')
    .data((d) => d)
    .join('rect')
    .attr('x', (d) => x(d.data.uf) ?? 0)
    .attr('y', (d) => y(d[1]))
    .attr('height', (d) => Math.max(0, y(d[0]) - y(d[1])))
    .attr('width', x.bandwidth())
    .attr('rx', 2);

  // X axis — rotated UF labels
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(removeDomain)
    .call((g) =>
      g.selectAll('.tick text')
        .attr('fill', '#555555')
        .attr('font-size', 9)
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dy', '0.5em')
        .attr('dx', '-0.5em'),
    );

  // Legend
  const legendG = svg.append('g').attr('transform', `translate(${MARGIN.left}, 14)`);
  Object.entries(COLORS).forEach(([key, color], i) => {
    const row = legendG.append('g').attr('transform', `translate(${i * 110}, 0)`);
    row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', color);
    row.append('text')
      .attr('x', 14).attr('y', 9).attr('font-size', 11).attr('fill', '#a0a0a0')
      .text(LABELS[key as keyof typeof LABELS]);
  });
}
