import * as d3 from 'd3';
import { black, blue } from '../tokens.js';

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

const COLOR_RANGE = [black, blue] as const;

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
): { colorScale: d3.ScaleSequential<string>; sharedMax: number } {
  const allValues = TIER_ORDER.flatMap((tier) =>
    Object.values(tiers[tier] ?? {}).map((d) => (d[metric] as number) ?? 0),
  ).filter((v) => v > 0);

  const sharedMax = d3.max(allValues) ?? 1;
  const colorScale = d3
    .scaleSequential()
    .domain([0, sharedMax])
    .interpolator(d3.interpolateRgb(COLOR_RANGE[0], COLOR_RANGE[1]));

  return { colorScale, sharedMax };
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
      return val > 0 ? colorScale(val) : black;
    })
    .attr('stroke', black)
    .attr('stroke-width', 0.5);

  // Gradient legend at the bottom of each panel
  const legendW = Math.min(100, width * 0.45);
  const legendH = 5;
  const lx = width / 2 - legendW / 2;
  const ly = height - 20;

  const defs = svg.append('defs');
  const gradId = `tg-${Math.random().toString(36).slice(2)}`;
  const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
  grad.append('stop').attr('offset', '0%').attr('stop-color', COLOR_RANGE[0]);
  grad.append('stop').attr('offset', '100%').attr('stop-color', COLOR_RANGE[1]);

  const lg = svg.append('g').attr('transform', `translate(${lx},${ly})`);
  lg.append('rect').attr('width', legendW).attr('height', legendH).attr('rx', 1).attr('fill', `url(#${gradId})`);
  lg.append('text').attr('x', 0).attr('y', legendH + 10).attr('font-size', 7).attr('fill', '#555555').text(format(0));
  lg.append('text').attr('x', legendW).attr('y', legendH + 10).attr('text-anchor', 'end').attr('font-size', 7).attr('fill', '#555555').text(format(sharedMax));
}
