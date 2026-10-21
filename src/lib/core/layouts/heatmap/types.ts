import type { ScaleQuantize } from "d3";
import type {
  Accessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  ValueAccessor,
} from "../types";

export type HeatmapSpacing = {
  /** Gap between neighbouring cells, across and down. */
  cellGap: number;
  /** Gap between the grid's left edge and the row labels. */
  rowLabelGap: number;
  /** Gap between the grid's top edge and the column labels. */
  columnLabelGap: number;
  /** Number of colour steps the domain is cut into. */
  steps: number;
};

export type HeatmapLayoutConfig<D> = Partial<HeatmapSpacing> &
  ValueAccessor<D> & {
    /** Row key of a datum (one grid row per key). */
    getRow: Accessor<D, string>;
    /** Column key of a datum (one grid column per key). */
    getColumn: Accessor<D, string>;
    width: number;
    height: number;
    /** Rows listed here come first (top to bottom); the rest keep data order. */
    rowOrder?: readonly string[];
    /** Columns listed here come first (left to right); the rest keep data order. */
    columnOrder?: readonly string[];
    /** Pin the value domain the steps cut; default the data's extent. */
    domain?: readonly [number, number];
  };

/** A datum read through the accessors. */
export type HeatmapEntry<D> = {
  data: D;
  row: string;
  column: string;
  value: number;
};

/** A grid row or column: its band and its label. */
export type HeatmapBand = {
  key: string;
  index: number;
  /** Start (x for a column, y for a row) and size of the band. */
  start: number;
  size: number;
  label: LabelPlacement;
};

/**
 * One cell of the grid, with or without a datum. `data`, `value` and `step`
 * are `null` for a row × column pair the data doesn't have.
 */
export type HeatmapCell<D> = LayoutItem<D | null> & {
  row: string;
  column: string;
  rowIndex: number;
  columnIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number | null;
  /** 0 = the lowest step. */
  step: number | null;
  /** Value normalised to [0, 1] over the domain (for continuous ramps). */
  t: number | null;
  /** Centre of the cell, for its value. */
  label: LabelPlacement;
};

export type HeatmapLayout<D> = LayoutBox & {
  rows: HeatmapBand[];
  columns: HeatmapBand[];
  /** Every row × column pair, row by row. */
  cells: HeatmapCell<D>[];
  steps: number;
  domain: [number, number];
  stepScale: ScaleQuantize<number>;
};
