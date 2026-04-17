import * as d3 from 'd3';
import { black, white, red, amber, green } from '../tokens.js';
import { BRL, BRLFull } from '../utils/formatters.js';
import { showTooltip, positionTooltip, hideTooltip } from '../utils/tooltip.js';

export interface ChoroplethCapital {
  uf: string;
  city: string;
  lat: number;
  lng: number;
  execucaoFinanceira: number;
  valorRecebido: number;
  valorPerCapita: number;
  qtdFomentos: number;
  valorMedio: number;
  pctValorFeminino: number;
}

export interface ChoroplethMapOptions {
  states: Record<string, any>;
  metric: string;
  label: string;
  format: (v: number) => string;
  colorRange: string[];
  showCapitals: boolean;
  capitals: ChoroplethCapital[];
  /** Called with the hovered state object (or null on leave). */
  onStateChange: (state: any) => void;
}

// Color scale for capital bubble execution rate (red → amber → green)
const execColor = d3
  .scaleSequential()
  .domain([80, 100])
  .interpolator(d3.interpolateRgbBasis([red, amber, green]))
  .clamp(true);

export function drawChoroplethMap(
  svgEl: SVGSVGElement,
  containerEl: HTMLElement,
  tooltipEl: HTMLElement,
  geojson: any,
  options: ChoroplethMapOptions,
): void {
  const { states, metric, label, format, colorRange, showCapitals, capitals, onStateChange } = options;

  const width = containerEl.clientWidth;
  const height = Math.round(width * 0.7);

  const valueByName = new Map<string, number>(
    Object.entries(states).map(([name, d]) => [name, d[metric] ?? 0]),
  );

  const values = [...valueByName.values()].filter((v) => v > 0);
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(values) ?? 1])
    .interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]));

  const projection = d3.geoMercator().fitSize([width, height], geojson);
  const path = d3.geoPath().projection(projection);

  const svg = d3.select(svgEl).attr('width', width).attr('height', height);
  svg.selectAll('*').remove();

  const g = svg.append('g');

  // State polygons
  g.selectAll<SVGPathElement, d3.GeoPermissibleObjects>('path')
    .data(geojson.features as d3.GeoPermissibleObjects[])
    .join('path')
    .attr('d', path)
    .attr('fill', (d: any) => {
      const val = valueByName.get(d.properties.name);
      return val != null && val > 0 ? colorScale(val) : black;
    })
    .attr('stroke', black)
    .attr('stroke-width', 0.6)
    .style('cursor', 'pointer')
    .on('mouseenter', (event, d: any) => {
      const name = d.properties.name;
      const state = states[name] ?? null;
      onStateChange(state);
      d3.select(event.currentTarget).raise().attr('stroke', white).attr('stroke-width', 1.5);
      if (tooltipEl && state) {
        const val = valueByName.get(name) ?? 0;
        showTooltip(tooltipEl, `<strong>${name}</strong><br/>${label}: ${format(val)}`);
      }
    })
    .on('mousemove', (event) => {
      if (!tooltipEl) return;
      const [mx, my] = d3.pointer(event, containerEl);
      positionTooltip(tooltipEl, mx, my, 12, -28);
    })
    .on('mouseleave', (event) => {
      onStateChange(null);
      d3.select(event.currentTarget).attr('stroke', black).attr('stroke-width', 0.6);
      if (tooltipEl) hideTooltip(tooltipEl);
    });

  // Capital bubbles overlay
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
        const [px, py] = projection([d.lng, d.lat]) ?? [0, 0];
        return `translate(${px},${py})`;
      })
      .style('cursor', 'pointer');

    // Outer glow ring
    nodes.append('circle')
      .attr('r', (d) => r(d.valorRecebido) + 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => execColor(d.execucaoFinanceira))
      .attr('stroke-width', 1.5).attr('opacity', 0.5);

    // Main bubble
    nodes.append('circle')
      .attr('r', (d) => r(d.valorRecebido))
      .attr('fill', (d) => execColor(d.execucaoFinanceira))
      .attr('opacity', 0.85);

    // City abbreviation label on larger bubbles
    nodes.filter((d) => r(d.valorRecebido) >= 10)
      .append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('font-size', 8).attr('font-weight', 700)
      .attr('fill', black).attr('pointer-events', 'none')
      .text((d) => d.uf.substring(0, 2).toUpperCase());

    nodes
      .on('mouseenter', (_event, d) => {
        if (!tooltipEl) return;
        showTooltip(tooltipEl, `
          <strong>${d.city}</strong> (${d.uf})<br/>
          Recebido: ${BRLFull.format(d.valorRecebido)}<br/>
          Execução: ${d.execucaoFinanceira.toFixed(1)}%<br/>
          Per capita: ${BRLFull.format(d.valorPerCapita)}<br/>
          Projetos: ${d.qtdFomentos.toLocaleString('pt-BR')}
        `);
      })
      .on('mousemove', (event) => {
        if (!tooltipEl) return;
        const [mx, my] = d3.pointer(event, containerEl);
        positionTooltip(tooltipEl, mx, my, 12, -28);
      })
      .on('mouseleave', () => {
        if (tooltipEl) hideTooltip(tooltipEl);
      });

    drawBubbleLegend(svg, r, maxVal, width, height);
  }

  drawGradientLegend(svg, valueByName, width, height, format, colorRange);
}

