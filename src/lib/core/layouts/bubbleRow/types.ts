import type {
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  SharedXAxis,
  ValueAccessor,
  XAccessor,
  XValue,
} from "../types";

export type BubbleRowSpacing = {
  /** Radius of the smallest value. */
  minRadius: number;
  /** Radius of the largest value. */
  maxRadius: number;
  /** Gap between a bubble's top and its value label. */
  labelGap: number;
  /** Gap between the last bubble's right edge and its end label. */
  endLabelGap: number;
};

/**
 * `xScale` / `width` / `breaks` come from a shared axis (spread a
 * `segmentedAxisLayout` or `lineSeriesLayout(...).xAxis`); the baseline is
 * cut at the `breaks`.
 */
export type BubbleRowLayoutConfig<D> = Partial<BubbleRowSpacing> &
  SharedXAxis &
  XAccessor<D> &
  ValueAccessor<D> & {
  /** Pin the value domain mapped to [minRadius, maxRadius]. Default: data extent. */
  valueDomain?: readonly [number, number];
  /** Replace the default area-proportional radius. */
  radius?: (value: number) => number;
  /** Place the last value label to the right of the last bubble. Default true. */
  endLabel?: boolean;
};

export type BubbleRowEntry<D> = {
  data: D;
  xValue: XValue;
  value: number;
};

export type BubbleRowItem<D> = BubbleRowEntry<D> & LayoutItem<D> & {
  x: number;
  y: number;
  radius: number;
  /** Value normalised to [0, 1] over the value domain (handy for colour ramps). */
  t: number;
  isLast: boolean;
  label: LabelPlacement;
};

export type BubbleRowLayout<D> = LayoutBox & {
  items: BubbleRowItem<D>[];
  /** Line through the bubble centres, one piece per x segment. */
  baseline: LineSegment[];
  /** Connectors across the axis breaks. */
  bridges: LineSegment[];
  /** y of the bubble centres (the row's axis). */
  centerY: number;
};
