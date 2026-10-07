const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The chart as a standalone SVG file. The drawing carries its whole look in
 * attributes, so the copy needs no stylesheet; fonts stay referenced by name,
 * as in the stories. `css` goes into a `<style>` (used to embed fonts).
 */
export function svgMarkup(svg: SVGSVGElement, css?: string): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", SVG_NS);

  // Svelte leaves empty comments between nodes.
  const comments = document.createTreeWalker(copy, NodeFilter.SHOW_COMMENT);
  const empty: Node[] = [];
  while (comments.nextNode()) empty.push(comments.currentNode);
  for (const node of empty) node.parentNode?.removeChild(node);

  if (css) {
    const style = document.createElementNS(SVG_NS, "style");
    style.textContent = css;
    copy.insertBefore(style, copy.firstChild);
  }
  return new XMLSerializer().serializeToString(copy);
}
