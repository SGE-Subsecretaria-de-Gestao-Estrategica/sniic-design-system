import type {
  Accessor,
  CategoryAccessor,
  LabelPlacement,
  LayoutBox,
  LineSegment,
  ValueAccessor,
} from "../types";

export type PartitionBarsSpacing = {
  /** Thickness of a part's bar. */
  barThickness: number;
  /** Thickness of a piece's bar — thinner, so pieces read as belonging to the part above. */
  pieceThickness: number;
  /** Space between two parts. */
  rowGap: number;
  /** Space between a part and its pieces, and between pieces. */
  pieceGap: number;
  /** Room above a block's rows for its name; only when there are several wholes. */
  headerHeight: number;
  /** Extra space between one block and the next. */
  blockGap: number;
  /** Room kept right of the 100% end for the values. */
  valueSpace: number;
  /** Gap between the 100% end and the values. */
  valueGap: number;
  /** Gap between the names and the bars. */
  categoryLabelGap: number;
};

export type PartitionBarsLayoutConfig<D> = Partial<PartitionBarsSpacing> &
  ValueAccessor<D> &
  Partial<CategoryAccessor<D>> & {
    /** The part a row belongs to. */
    getPart: Accessor<D, string>;
    /**
     * The piece of its part a row is. A row whose piece is empty or equal to
     * its part is the part itself.
     */
    getSubpart?: Accessor<D, string>;
    width: number;
  };

export type PartitionEntry<D> = {
  data: D;
  category: string;
  part: string;
  subpart: string | null;
  value: number;
};

/**
 * A row: a part of the whole, or a piece of a part. Both are a bar on a
 * track; a part's track is the whole (100%), a piece's is its part.
 */
export type PartitionRow = {
  key: string;
  kind: "part" | "piece";
  label: string;
  /** The part — the row's own label for a part, the parent's for a piece. */
  part: string;
  /** The whole it belongs to (the category); "" for a single unnamed whole. */
  whole: string;
  /** Counts rows across blocks, top to bottom. */
  index: number;
  /** Top of the row's band, its height, and its centre line. */
  y: number;
  thickness: number;
  cy: number;
  value: number;
  /** Of the row's track: the whole for a part, the part for a piece. */
  share: number;
  /** Of the whole — equal to `share` for a part. */
  shareOfTotal: number;
  /** Length of the track and of the bar, from x = 0. */
  trackLength: number;
  barLength: number;
  valueLabel: LabelPlacement;
  categoryLabel: LabelPlacement;
};

export type PartitionBlock = {
  key: string;
  label: string;
  index: number;
  /** Top of the block, header included. */
  y: number;
  /** Null for a single, unnamed whole. */
  header: LabelPlacement | null;
  total: number;
  rows: PartitionRow[];
  /** The shared zero the block's bars start from. */
  baseline: LineSegment;
};

export type PartitionBarsLayout<D> = LayoutBox & {
  blocks: PartitionBlock[];
  /** Every row, top to bottom — `rows[i].index === i`. */
  rows: PartitionRow[];
  /** Every part, in first-seen order. */
  parts: string[];
  /** Where the whole ends (100%), along x. */
  fullLength: number;
  entries: PartitionEntry<D>[];
};
