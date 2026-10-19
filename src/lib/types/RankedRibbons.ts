import type {
  RankedRibbon,
  RankedRibbonsColumn,
  RankedRibbonsLayout,
  RankedRibbonsSlot,
} from "$lib/core/layouts/rankedRibbons";
import type { LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type RankedRibbonsProps<D> = LayoutComponentProps<RankedRibbonsLayout<D>> & {
  // Ribbons (theme role: `ribbon`)
  fill?: ValueOrAccessor<[ribbon: RankedRibbon<D>], string | undefined>;
  /** Dims a whole series: its ribbon and its labels. */
  seriesOpacity?: ValueOrAccessor<[series: string], number>;
  outlineStroke?: string;
  outlineWidth?: number;
  /** Opacity of the bends across the axis breaks. Default: the `connector` role's, as a line's bridges. */
  bridgeOpacity?: number;

  // Values inside the bands (theme role: `valueLabel`). A value is drawn only where it fits.
  /** Default: every band except the last column's, whose values close the ribbons on the right. */
  showValues?: ValueOrAccessor<
    [slot: RankedRibbonsSlot<D>, column: RankedRibbonsColumn<D>],
    boolean
  >;
  formatValue?: (slot: RankedRibbonsSlot<D>) => string;
  /** Pick it against the ribbon's colour (e.g. `labelColorOn`). */
  valueFill?: ValueOrAccessor<[slot: RankedRibbonsSlot<D>], string | undefined>;

  // Totals above the stacks (theme role: `totalLabel`)
  showTotals?: boolean;
  formatTotal?: (column: RankedRibbonsColumn<D>) => string;
  totalFill?: ValueOrAccessor<[column: RankedRibbonsColumn<D>], string | undefined>;

  // End labels right of the plot (theme roles: `dataLabel`, `seriesLabel`)
  showEnds?: boolean;
  formatName?: (ribbon: RankedRibbon<D>) => string;
  nameWidth?: number;

  /** Opacity of every label but the totals, e.g. to bring them in at a scrollytelling step. */
  labelsOpacity?: number;
};
