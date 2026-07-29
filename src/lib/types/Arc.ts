import type * as d3 from 'd3';
import type { Snippet } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import type { Accessor } from './Accessor';
import type { PathProps } from './Path';

export type ArcDatum = {
  startAngle: number;
  endAngle: number;
  padAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
};

export type ArcConfig<Datum> = {
  /** Radians, measured clockwise from 12 o'clock. */
  startAngle?: number | Accessor<Datum, number>;
  endAngle?: number | Accessor<Datum, number>;
  padAngle?: number | Accessor<Datum, number>;
  innerRadius?: number | Accessor<Datum, number>;
  outerRadius?: number | Accessor<Datum, number>;
  cornerRadius?: number | Accessor<Datum, number>;
  padRadius?: number | Accessor<Datum, number>;
};

export type ArcOwnProps<Datum> = {
  /** Omit to render a single arc described by the numeric props alone. */
  data?: Datum;
  innerRef?: SVGPathElement | null;
  className?: ClassValue;
  /** Receives the configured generator and the arc's centroid. */
  children?: Snippet<[{ arc: d3.Arc<any, Datum>; centroid: [number, number] }]>;

  fill?: string;
  stroke?: string;
  fillOpacity?: PathProps['fill-opacity'];
  strokeWidth?: PathProps['stroke-width'];
  strokeOpacity?: PathProps['stroke-opacity'];
} & ArcConfig<Datum>;

export type ArcProps<Datum> = ArcOwnProps<Datum> &
  Omit<PathProps, keyof ArcOwnProps<Datum>>;
