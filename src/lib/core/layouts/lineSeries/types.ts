import type { ScaleLinear } from "d3";
import type {
  AxisBreak,
  LabelPlacement,
  LabelSide,
  LayoutBox,
  LayoutItem,
  LineSegment,
  Accessor,
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
} from "../segmentedAxis";

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
  /** With `getPanel`: vertical gap between consecutive panels. */
  panelGap: number;
  /** With `getPanel`: room above each panel's plot for its title. */
  panelTitleHeight: number;
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
  /**
   * Place the last value label to the right of the last point. Default true.
   * Off, it sits above / below like the others and the name is centred on
   * the point.
   */
  endLabels?: boolean;
  /**
   * Panel key: one stacked panel (small multiple) per value, all on the same
   * x axis, each with its own series and title. Omit for a single panel.
   */
  getPanel?: Accessor<D, string>;
  /** Panels listed here come first (top to bottom); the rest keep data order. */
  panelOrder?: readonly string[];
  /**
   * With `getPanel`: every panel on the same y domain, so they compare
   * (default true). Off, each panel gets its own, from its data.
   */
  shareY?: boolean;
};

export type LineSeriesEntry<D> = {
  data: D;
  series: string;
  panel: string;
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

/**
 * `key` is unique in the layout: the series name, prefixed by its panel
 * (`panel::name`) when there are panels. Read the name from `name`.
 */
export type LineSeriesItem<D> = {
  key: string;
  index: number;
  /** The series name (the `getSeries` value). */
  name: string;
  /** Key of the panel the series is drawn in. */
  panel: string;
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

/**
 * One stacked panel. Coordinates are the layout's: the panel's points
 * already include its `top`.
 */
export type LineSeriesPanel = {
  key: string;
  index: number;
  /** Top of the panel's slot (its title band, then its plot). */
  slotTop: number;
  /** Top and height of the plot, under the title band. */
  top: number;
  height: number;
  bottom: number;
  /** Maps a value to the layout's y, inside this panel's plot. */
  yScale: ScaleLinear<number, number>;
  /** Where the panel's title goes. Absent without `getPanel`. */
  title?: LabelPlacement;
};

export type LineSeriesLayout<D> = LayoutBox & {
  /** Every series, of every panel. */
  series: LineSeriesItem<D>[];
  /** One panel without `getPanel`, covering the whole plot. */
  panels: LineSeriesPanel[];
  /** Whether `getPanel` split the chart into panels. */
  isPaneled: boolean;
  /** The x axis used: pass it to stacked panels (it is a `SharedXAxis`). */
  xAxis: SegmentedAxis;
  /** Shortcuts to `xAxis.segments` / `.breaks` / `.xScale`. */
  segments: AxisSegment[];
  breaks: AxisBreak[];
  xScale: XScaleFn;
  /** The first panel's y scale (each panel has its own in `panels`). */
  yScale: ScaleLinear<number, number>;
};
