import type { Selection } from 'd3';

type G = Selection<SVGGElement, unknown, null, undefined>;

/** Removes the axis domain line. Use with selection.call(removeDomain). */
export function removeDomain(g: G): void {
  g.select('.domain').remove();
}

/**
 * Returns a .call()-compatible function that styles tick labels.
 * Usage: selection.call(tickText('#555555', 10))
 */
export function tickText(fill = '#555555', fontSize = 10) {
  return (g: G): void => {
    g.selectAll<SVGTextElement, unknown>('.tick text')
      .attr('fill', fill)
      .attr('font-size', fontSize);
  };
}

/**
 * Returns a .call()-compatible function that styles gridlines as dashed.
 * Usage: selection.call(gridLines(black))
 */
export function gridLines(color: string) {
  return (g: G): void => {
    g.selectAll<SVGLineElement, unknown>('.tick line')
      .attr('stroke', color)
      .attr('stroke-dasharray', '3,3');
  };
}
