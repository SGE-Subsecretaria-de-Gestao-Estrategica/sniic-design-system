import type { ArcConfig } from "$lib/types/Arc";
import type { AreaPathConfig } from "$lib/types/Area";
import type {
  CapsuleBarConfig,
  CapsuleBarGeometry,
  CapsuleBox,
  CapsuleDot,
  CapsuleFrame,
  CapsuleOrientation,
} from "$lib/types/CapsuleBar";
import type {
  CapsuleStackConfig,
  CapsuleStackGeometry,
  CapsuleStackPiece,
  CapsuleStackSegment,
} from "$lib/types/CapsuleStack";
import type { Point, Rect } from "$lib/core/layouts/types";
import type { LinePathConfig } from "$lib/types/Line";
import type { RoundedRectConfig } from "$lib/types/RoundedRect";
import * as d3 from "d3";
import setNumberOrNumberAccessor from "./setNumberOrNumberAccessor";

export function line<Datum>({ x, y, defined, curve }: LinePathConfig<Datum> = {}) {
  const path = d3.line<Datum>();
  if (x) setNumberOrNumberAccessor(path.x, x);
  if (y) setNumberOrNumberAccessor(path.y, y);
  if (defined) path.defined(defined);
  if (curve) path.curve(curve);
  return path;
}

export function area<Datum>({
  x,
  x0,
  x1,
  y,
  y0,
  y1,
  defined,
  curve,
}: AreaPathConfig<Datum> = {}) {
  const path = d3.area<Datum>();
  // Compared against null rather than truthiness: a baseline of 0 is the
  // most common `y0`/`x0` there is.
  if (x != null) setNumberOrNumberAccessor(path.x, x);
  if (x0 != null) setNumberOrNumberAccessor(path.x0, x0);
  if (x1 != null) setNumberOrNumberAccessor(path.x1, x1);
  if (y != null) setNumberOrNumberAccessor(path.y, y);
  if (y0 != null) setNumberOrNumberAccessor(path.y0, y0);
  if (y1 != null) setNumberOrNumberAccessor(path.y1, y1);
  if (defined) path.defined(defined);
  if (curve) path.curve(curve);
  return path;
}

export function arc<Datum>({
  startAngle,
  endAngle,
  padAngle,
  innerRadius,
  outerRadius,
  cornerRadius,
  padRadius,
}: ArcConfig<Datum> = {}) {
  const path = d3.arc<Datum>();
  if (startAngle != null) setNumberOrNumberAccessor(path.startAngle, startAngle);
  if (endAngle != null) setNumberOrNumberAccessor(path.endAngle, endAngle);
  if (padAngle != null) setNumberOrNumberAccessor(path.padAngle, padAngle);
  if (innerRadius != null) setNumberOrNumberAccessor(path.innerRadius, innerRadius);
  if (outerRadius != null) setNumberOrNumberAccessor(path.outerRadius, outerRadius);
  if (cornerRadius != null) setNumberOrNumberAccessor(path.cornerRadius, cornerRadius);
  if (padRadius != null) setNumberOrNumberAccessor(path.padRadius, padRadius);
  return path;
}

export function generateRoundedRect(x = 0, y = 0, width: number, height: number, side: 'top' | 'right' | 'bottom' | 'left', radius: number): string {
  if (!radius) {
    radius = Math.min(width, height)
  }
  
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  let tl = 0, tr = 0, br = 0, bl = 0;

  if (side === 'top') {
    tl = r; tr = r;
  } else if (side === 'right') {
    tr = r; br = r;
  } else if (side === 'bottom') {
    br = r; bl = r;
  } else if (side === 'left') {
    bl = r; tl = r;
  } else {
    throw new Error(`Invalid side: "${side}". Use 'top' | 'right' | 'bottom' | 'left'.`);
  }

  const arc = (rad: number, px: number, py: number) => (rad ? `A${rad},${rad} 0 0 1 ${px},${py}` : '');

  const d = [
    `M${x + tl},${y}`,
    `H${x + width - tr}`,
    arc(tr, x + width, y + tr),
    `V${y + height - br}`,
    arc(br, x + width - br, y + height),
    `H${x + bl}`,
    arc(bl, x, y + height - bl),
    `V${y + tl}`,
    arc(tl, x + tl, y),
    'Z',
  ]
    .filter(Boolean)
    .join(' ');

  return d;
}

