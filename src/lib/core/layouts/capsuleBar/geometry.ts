import { generateRoundedRect } from "$lib/core/utils/shapeFactory";
import type { Point } from "../types";
import type { CapsuleBox, CapsuleDot, CapsuleFrame, CapsuleOrientation, Rect } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

export function capsuleFrame(box: CapsuleBox, orientation: CapsuleOrientation): CapsuleFrame {
  const { x = 0, y = 0, width = 0, height = 0, reverse = false } = box;
  const horizontal = orientation === "horizontal";
  return {
    horizontal,
    // SVG y points down, so an unreversed vertical capsule grows toward -y.
    dir: horizontal === reverse ? -1 : 1,
    length: Math.max(0, horizontal ? width : height),
    thickness: Math.max(0, horizontal ? height : width),
    baseAt: horizontal ? (reverse ? x + width : x) : reverse ? y : y + height,
    acrossAt: horizontal ? y : x,
  };
}

/** The point `distance` from the base, `offset` across from the box's edge. */
export function pointAlong(frame: CapsuleFrame, distance: number, offset: number): Point {
  const along = frame.baseAt + frame.dir * distance;
  const across = frame.acrossAt + offset;
  return frame.horizontal ? { x: along, y: across } : { x: across, y: along };
}

/** The full-thickness band between two distances from the base. */
export function bandAlong(frame: CapsuleFrame, from: number, to: number): Rect {
  const a = frame.baseAt + frame.dir * from;
  const b = frame.baseAt + frame.dir * to;
  const start = Math.min(a, b);
  const size = Math.abs(b - a);
  return frame.horizontal
    ? { x: start, y: frame.acrossAt, width: size, height: frame.thickness }
    : { x: frame.acrossAt, y: start, width: frame.thickness, height: size };
}

/** The side of the box the tip points to. */
export function tipSide(frame: CapsuleFrame) {
  if (frame.horizontal) return frame.dir > 0 ? "right" : "left";
  return frame.dir > 0 ? "bottom" : "top";
}

/**
 * A flat-based capsule whose half-disc tip ends `length` from the base. It
 * reaches at least one diameter behind the tip so the half-disc is always
 * whole; a capsule shorter than that pokes past the base, for the caller to
 * clip — a tiny value shows as a sliver of the disc, never a full circle.
 */
export function capsulePath(frame: CapsuleFrame, length: number): string {
  const span = Math.max(length, frame.thickness);
  const box = bandAlong(frame, length - span, length);
  return generateRoundedRect(box.x, box.y, box.width, box.height, tipSide(frame), frame.thickness / 2);
}

/** Dot sitting concentric with the tip's half-disc. */
export function placeCapDot(frame: CapsuleFrame, length: number, ratio: number): CapsuleDot {
  const r = frame.thickness / 2;
  return { ...pointAlong(frame, length - r, r), radius: r * ratio };
}
