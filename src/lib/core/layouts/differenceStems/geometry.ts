import * as d3 from "d3";
import type { StemRect } from "./types";

export function createValueScale(domain: [number, number], height: number) {
  return d3.scaleLinear().domain(domain).range([height, 0]);
}

export function stemRect(x: number, baselineY: number, tipY: number, width: number): StemRect {
  return {
    x: x - width / 2,
    y: Math.min(baselineY, tipY),
    width,
    height: Math.abs(baselineY - tipY),
  };
}
