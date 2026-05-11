import * as d3 from 'd3';
import { cream, colorScales } from '../tokens.js';

export const TIER_ORDER = [
  'Capitais',
  'Grande Porte',
  'Médio Porte',
  'Pequeno Porte II',
  'Pequeno Porte I',
] as const;

export const TIER_SUBTITLES: Record<string, string> = {
  Capitais: 'Capital estadual',
  'Grande Porte': 'Mais de 100k hab.',
  'Médio Porte': '50k – 100k hab.',
  'Pequeno Porte II': '20k – 50k hab.',
  'Pequeno Porte I': 'Até 20k hab.',
};

// Blue → purple sequential scale for choropleth (low → high)
export const SCALE_STOPS: string[] = [
  colorScales.blue[0],    // '#d5e4f7' light blue (low)
  colorScales.blue[1],    // '#7ba6d9'
  colorScales.purple[1],  // '#cc8eb9' mid transition
  colorScales.purple[2],  // '#a44c7f'
  colorScales.purple[4],  // '#2f0f29' dark purple (high)
];

export interface TierData {
  [uf: string]: Record<string, any>;
}

/**
 * Computes the shared color scale domain across all tiers.
 * Using a shared scale makes panels visually comparable.
 */
export function buildSharedColorScale(
  tiers: Record<string, TierData>,
  metric: string,
): { colorScale: d3.ScaleSequential<string>; sharedMin: number; sharedMax: number } {
  const allValues = TIER_ORDER.flatMap((tier) =>
    Object.values(tiers[tier] ?? {}).map((d) => (d[metric] as number) ?? 0),
  ).filter((v) => v > 0);

  const sharedMin = d3.min(allValues) ?? 0;
  const sharedMax = d3.max(allValues) ?? 1;
  const colorScale = d3
    .scaleSequential()
    .domain([sharedMin, sharedMax])
    .interpolator(d3.interpolateRgbBasis(SCALE_STOPS));

  return { colorScale, sharedMin, sharedMax };
}

/**
 * Flattens all tiers into a single state → metric-value map by averaging
 * values across tiers when a state appears in more than one.
 */
export function flattenTierData(
  tiers: Record<string, TierData>,
  metric: string,
): Record<string, number> {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const tier of TIER_ORDER) {
    for (const [state, vals] of Object.entries(tiers[tier] ?? {})) {
      const val = (vals[metric] as number) ?? 0;
      sums[state] = (sums[state] ?? 0) + val;
      counts[state] = (counts[state] ?? 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(sums).map(([k, v]) => [k, v / counts[k]]));
}

/**
 * Draws the Brazil overview map with states colored by metric.
 * Clicking a state calls onStateClick with the GeoJSON feature.
 */
export function drawBrazilOverview(
  container: HTMLElement,
  stateData: Record<string, number>,
  colorScale: d3.ScaleSequential<string>,
  geojson: any,
  _format: (v: number) => string,
  onStateClick: (feature: any) => void,
  selectedSigla?: string,
): void {
  const width = container.clientWidth || 300;
  const height = width * 0.88;

  let svg = d3.select(container).select<SVGSVGElement>('svg');
  if (svg.empty()) svg = d3.select(container).append('svg');
  svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`).selectAll('*').remove();

  const projection = d3.geoMercator().fitSize([width, height], geojson);
  const path = d3.geoPath().projection(projection);

  svg
    .append('g')
    .selectAll<SVGPathElement, any>('path')
    .data(geojson.features)
    .join('path')
    .attr('d', path as any)
    .attr('fill', (d: any) => {
      const val = stateData[d.properties.name] ?? 0;
      return val > 0 ? colorScale(val) : '#e8e0d8';
    })
    .attr('stroke', (d: any) =>
      d.properties.sigla === selectedSigla ? colorScales.purple[3] : '#c8c0b8',
    )
    .attr('stroke-width', (d: any) =>
      d.properties.sigla === selectedSigla ? 2 : 0.5,
    )
    .style('cursor', 'pointer')
    .on('click', (_event: MouseEvent, d: any) => onStateClick(d));

  // State abbreviation labels
  const labelSize = Math.max(6, width * 0.013);
  svg
    .append('g')
    .selectAll<SVGTextElement, any>('text')
    .data(geojson.features)
    .join('text')
    .attr('x', (d: any) => path.centroid(d as any)[0])
    .attr('y', (d: any) => path.centroid(d as any)[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', labelSize)
    .attr('font-weight', '600')
    .attr('fill', (d: any) => {
      const val = stateData[d.properties.name] ?? 0;
      const bg = val > 0 ? colorScale(val) : '#e8e0d8';
      // Simple luminance check for contrast
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#2f0f29' : '#fffffe';
    })
    .attr('pointer-events', 'none')
    .text((d: any) => d.properties.sigla);
}

/**
 * Draws a state's municipality boundaries in a single fill color.
 */
export function drawStateDetail(
  container: HTMLElement,
  stateGeo: any,
  fillColor: string,
): void {
  const width = container.clientWidth || 300;
  const padding = 12;
  const height = width * 1.1;

  let svg = d3.select(container).select<SVGSVGElement>('svg');
  if (svg.empty()) svg = d3.select(container).append('svg');
  svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`).selectAll('*').remove();

  const projection = d3
    .geoMercator()
    .fitSize([width - padding * 2, height - padding * 2], stateGeo);
  const path = d3.geoPath().projection(projection);

  svg
    .append('g')
    .attr('transform', `translate(${padding},${padding})`)
    .selectAll<SVGPathElement, any>('path')
    .data(stateGeo.features)
    .join('path')
    .attr('d', path as any)
    .attr('fill', fillColor)
    .attr('stroke', cream)
    .attr('stroke-opacity', 0.3)
    .attr('stroke-width', 0.5);
}

