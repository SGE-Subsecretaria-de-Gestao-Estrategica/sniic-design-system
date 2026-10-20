import type {
  BarTableBar,
  BarTableColumn,
  BarTableLayout,
  BarTableRow,
} from "$lib/core/layouts/barTable";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type BarTableBarStyle<D, T> = ValueOrAccessor<[bar: BarTableBar<D>, column: BarTableColumn<D>], T>;

export type BarTableProps<D> = LayoutComponentProps<BarTableLayout<D>> &
  LabelStyleProps & {
    // Bars (theme role: `capsule`)
    /** One colour, or `[base, tip]` for the capsule's gradient. */
    barFill?: BarTableBarStyle<D, string | readonly [string, string] | undefined>;
    dotFill?: BarTableBarStyle<D, string | undefined>;
    /** Opacity of a whole row (bars, values, name), e.g. to dim all but one. */
    rowOpacity?: (row: BarTableRow) => number;

    // Baselines (theme role: `baseline`)
    showBaselines?: boolean;
    baselineStroke?: string;
    baselineStrokeWidth?: number;

    // Labels (theme roles: `columnHeader`, `valueLabel`, `categoryLabel`, `caption`)
    showHeaders?: boolean;
    showValues?: boolean;
    showCategories?: boolean;
    formatHeader?: (column: BarTableColumn<D>) => string;
    formatValue?: (bar: BarTableBar<D>, column: BarTableColumn<D>) => string;
    formatCategory?: (category: string) => string;
    /** Written in a cell with no value; `false` leaves it blank. */
    missingLabel?: string | false;
  };