export function generateHexagon(radius: number): string {
  const sqrt3 = Math.sqrt(3);
  return (
    `M${radius},0` + 
    `L${radius / 2},${radius * sqrt3 / 2}` + 
    `L-${radius / 2},${radius * sqrt3 / 2}` + 
    `L-${radius},0` + 
    `L-${radius / 2},-${radius * sqrt3 / 2}` + 
    `L${radius / 2},-${radius * sqrt3 / 2}` + 
    `Z`
  )
}

/**
 * A rect path with independently roundable corners — what a plain `<rect rx>`
 * can't do, since SVG's native radius applies to all four corners alike. Used
 * for a stacked-bar segment (top corners only, base flush with its neighbour)
 * or a legend/pill chip (one rounded end, or both — set `radius` to half the
 * height for a full capsule).
 *
 * Not built on a D3 generator like `line`/`area`/`arc` above: there's no
 * accessor to bind per-datum, just four numbers and which corners to round.
 */
export function roundedRect({
  x,
  y,
  width,
  height,
  radius = 0,
  corners = { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true },
}: RoundedRectConfig): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));

  const tl = corners.topLeft ? r : 0;
  const tr = corners.topRight ? r : 0;
  const br = corners.bottomRight ? r : 0;
  const bl = corners.bottomLeft ? r : 0;

  if (!tl && !tr && !br && !bl) {
    return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
  }

  return [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    tr ? `A${tr},${tr} 0 0 1 ${x + w},${y + tr}` : "",
    `V${y + h - br}`,
    br ? `A${br},${br} 0 0 1 ${x + w - br},${y + h}` : "",
    `H${x + bl}`,
    bl ? `A${bl},${bl} 0 0 1 ${x},${y + h - bl}` : "",
    `V${y + tl}`,
    tl ? `A${tl},${tl} 0 0 1 ${x + tl},${y}` : "",
    "Z",
  ]
    .filter(Boolean)
    .join(" ");
}

// ----------------------------------
// Capsule: the Cultura em Números bar
// ----------------------------------

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
function pointAlong(frame: CapsuleFrame, distance: number, offset: number): Point {
  const along = frame.baseAt + frame.dir * distance;
  const across = frame.acrossAt + offset;
  return frame.horizontal ? { x: along, y: across } : { x: across, y: along };
}

/** The full-thickness band between two distances from the base. */
function bandAlong(frame: CapsuleFrame, from: number, to: number): Rect {
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
function capsulePath(frame: CapsuleFrame, length: number): string {
  const span = Math.max(length, frame.thickness);
  const box = bandAlong(frame, length - span, length);
  return generateRoundedRect(box.x, box.y, box.width, box.height, tipSide(frame), frame.thickness / 2);
}

/** Dot sitting concentric with the tip's half-disc. */
function placeCapDot(frame: CapsuleFrame, length: number, ratio: number): CapsuleDot {
  const r = frame.thickness / 2;
  return { ...pointAlong(frame, length - r, r), radius: r * ratio };
}

/**
 * The capsule bar in a box: a flat base, a fully round tip and a dot
 * concentric with the tip.
 */
export function capsuleBar({ orientation, dotRatio, ...box }: CapsuleBarConfig): CapsuleBarGeometry {
  const frame = capsuleFrame(box, orientation);
  const { length, thickness } = frame;
  const r = thickness / 2;

  return {
    length,
    thickness,
    clip: bandAlong(frame, 0, length),
    path: capsulePath(frame, length),
    gradient: { from: pointAlong(frame, 0, r), to: pointAlong(frame, length, r) },
    dot: placeCapDot(frame, length, dotRatio),
  };
}

/**
 * A capsule split into segments: one flat base and one round tip for the
 * stack as a whole, the segments plain bands inside it — so no segment gets
 * rounded corners that would shave off area its value does not lose. The
 * box is the stack's; its length is the segments' sum.
 */
export function capsuleStack<S extends CapsuleStackSegment>(
  segments: readonly S[],
  { orientation, gap, ...box }: CapsuleStackConfig,
): CapsuleStackGeometry<S> {
  const frame = capsuleFrame(box, orientation);

  let cursor = 0;
  const pieces = segments.flatMap((segment, index): CapsuleStackPiece<S>[] => {
    if (!(segment.length > 0)) return [];
    const from = cursor;
    cursor += segment.length;
    return [{ ...segment, index, from, to: cursor, rect: bandAlong(frame, from, cursor) }];
  });
  const total = cursor;

  return {
    total,
    thickness: frame.thickness,
    clip: bandAlong(frame, 0, total),
    path: capsulePath(frame, total),
    pieces,
    gaps: pieces.slice(1).map((piece) => bandAlong(frame, piece.from - gap / 2, piece.from + gap / 2)),
  };
}
