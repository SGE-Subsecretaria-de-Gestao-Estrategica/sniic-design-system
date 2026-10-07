import type { ScaleLinear } from "d3";
import type {
  AxisBreak,
  LabelPlacement,
  LabelSide,
  LayoutBox,
  LayoutItem,
  LineSegment,
  SeriesAccessor,
  XAccessor,
  XScaleFn,
  XValue,
  YAccessor,
} from "../types";
import type {
  AxisSegment,
  SegmentedAxis,
  SegmentedAxisSpacing,
  SegmentScale,
} from "../segmentedAxis/types";

export type { LabelSide };

/** @deprecated alias: the segment type now lives in `segmentedAxis`. */
export type LineSeriesSegment = AxisSegment;
/** @deprecated alias: the segment scale type now lives in `segmentedAxis`. */
export type LineSeriesXScale = SegmentScale;

export type LineSeriesSpacing = {
  /** Padding added to both ends of the y domain, as a share of its range. */
  yPaddingRatio: number;
  /** Vertical gap between a point and its value label. */
  valueLabelGap: number;
  /** Horizontal gap between the last point and the end labels. */
  endLabelGap: number;
  /** Vertical gap between the last point and the end value label. */
  endValueGap: number;
  /** Room kept for the end value when the series name stacks under it. */
  endValueHeight: number;
};

export type LineSeriesLayoutConfig<D> = Partial<LineSeriesSpacing> &
  Partial<SegmentedAxisSpacing> &
  XAccessor<D> &
  YAccessor<D> &
  /** Series key. Omit for a single-series chart. */
  Partial<SeriesAccessor<D>> & {
  width: number;
  height: number;
  /**
   * A prebuilt x axis (`segmentedAxisLayout`), e.g. shared with other
   * panels. When given, `breaksAfter` / `breakWidthRatio` are ignored.
   */
  xAxis?: SegmentedAxis;
  /**
   * Break the x axis after each of these values: points up to a break go to
   * the segment before it, and each segment gets its own scale.
   */
  breaksAfter?: readonly XValue[];
  /** Pin the y domain instead of deriving it from the data. */
  yDomain?: readonly [number, number];
  /** Series listed here come first (drawing order); the rest keep data order. */
  seriesOrder?: readonly string[];
  /** Side of the value labels, for every series or per series. Default "above". */
  labelSide?: LabelSide | ((series: string) => LabelSide);
  /** Place the last value label to the right of the last point. Default true. */
  endLabels?: boolean;
};

export type LineSeriesEntry<D> = {
  data: D;
  series: string;
  xValue: XValue;
  yValue: number;
};

/** `index`: position in the series, sorted by x. */
export type LineSeriesPoint<D> = LineSeriesEntry<D> & LayoutItem<D> & {
  segment: number;
  x: number;
  y: number;
  isFirst: boolean;
  isLast: boolean;
  isSegmentStart: boolean;
  isSegmentEnd: boolean;
  /** Its label is the series' end value (right of the last point). */
  isEndLabel: boolean;
  label: LabelPlacement;
};

export type LineSeriesItem<D> = {
  key: string;
  index: number;
  side: LabelSide;
  points: LineSeriesPoint<D>[];
  /** One continuous path per x segment. */
  paths: LineSeriesPoint<D>[][];
  /** Connectors across the axis breaks (last point → next segment's first). */
  bridges: LineSegment[];
  last: LineSeriesPoint<D>;
  /** Series name, next to the last point (stacked with the end value). */
  nameLabel: LabelPlacement;
};

export type LineSeriesLayout<D> = LayoutBox & {
  series: LineSeriesItem<D>[];
  /** The x axis used: pass it to stacked panels (it is a `SharedXAxis`). */
  xAxis: SegmentedAxis;
  /** Shortcuts to `xAxis.segments` / `.breaks` / `.xScale`. */
  segments: AxisSegment[];
  breaks: AxisBreak[];
  xScale: XScaleFn;
  yScale: ScaleLinear<number, number>;
};
