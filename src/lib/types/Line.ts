import * as d3 from 'd3';
import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";
import type { AccessorForArrayItem } from "./Accessor";
import type { PathProps } from './Path';

interface Point {
  x?: number;
  y?: number;
}

export type LineProps = {
  class?: ClassValue;
  innerRef?: SVGLineElement | null;
  fill?: string;
  from?: Point;
  to?: Point;
  stroke?: string;
  strokeWidth?: PathProps["stroke-width"];
  strokeDasharray?: PathProps["stroke-dasharray"];
  strokeOpacity?: PathProps["stroke-opacity"];
};

export type LinePathConfig<Datum> = {
  defined?: AccessorForArrayItem<Datum, boolean>;
  curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
  x?: number | AccessorForArrayItem<Datum, number>;
  y?: number | AccessorForArrayItem<Datum, number>;
};

export type LinePathProps<Datum> = {
  data?: Datum[];
  innerRef?: SVGPathElement | null;
  children?: Snippet<[d3.Line<Datum>]>;
  className?: ClassValue;
  
  fill?: string;
  stroke?: string;
  fillOpacity?: PathProps["fill-opacity"];
  strokeWidth?: PathProps["stroke-width"];
  strokeOpacity?: PathProps["stroke-opacity"];
} & LinePathConfig<Datum>;