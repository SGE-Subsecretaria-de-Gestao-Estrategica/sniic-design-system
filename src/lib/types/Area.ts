import * as d3 from 'd3';
import type { Snippet } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import type { AccessorForArrayItem } from './Accessor';
import type { PathProps } from './Path';

export type AreaPathConfig<Datum> = {
  defined?: AccessorForArrayItem<Datum, boolean>;
  curve?: d3.CurveFactory;
  x?: number | AccessorForArrayItem<Datum, number>;
  x0?: number | AccessorForArrayItem<Datum, number>;
  x1?: number | AccessorForArrayItem<Datum, number>;
  y?: number | AccessorForArrayItem<Datum, number>;
  y0?: number | AccessorForArrayItem<Datum, number>;
  y1?: number | AccessorForArrayItem<Datum, number>;
};

export type AreaPathProps<Datum> = {
  data?: Datum[];
  innerRef?: SVGPathElement | null;
  children?: Snippet<[d3.Area<Datum>]>;
  className?: ClassValue;

  fill?: string;
  stroke?: string;
  fillOpacity?: PathProps['fill-opacity'];
  strokeWidth?: PathProps['stroke-width'];
  strokeOpacity?: PathProps['stroke-opacity'];
} & AreaPathConfig<Datum>;
