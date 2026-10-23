import type {
  PartitionBarsLayout,
  PartitionBlock,
  PartitionRow,
} from "$lib/core/layouts/partitionBars";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";

export type PartitionBarsProps<D> = LayoutComponentProps<PartitionBarsLayout<D>> &
  LabelStyleProps & {
    /** The track behind each bar. Defaults to the theme's `partition.trackFill`. */
    trackFill?: string;
    /** A bar's fill; undefined → the theme's `capsule` gradient. */
    barFill?: (row: PartitionRow) => string | readonly [string, string] | undefined;

    /** Opacity of a whole row — track, bar, value and name — e.g. to dim all but a highlight. */
    rowOpacity?: (row: PartitionRow) => number;
    /** Opacity of every piece row at once, for a staged reveal. */
    piecesOpacity?: number;
    /** Opacity of every value at once, for a staged reveal. */
    valuesOpacity?: number;

    // Labels (theme roles: `valueLabel`, `categoryLabel`)
    formatValue?: (row: PartitionRow) => string;
    formatCategory?: (row: PartitionRow) => string;
    /** Wrapping width of the names, in the left gutter. */
    categoryWidth?: number;
    /** Weight of the values; the names take `fontWeight`. */
    valueWeight?: number;
    /** Size of the pieces' names and values, a step below the parts'. */
    pieceFontSize?: number;
    formatHeader?: (block: PartitionBlock) => string;
    /** Added to the block names' x — negative reaches into the left gutter. */
    headerLeft?: number;
    /** The shared zero (theme role: `baseline`). */
    baselineStroke?: string;
    baselineWidth?: number;
  };
