import type { ScaleLinear } from "d3";
import type {
  LabelPlacement,
  LayoutBox,
  LineSegment,
  SeriesAccessor,
  XAccessor,
  XValue,
  YAccessor,
} from "../types";
import type { SegmentedAxis, SegmentedAxisSpacing } from "../segmentedAxis";
import type { BendReach } from "./geometry";

export type RankedRibbonsSpacing = {
  /** Share of the step between two columns each ribbon holds flat, either side of a column. */
  plateau: number;
  /** Vertical gap between two stacked ribbons, in px. Not the outline: actual space. */
  ribbonGap: number;
  /** Room kept above the tallest stack for its total. */
  totalsRoom: number;
  /** Gap between the top of a stack and its total. */
  totalGap: number;
  /** Horizontal gap between the plot's right edge and the end labels. */
  endLabelGap: number;
  /** Line height of the end value (the `dataLabel` role). */
  endValueHeight: number;
  /** Line height of the series name under it (the `seriesLabel` role). */
  endNameHeight: number;
  /** Minimum vertical space between two end-label blocks. */
  endLabelSpacing: number;
  /** Line height of a value inside a band (the `valueLabel` role). */
  valueLabelHeight: number;
  /** Air kept around a value inside its band, in total (half on each side). */
  valueLabelPadding: number;
};

/** Where the largest value of a column goes when the stack is ranked. */
export type RankDirection = "largestOnTop" | "largestAtBottom";

export type RankedRibbonsLayoutConfig<D> = Partial<RankedRibbonsSpacing> &
  Partial<SegmentedAxisSpacing> &
  XAccessor<D> &
  YAccessor<D> &
  SeriesAccessor<D> & {
    width: number;
    height: number;
    /**
     * Break the x axis after each of these values (e.g. the RAIS methodology
     * break): columns up to a break go to the segment before it.
     */
    breaksAfter?: readonly XValue[];
    /** Series listed here come first (their `index`, so their colour); the rest keep data order. */
    seriesOrder?: readonly string[];
    /**
     * Stack each column by value, so the ribbons cross where the ranking
     * changes. Default true. Off, every column stacks in `stackOrder`.
     */
    ranked?: boolean;
    /** While ranked: where the largest value goes. Default `largestOnTop`. */
    rankDirection?: RankDirection;
    /**
     * While not ranked: the stack, top to bottom. Series listed here come
     * first; the rest keep series order. Doesn't change `index` (colours).
     */
    stackOrder?: readonly string[];
    /** Keep room above the stacks for the totals. Default true. */
    totals?: boolean;
    /** Close each ribbon with its last value and name, right of the plot. Default true. */
    endLabels?: boolean;
    /**
     * While `endLabels`: put the last value in the end label. Default true.
     * Off, the last column's values stay in their bands like the others and
     * only the name goes right of the plot.
     */
    endValues?: boolean;
    /**
     * Lines the series name takes in the end label, once wrapped to the
     * width it is drawn at. Default 1. The blocks are pushed apart by their
     * real height, so a long name doesn't run into the next value.
     */
    endNameLines?: (series: string) => number;
  };

/** One series at one column: a band of its stack. */
export type RankedRibbonsSlot<D> = {
  /** `series::x` */
  key: string;
  series: string;
  /** Index of the series in series order. */
  seriesIndex: number;
  /** Index of the column. */
  column: number;
  xValue: XValue;
  value: number;
  /** Share of the column's total. */
  share: number;
  /** Position in the stack from the top (0 = top). */
  rank: number;
  /** Centre of the column and the edges of the plateau. */
  x: number;
  x0: number;
  x1: number;
  /** Top and bottom of the band. */
  y0: number;
  y1: number;
  /** Its value is drawn right of the plot instead of inside the band. */
  isEndLabel: boolean;
  /** The band is tall enough for a line of value. */
  labelFits: boolean;
  /**
   * How far its value may run into the bend on each side and stay clear of
   * every edge, sharing the bend with the next column's value or alone in it;
   * `null` where there is no bend (the ends of a segment). `placeValue` turns
   * it into a position and a width.
   */
  labelReach: { left: BendReach | null; right: BendReach | null };
  /** Where its value goes and the widest that fits, when both neighbours show values too. */
  label: LabelPlacement;
  labelRoom: number;
  /** The row it came from; `undefined` when the series has no row at this column (drawn as 0). */
  data: D | undefined;
};

export type RankedRibbonsColumn<D> = {
  key: string;
  index: number;
  xValue: XValue;
  segment: number;
  x: number;
  x0: number;
  x1: number;
  total: number;
  /** Top of the stack. */
  top: number;
  isFirst: boolean;
  isLast: boolean;
  isSegmentStart: boolean;
  isSegmentEnd: boolean;
  /** Bottom to top. */
  slots: RankedRibbonsSlot<D>[];
  /** Above the stack. */
  totalLabel: LabelPlacement;
};

/** The value and name closing a ribbon, right of the plot, with a leader from the ribbon. */
export type RankedRibbonsEnd = {
  /** Absent when `endValues` is off. */
  value?: LabelPlacement;
  name: LabelPlacement;
  leader: LineSegment;
};

export type RankedRibbon<D> = {
  /** The series. */
  key: string;
  /** Index in series order (stable: use it for colours). */
  index: number;
  sum: number;
  /** One SVG path per x segment: plateaus at the columns, `curveBumpX` bends between them. */
  paths: string[];
  /** The bends across the axis breaks, from one segment's last plateau to the next one's first. */
  bridges: string[];
  last: RankedRibbonsSlot<D>;
  /** Only when `endLabels` is on and the last value is above 0. */
  end?: RankedRibbonsEnd;
};

export type RankedRibbonsLayout<D> = LayoutBox & {
  columns: RankedRibbonsColumn<D>[];
  /** Drawing order: smallest overall first, so the leaders pass over at a crossing. */
  ribbons: RankedRibbon<D>[];
  /** Series keys in series order. */
  series: string[];
  /** Whether each column is stacked by value. */
  ranked: boolean;
  /** The fixed stack, top to bottom, used when not ranked: `stackOrder` first, then series order. */
  stackOrder: string[];
  /** Columns sit on its ticks; segments and breaks follow `breaksAfter`. Use it for gridlines and the axis. */
  xAxis: SegmentedAxis;
  /** Value → band thickness. */
  yScale: ScaleLinear<number, number>;
  /** Air around a value inside its band, for `placeValue`. */
  valueLabelPadding: number;
};
