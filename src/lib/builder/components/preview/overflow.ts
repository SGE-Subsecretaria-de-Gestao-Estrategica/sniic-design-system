/** How far the drawing passes each side of the figure, in px (0 = inside). */
export type Overflow = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Below this it is rounding, or a stroke's half width. */
const TOLERANCE = 1;

/**
 * Compares what an `<svg>` draws with its own box. Charts are drawn with
 * `overflow: visible`, so a label can end outside the figure and be cut (or
 * hang into the page) once the figure is placed in the report.
 */
export function measureOverflow(svg: SVGSVGElement): Overflow | null {
  const frame = svg.getBoundingClientRect();
  const sides: Overflow = { top: 0, right: 0, bottom: 0, left: 0 };
  for (const mark of svg.querySelectorAll("text, circle, rect, path, line")) {
    // Paint servers and clip shapes aren't drawn themselves.
    if (mark.closest("defs, clipPath")) continue;
    const box = mark.getBoundingClientRect();
    if (!box.width && !box.height) continue;
    sides.top = Math.max(sides.top, frame.top - box.top);
    sides.right = Math.max(sides.right, box.right - frame.right);
    sides.bottom = Math.max(sides.bottom, box.bottom - frame.bottom);
    sides.left = Math.max(sides.left, frame.left - box.left);
  }
  const passes = Object.values(sides).some((px) => px > TOLERANCE);
  return passes ? sides : null;
}

const SIDES: [keyof Overflow, string][] = [
  ["left", "à esquerda"],
  ["right", "à direita"],
  ["top", "em cima"],
  ["bottom", "embaixo"],
];

export function describeOverflow(overflow: Overflow | null): string | null {
  if (!overflow) return null;
  const parts = SIDES.filter(([side]) => overflow[side] > TOLERANCE).map(
    ([side, label]) => `${Math.ceil(overflow[side])} px ${label}`,
  );
  if (!parts.length) return null;
  return `O desenho passa da moldura da figura: ${parts.join(", ")}. Aumente o tamanho, troque as margens ou encurte os rótulos.`;
}
