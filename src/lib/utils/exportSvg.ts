/**
 * Inlines computed styles from matched CSS rules into the SVG element's style
 * attributes so the exported file looks correct when opened outside a browser.
 */
function inlineStyles(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  const source = svgEl.querySelectorAll('*');
  const dest   = clone.querySelectorAll('*');

  source.forEach((src, i) => {
    const computed = window.getComputedStyle(src);
    const target   = dest[i] as SVGElement;
    // Only carry properties that are explicitly set on the element (via class or attr).
    // This avoids bloating every node with hundreds of inherited defaults.
    const declared = (src as SVGElement).style;
    for (let j = 0; j < declared.length; j++) {
      const prop = declared[j];
      target.style.setProperty(prop, computed.getPropertyValue(prop));
    }
  });

  return clone;
}

/**
 * Serializes an SVGSVGElement to a well-formed SVG string.
 */
export function serializeSvg(svgEl: SVGSVGElement): string {
  const clone = inlineStyles(svgEl);
  clone.setAttribute('xmlns',       'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return new XMLSerializer().serializeToString(clone);
}

/**
 * Triggers a browser file download of the SVG element as a `.svg` file.
 * Uses window.top when available to bypass iframe sandbox restrictions (e.g. Storybook).
 */
export function downloadSvg(svgEl: SVGSVGElement, filename = 'chart.svg'): void {
  const svgString = serializeSvg(svgEl);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url  = URL.createObjectURL(blob);

  try {
    const doc = (window.top ?? window).document;
    const a   = doc.createElement('a');
    a.href     = url;
    a.download = filename;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}
