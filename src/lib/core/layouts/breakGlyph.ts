import type { LineSegment, Point } from "./types";

export type BreakGlyph = {
  /** Where the rotated label starts; it grows upward from here. */
  label: Point;
  /** Two axis stubs and the two slashes between them. */
  segments: LineSegment[];
  strokeWidth: number;
};

/**
 * The torn-axis mark for a break at `x` on an axis at `axisY`: a chevron
 * just above the axis and a label above it, all scaled by `size`.
 */
export function breakGlyph(x: number, axisY: number, size: number): BreakGlyph {
  const y = axisY - size * 0.7;
  const seg = (x1: number, y1: number, x2: number, y2: number): LineSegment => ({
    from: { x: x1, y: y1 },
    to: { x: x2, y: y2 },
  });
  return {
    label: { x, y: y - size * 1.4 },
    segments: [
      seg(x - size * 1.7, y, x - size * 0.7, y),
      seg(x + size * 0.7, y, x + size * 1.7, y),
      seg(x - size * 0.5, y + size * 0.6, x + size * 0.08, y - size * 0.6),
      seg(x - size * 0.08, y + size * 0.6, x + size * 0.5, y - size * 0.6),
    ],
    strokeWidth: size * 0.23,
  };
}
