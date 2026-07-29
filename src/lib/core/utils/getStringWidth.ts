import memoize from "./memoize";

const MEASUREMENT_ELEMENT_ID = '__svg_text_measurement_id';

function getStringWidth(str: string, style?: string) {
  if (typeof document === 'undefined') return null;

  try {
    let textEl = document.getElementById(MEASUREMENT_ELEMENT_ID) as SVGTextElement | null;
    if (!textEl) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.position = 'absolute';
      svg.style.top = '-100%';
      svg.style.left = '-100%';
      textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('id', MEASUREMENT_ELEMENT_ID);
      svg.appendChild(textEl);
      document.body.appendChild(svg);
    }

    // `style` is a CSS text string. Object.assign would treat it as an
    // array-like of characters and throw on the read-only indexed properties
    // of CSSStyleDeclaration, so every styled measurement returned null and
    // callers silently fell back to character-count estimates.
    if (style) textEl.setAttribute('style', style);
    else textEl.removeAttribute('style');
    textEl.textContent = str;
    return textEl.getComputedTextLength();
  } catch {
    return null;
  }
}

export default memoize(getStringWidth, (str, style) => `${str}_${style}`);