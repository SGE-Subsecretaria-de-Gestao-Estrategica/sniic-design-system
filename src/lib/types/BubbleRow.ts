import type { BubbleRowItem, BubbleRowLayout } from "$lib/core/layouts/bubbleRow";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type BubbleRowItemStyle<D, T> = ValueOrAccessor<[item: BubbleRowItem<D>], T>;

/** `top`: top of the row area (the bubble centres sit at `layout.centerY`). */
export type BubbleRowProps<D> = LayoutComponentProps<BubbleRowLayout<D>> &
  LabelStyleProps & {
    // Bubbles (undefined → theme). Use `item.t` for colour ramps.
    fill?: BubbleRowItemStyle<D, string | undefined>;
    fillOpacity?: BubbleRowItemStyle<D, number | undefined>;

    // Baseline through the centres (theme role: `baseline`), and bridges across
    // the breaks (theme role: `connector`)
    showBaseline?: boolean;
    baselineStroke?: string;
    baselineStrokeWidth?: number;
    showBridges?: boolean;
    bridgeStrokeOpacity?: number;
    bridgeDasharray?: string;

    // Labels (theme role: `valueLabel`)
    showValues?: BubbleRowItemStyle<D, boolean>;
    formatValue?: (item: BubbleRowItem<D>) => string;
    /** Wrapping width of the end label. */
    endLabelWidth?: number;
  };
