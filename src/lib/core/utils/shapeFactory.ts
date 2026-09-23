import type { ArcConfig } from "$lib/types/Arc";
import type { AreaPathConfig } from "$lib/types/Area";
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
