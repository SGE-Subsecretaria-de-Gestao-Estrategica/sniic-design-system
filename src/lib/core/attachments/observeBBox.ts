import type { Attachment } from "svelte/attachments";
import type { Rect } from "$lib/core/layouts/types";

/**
 * Attachment that reports an SVG element's `getBBox()` — on mount, whenever
 * its text or attributes change, and once the web fonts land, since the
 * fallback font sets a different width.
 */
export function observeBBox(onMeasure: (box: Rect) => void): Attachment<SVGGraphicsElement> {
  return (el) => {
    const measure = () => {
      const { x, y, width, height } = el.getBBox();
      onMeasure({ x, y, width, height });
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      observer.disconnect();
    };
  };
}