// ── Private legend helpers ────────────────────────────────────────────────────

function drawGradientLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  valueByName: Map<string, number>,
  width: number,
  height: number,
  format: (v: number) => string,
  colorRange: string[],
): void {
  const values = [...valueByName.values()].filter((v) => v > 0);
  const maxVal = d3.max(values) ?? 1;
  const legendW = Math.min(180, width * 0.28);
  const legendH = 8;

  const defs = svg.append('defs');
  const gradId = `cgrad-${Math.random().toString(36).slice(2)}`;
  const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
  grad.append('stop').attr('offset', '0%').attr('stop-color', colorRange[0]);
  grad.append('stop').attr('offset', '100%').attr('stop-color', colorRange[1]);

  const lg = svg.append('g').attr('transform', `translate(16,${height - 36})`);
  lg.append('rect').attr('width', legendW).attr('height', legendH).attr('rx', 2).attr('fill', `url(#${gradId})`);
  lg.append('text').attr('x', 0).attr('y', legendH + 13).attr('font-size', 9).attr('fill', '#a0a0a0').text(format(0));
  lg.append('text').attr('x', legendW).attr('y', legendH + 13).attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#a0a0a0').text(format(maxVal));
}

function drawBubbleLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  rScale: d3.ScalePower<number, number>,
  maxVal: number,
  width: number,
  height: number,
): void {
  const lg = svg.append('g').attr('transform', `translate(${width - 120},${height - 100})`);

  lg.append('text').attr('x', 0).attr('y', -8).attr('font-size', 9).attr('fill', '#a0a0a0')
    .text('Tamanho = valor recebido');

  [0.25, 1].forEach((frac, i) => {
    const val = maxVal * frac;
    const rad = rScale(val);
    const cx = 20 + i * 56;
    lg.append('circle').attr('cx', cx).attr('cy', 0).attr('r', rad).attr('fill', 'none').attr('stroke', '#555555').attr('stroke-width', 1);
    lg.append('text').attr('x', cx).attr('y', rad + 12).attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#555555').text(BRL.format(val));
  });

  const execY = 60;
  lg.append('text').attr('x', 0).attr('y', execY - 8).attr('font-size', 9).attr('fill', '#a0a0a0')
    .text('Cor = execução (%)');
  ([['< 90%', '#d2301d'], ['~95%', '#ecb42d'], ['≥ 100%', '#4f8c4e']] as [string, string][]).forEach(([lbl, color], i) => {
    const row = lg.append('g').attr('transform', `translate(0, ${execY + i * 16})`);
    row.append('circle').attr('r', 4).attr('cx', 4).attr('fill', color).attr('opacity', 0.85);
    row.append('text').attr('x', 12).attr('y', 4).attr('font-size', 9).attr('fill', '#a0a0a0').text(lbl);
  });
}
