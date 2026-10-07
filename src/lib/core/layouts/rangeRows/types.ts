import type { ScaleLinear } from "d3";
import type {
  CategoryAccessor,
  GroupAccessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  SortOrder,
  ValueAccessor,
} from "../types";

export type RangeRowsSpacing = {
  /** Height of each row's band. */
  rowThickness: number;
  /** Gap between rows (and before/after them), as a share of `rowThickness`. */
  rowGapRatio: number;
  markerRadius: number;
  /** How much thinner than the markers the strap is, on each side. */
  strapInset: number;
  /** Padding added to both ends of the value domain, as a share of its range. */
  domainPaddingRatio: number;
  /** Room kept left of the value range (for the min labels). */
  insetStart: number;
  /** Room kept right of the value range (for the max labels). */
  insetEnd: number;
  /** Gap between a marker's edge and its value label. */
  valueLabelGap: number;
  /** Gap between the category label and the plotting area. */
  categoryLabelGap: number;
};

export type RangeRowsLayoutConfig<D> = Partial<RangeRowsSpacing> &
  CategoryAccessor<D> &
  GroupAccessor<D> &
  ValueAccessor<D> & {
  width: number;
  /** Row order by the row's largest value. Default "descending". */
  sort?: SortOrder;
  /** Categories listed here come first, in this order. */
  categoryOrder?: readonly string[];
  /** Pin the value domain instead of deriving it from the data. */
  valueDomain?: readonly [number, number];
};

export type RangeRowsEntry<D> = {
  data: D;
  category: string;
  group: string;
  value: number;
};

/** `index`: position in its row, by value (ascending). */
export type RangeMarker<D> = RangeRowsEntry<D> & LayoutItem<D> & {
  x: number;
  y: number;
  radius: number;
  isMin: boolean;
  isMax: boolean;
  /** Max: right of the marker. Min: left of it. Others: above. */
  label: LabelPlacement;
};

export type RangeStrap = { x: number; y: number; width: number; height: number };

export type RangeRow<D> = {
  key: string;
  category: string;
  index: number;
  /** Top of the row's band. */
  y: number;
  /** Centre line of the row. */
  cy: number;
  /** Sorted by value, ascending. */
  markers: RangeMarker<D>[];
  min: RangeMarker<D>;
  max: RangeMarker<D>;
  /** Group holding the row's largest value. */
  leader: string;
  /** max − min. */
  spread: number;
  strap: RangeStrap;
  gridline: LineSegment;
  label: LabelPlacement;
};

export type RangeRowsLayout<D> = LayoutBox & {
  rows: RangeRow<D>[];
  /** Every group, in data order. */
  groups: string[];
  valueScale: ScaleLinear<number, number>;
};
