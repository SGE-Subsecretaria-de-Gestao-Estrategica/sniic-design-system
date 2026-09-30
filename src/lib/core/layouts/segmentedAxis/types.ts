import type { ScaleLinear, ScaleTime } from "d3";
import type { AxisBreak, SharedXAxis, XAccessor, XValue } from "../types";

export type SegmentedAxisSpacing = {
  /** Width of each break, as a share of the axis width. */
  breakWidthRatio: number;
};

export type SegmentedAxisLayoutConfig<D> = Partial<SegmentedAxisSpacing> &
  XAccessor<D> & {
    width: number;
    /**
     * Break the axis after each of these values: values up to a break go to
     * the segment before it, and each segment gets its own scale.
     */
    breaksAfter?: readonly XValue[];
  };

export type SegmentScale = ScaleTime<number, number> | ScaleLinear<number, number>;

/** A continuous stretch of the x axis, with its own scale and ticks. */
export type AxisSegment = {
  index: number;
  domain: [XValue, XValue];
  range: [number, number];
  scale: SegmentScale;
  /** The distinct x values in the segment: use as axis/grid `tickValues`. */
  ticks: XValue[];
};

/** A (possibly broken) x axis; pass it to stacked panels as their `SharedXAxis`. */
export type SegmentedAxis = SharedXAxis & {
  segments: AxisSegment[];
  breaks: AxisBreak[];
  /** Index (into `segments`) of the segment an x value belongs to. */
  segmentOf: (x: XValue) => number;
};
