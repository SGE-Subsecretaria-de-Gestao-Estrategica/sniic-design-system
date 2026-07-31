import type { ScaleBand } from 'd3';
import type { Snippet } from 'svelte';
import type { ClassValue, SVGAttributes } from 'svelte/elements';
import type { Accessor, AccessorForArrayItem } from './Accessor';
import type { D3Scale } from './Scale';
import type { StringLike } from './Base';

export type BarScale<Output = number> = D3Scale<Output, any, any>;

export type BarOwnProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Corner radius, applied to both axes unless `ry` is given. */
  rx?: number | string;
  ry?: number | string;
  class?: ClassValue;
  innerRef?: SVGRectElement | null;
  fill?: string;
  fillOpacity?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeOpacity?: number | string;
};

export type BarProps = BarOwnProps &
  Omit<SVGAttributes<SVGRectElement>, keyof BarOwnProps>;

/** One rendered rectangle, as handed to the `children` snippet. */
export type ComputedBar<Key extends StringLike = string> = {
  key: Key;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** The stacked/grouped value this rect represents. */
  value: number;
};

export type ComputedBarStack<Key extends StringLike = string> = {
  key: Key;
  index: number;
  color: string;
  bars: ComputedBar<Key>[];
};

export type ComputedBarGroup<Key extends StringLike = string> = {
  /** The category this group belongs to. */
  index: number;
  x0: number;
  y0: number;
  bars: ComputedBar<Key>[];
};

type SeriesSharedProps<Datum, Key extends StringLike> = {
  data?: Datum[];
  /** Series keys, in series order. */
  keys?: Key[];
  /** Colour per series; defaults to the theme's categorical palette. */
  color?: AccessorForArrayItem<Key, string>;
  /** Series value; defaults to reading `datum[key]`. */
  value?: (d: Datum, key: Key) => number;
  /** Category accessor — its output feeds the band scale. */
  category: Accessor<Datum, StringLike>;
  /**
   * When true, categories run down `yScale` (band) and values along `xScale`
   * (linear). When false, the reverse.
   */
  horizontal?: boolean;
  /** Corner radius, forwarded to every rect. */
  rx?: number | string;
  ry?: number | string;
  top?: number;
  left?: number;
  className?: ClassValue;
};

export type BarStackProps<
  Datum,
  Key extends StringLike = string,
  XScale extends BarScale = BarScale,
  YScale extends BarScale = BarScale,
> = SeriesSharedProps<Datum, Key> & {
  xScale: XScale;
  yScale: YScale;
  /** Passed to `d3.stack().order()`. */
  order?: (series: any) => number[];
  /** Passed to `d3.stack().offset()`. */
  offset?: (series: any, order: number[]) => void;
  children?: Snippet<[{ barStacks: ComputedBarStack<Key>[] }]>;
};

export type BarGroupProps<
  Datum,
  Key extends StringLike = string,
  XScale extends BarScale = BarScale,
  YScale extends BarScale = BarScale,
> = SeriesSharedProps<Datum, Key> & {
  /** Outer band scale — one band per category. */
  xScale: XScale;
  yScale: YScale;
  /** Inner band scale over `keys`; built from the outer bandwidth when omitted. */
  groupScale?: ScaleBand<string>;
  /** Gap between bars within a group, as a fraction of the inner bandwidth. */
  groupPadding?: number;
  children?: Snippet<[{ barGroups: ComputedBarGroup<Key>[] }]>;
};