export function drawTierPanel(
  container: HTMLElement,
  data: TierData,
  colorScale: d3.ScaleSequential<string>,
  sharedMax: number,
  geojson: any,
  metric: string,
  format: (v: number) => string,
): void {
  const width = container.clientWidth;
  const height = width * 0.72;

  let svg = d3.select(container).select<SVGSVGElement>('svg');
  if (svg.empty()) svg = d3.select(container).append('svg');
  svg.attr('width', width).attr('height', height).selectAll('*').remove();

  const projection = d3.geoMercator().fitSize([width, height], geojson);
  const path = d3.geoPath().projection(projection);

  svg.append('g')
    .selectAll<SVGPathElement, d3.GeoPermissibleObjects>('path')
    .data(geojson.features as d3.GeoPermissibleObjects[])
    .join('path')
    .attr('d', path)
    .attr('fill', (d: any) => {
      const val = (data[d.properties.name]?.[metric] as number) ?? 0;
      return val > 0 ? colorScale(val) : '#e8e0d8';
    })
    .attr('stroke', '#c8c0b8')
    .attr('stroke-width', 0.5);

  // Gradient legend at the bottom of each panel
  const legendW = Math.min(100, width * 0.45);
  const legendH = 5;
  const lx = width / 2 - legendW / 2;
  const ly = height - 20;

  const defs = svg.append('defs');
  const gradId = `tg-${Math.random().toString(36).slice(2)}`;
  const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
  SCALE_STOPS.forEach((color, i) => {
    grad.append('stop')
      .attr('offset', `${(i / (SCALE_STOPS.length - 1)) * 100}%`)
      .attr('stop-color', color);
  });

  const lg = svg.append('g').attr('transform', `translate(${lx},${ly})`);
  lg.append('rect').attr('width', legendW).attr('height', legendH).attr('rx', 1).attr('fill', `url(#${gradId})`);
  lg.append('text').attr('x', 0).attr('y', legendH + 10).attr('font-size', 7).attr('fill', '#8a6d84').text(format(0));
  lg.append('text').attr('x', legendW).attr('y', legendH + 10).attr('text-anchor', 'end').attr('font-size', 7).attr('fill', '#8a6d84').text(format(sharedMax));
}
