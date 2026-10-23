import type {
  CoverageBlock,
  CoverageDot,
  CoverageDotsLayout,
} from "$lib/core/layouts/coverageDots";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type CoverageRowStyle<D, T> = ValueOrAccessor<[row: CoverageDot<D>], T>;

export type CoverageDotsProps<D> = LayoutComponentProps<CoverageDotsLayout<D>> &
  LabelStyleProps & {
    // Tracks, one per row (theme role: `coverageDots`)
    showTracks?: boolean;
    trackStroke?: string;
    trackWidth?: number;

    // Dots (undefined → theme)
    markerFill?: CoverageRowStyle<D, string | undefined>;
    markerStroke?: string;
    markerStrokeWidth?: number;

    /** Opacity of a whole row — dot, value and name — e.g. to dim all but a highlight. */
    rowOpacity?: CoverageRowStyle<D, number>;

    // Labels (theme roles: `valueLabel`, `categoryLabel`, `tickLabel`)
    showValues?: CoverageRowStyle<D, boolean>;
    /** Opacity of every value label at once, for a staged reveal. */
    valuesOpacity?: number;
    /** A `LabelMask` patch behind each value, so one sitting on the reference line stays legible. Default true. */
    maskValues?: boolean;
    showCategories?: boolean;
    /** Wrapping width of the category names, in the left gutter. */
    categoryWidth?: number;
    formatValue?: (row: CoverageDot<D>) => string;
    formatCategory?: (category: string) => string;
    formatHeader?: (block: CoverageBlock<D>) => string;
    /** Added to the block names' x — negative reaches into the left gutter, over the category names. */
    headerLeft?: number;
    /** Opacity of a block's name. */
    headerOpacity?: ValueOrAccessor<[block: CoverageBlock<D>], number>;

    // Reference line (theme role: `coverageDots`)
    showReference?: boolean;
    /** Written above the rows, at the line. */
    referenceLabel?: string;
    referenceOpacity?: number;
    referenceStroke?: string;

    // Axis (theme roles: `baseline`, `tickLabel`, `timelineBreak` for the mark)
    showAxis?: boolean;
    formatTick?: (value: number) => string;
  };
