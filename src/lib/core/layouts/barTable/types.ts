import type { ScaleLinear } from "d3";
import type {
  Accessor,
  CategoryAccessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  Rect,
  SortOrder,
  ValueAccessor,
} from "../types";

export type BarTableSpacing = {
  /** Bar thickness; the capsule's cap is half of it. */
  barThickness: number;
  /** Gap between rows, as a share of `barThickness`. */
  barGapRatio: number;
  /** Room past the longest bar of a column for its value, as a multiple of it. */
  valueHeadroom: number;
  /** Horizontal gap between columns. */
  columnGap: number;
  /** Room above the rows for the column headers. */
  headerHeight: number;
  valueLabelGap: number;
  categoryLabelGap: number;
  /** Inset of the "not reported" text from the column's baseline. */
  missingLabelGap: number;
};

export type BarTableScale = "shared" | "independent";

export type BarTableLayoutConfig<D> = Partial<BarTableSpacing> &
  CategoryAccessor<D> &
  ValueAccessor<D> & {
    /** The column a datum belongs to: a measure, or a source of the same measure. */
    getColumn: Accessor<D, string>;
    width: number;
    /** Row order, by the category's total over every column. */
    sort?: SortOrder;
    categoryOrder?: readonly string[];
    /** Column order; the order of the data otherwise. */
    columnOrder?: readonly string[];
    /**
     * One value scale for every column (default: equal values, equal
     * lengths), or one per column, for measures in units that don't mix.
     */
    scale?: BarTableScale;
  };

export type BarTableBar<D> = LayoutItem<D> & {
  category: string;
  value: number;
  /** The capsule's box, from its flat base at `x`. */
  rect: Rect;
  valueLabel: LabelPlacement;
};

/** A category with no value in a column: written, never drawn as zero. */
export type BarTableMissing = {
  key: string;
  category: string;
  label: LabelPlacement;
};

/** One column; its bars, labels and baseline are relative to (`x`, 0). */
export type BarTableColumn<D> = {
  key: string;
  index: number;
  x: number;
  width: number;
  valueScale: ScaleLinear<number, number>;
  header: LabelPlacement;
  baseline: LineSegment;
  bars: BarTableBar<D>[];
  missing: BarTableMissing[];
};

/** One row across the table. */
export type BarTableRow = {
  key: string;
  index: number;
  category: string;
  /** Top of the row's band (gap included) and its height, for hit targets. */
  top: number;
  height: number;
  cy: number;
  label: LabelPlacement;
};

export type BarTableLayout<D> = LayoutBox & {
  columns: BarTableColumn<D>[];
  rows: BarTableRow[];
  /** Cells with no value. */
  missing: number;
};
