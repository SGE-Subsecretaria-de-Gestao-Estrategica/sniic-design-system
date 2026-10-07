import type {
  BubbleColumn,
  BubbleColumnsItem,
  BubbleColumnsLayout,
} from "$lib/core/layouts/bubbleColumns";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type BubbleItemStyle<D, T> = ValueOrAccessor<
  [item: BubbleColumnsItem<D>, column: BubbleColumn<D>],
  T
>;

/** @deprecated accessor-only form; use `BubbleItemStyle`. */
export type BubbleItemAccessor<D, Output> = (
  item: BubbleColumnsItem<D>,
  column: BubbleColumn<D>,
) => Output;

export type BubbleColumnsProps<D> = LayoutComponentProps<BubbleColumnsLayout<D>> &
  LabelStyleProps & {
    // Circles
    fill?: BubbleItemStyle<D, string | undefined>;
    fillOpacity?: BubbleItemStyle<D, number | undefined>;

    // Axes (theme role: `baseline`)
    showAxes?: boolean;
    axisStroke?: string;
    axisStrokeWidth?: number;

    // Labels (theme roles: `valueLabel`, `seriesLabel` for groups, `categoryLabel`).
    // Positions and gaps come from the layout (`groupLabelGap`, `categoryLabelGap`).
    showValues?: boolean;
    /** Default: only when the layout has groups (`layout.isGrouped`). */
    showGroupLabels?: boolean;
    showCategoryLabels?: boolean;
    formatValue?: BubbleItemAccessor<D, string>;
    formatGroup?: (group: string) => string;
    formatCategory?: (category: string) => string;
  };
