import type { ScaleLinear } from "d3";
import type { BreakGlyph } from "../breakGlyph";
import type {
  CategoryAccessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  Point,
  SortOrder,
  ValueAccessor,
} from "../types";
import type { Accessor } from "../types";

export type CoverageDotsSpacing = {
  /** Height of each row's band. */
  rowThickness: number;
  /** Gap between rows of a block, as a share of `rowThickness`. */
  rowGapRatio: number;
  markerRadius: number;
  /** Room above a block's rows for its name; 0 when there are no blocks. */
  headerHeight: number;
  /** Extra space between one block and the next. */
  blockGap: number;
  /** Room above the rows for the reference's name, when there is one. */
  referenceLabelHeight: number;
  /** Room under the axis for the tick labels. */
  axisHeight: number;
  /** Room kept right of the value range, for the largest values' labels. */
  insetEnd: number;
  /** Padding added to both ends of the derived domain, as a share of its range. */
  domainPaddingRatio: number;
  /** Ticks asked of the scale; the domain is rounded to them. */
  tickCount: number;
  /** Scales the torn-axis mark drawn when the axis doesn't start at zero. */
  breakSize: number;
  /** Gap between a marker's edge and its value label. */
  valueLabelGap: number;
  /** Gap between the category label and the plotting area. */
  categoryLabelGap: number;
};

export type CoverageDotsLayoutConfig<D> = Partial<CoverageDotsSpacing> &
  CategoryAccessor<D> &
  ValueAccessor<D> & {
    /** The block a row belongs to (rede, etapa…). Omit for a single block without a header. */
    getGroup?: Accessor<D, string>;
    width: number;
    /** Row order within each block, by value. Default "descending". */
    sort?: SortOrder;
    /** Categories listed here come first in their block, in this order. */
    categoryOrder?: readonly string[];
    /** Blocks listed here come first, in this order; the rest keep the data's order. */
    groupOrder?: readonly string[];
    /**
     * Pin the value domain instead of deriving it. Either end may be left
     * `undefined` to keep the derived one — pin the top at 100 for shares.
     */
    valueDomain?: readonly [number | undefined, number | undefined];
    /** A dashed line across every row — a national mean, a target. */
    reference?: number;
  };

export type CoverageDotsEntry<D> = {
  data: D;
  category: string;
  group: string;
  value: number;
};

/** `index` counts rows across blocks, top to bottom. */
export type CoverageDot<D> = CoverageDotsEntry<D> &
  LayoutItem<D> & {
    /** Position within its block. */
    indexInBlock: number;
    /** Top of the row's band. */
    y: number;
    /** Centre line of the row. */
    cy: number;
    marker: Point & { radius: number };
    /** The row's track, from the start of the axis to its end. */
    track: LineSegment;
    valueLabel: LabelPlacement;
    categoryLabel: LabelPlacement;
    /** `value − reference`; undefined without a reference. */
    delta: number | undefined;
  };

export type CoverageBlock<D> = {
  key: string;
  label: string;
  index: number;
  /** Top of the block, header included. */
  y: number;
  /** Null when the rows come in a single, unnamed block. */
  header: LabelPlacement | null;
  rows: CoverageDot<D>[];
};

export type CoverageTick = {
  value: number;
  x: number;
  label: LabelPlacement;
};

export type CoverageReference = {
  value: number;
  x: number;
  line: LineSegment;
  label: LabelPlacement;
};

export type CoverageAxis = {
  y: number;
  line: LineSegment;
  ticks: CoverageTick[];
  /** The torn-axis mark at the start, when the domain doesn't reach zero. */
  break: BreakGlyph | null;
};

export type CoverageDotsLayout<D> = LayoutBox & {
  blocks: CoverageBlock<D>[];
  /** Every row, top to bottom — `rows[i].index === i`. */
  rows: CoverageDot<D>[];
  reference: CoverageReference | null;
  axis: CoverageAxis;
  valueScale: ScaleLinear<number, number>;
  /** Whether the axis starts above zero (and so the dots can't be read as lengths). */
  truncated: boolean;
};
