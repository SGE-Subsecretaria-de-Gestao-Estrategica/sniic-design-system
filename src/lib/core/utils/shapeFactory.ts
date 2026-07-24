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