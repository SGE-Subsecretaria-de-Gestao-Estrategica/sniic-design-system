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
