import type { ArcConfig } from "$lib/types/Arc";
import type { AreaPathConfig } from "$lib/types/Area";
import type { LinePathConfig } from "$lib/types/Line";
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

export function generateRoundedRect(x = 0, y = 0, width: number, height: number, side: 'top' | 'right' | 'bottom' | 'left', radius: number) {
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
