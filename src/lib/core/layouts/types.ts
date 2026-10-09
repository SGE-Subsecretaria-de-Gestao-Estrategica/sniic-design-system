import type { Accessor } from "$lib/types/Accessor";

export type { Accessor };

export type XValue = Date | number;

export type XScaleFn = (x: XValue) => number;

export type Point = { x: number; y: number };

export type LineSegment = { from: Point; to: Point };

export type SortOrder = "descending" | "ascending" | "none";

export type LabelSide = "above" | "below";

export type TextAnchor = "start" | "middle" | "end";
export type VerticalAnchor = "start" | "middle" | "end";

export type LabelPlacement = Point & {
  textAnchor: TextAnchor;
  verticalAnchor: VerticalAnchor;
};

export type AxisBreak = {
  index: number;
  x0: number;
  x1: number;
};

// ----------------------------------
// Contracts
// ----------------------------------

export type LayoutBox = { width: number; height: number };

export type Rect = Point & LayoutBox;

export type LayoutItem<T> = { key: string; index: number; data: T };

export type SharedXAxis = {
  xScale: XScaleFn;
  width: number;
  breaks?: readonly AxisBreak[];
};

export type XAccessor<D> = { getX: Accessor<D, XValue> };
export type YAccessor<D> = { getY: Accessor<D, number> };
export type ValueAccessor<D> = { getValue: Accessor<D, number> };
export type CategoryAccessor<D> = { getCategory: Accessor<D, string> };
export type GroupAccessor<D> = { getGroup: Accessor<D, string> };
export type SeriesAccessor<D> = { getSeries: Accessor<D, string> };

/** A d3 scale a layout positions with — band, point or continuous. */
export type PositionScale = {
  (value: any): number | undefined;
  range(): number[];
  bandwidth?(): number;
};

/** Series keys and how to read one series' value off a datum. */
export type SeriesAccessors<D, K extends string> = {
  /** Series keys, in series order. */
  keys: readonly K[];
  /** Defaults to reading `datum[key]`. */
  getValue?: (d: D, key: K) => number;
};
