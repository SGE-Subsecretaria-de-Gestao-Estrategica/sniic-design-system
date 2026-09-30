import type {
  HorizontalBar,
  HorizontalBarsLayout,
} from "$lib/core/layouts/horizontalBars";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type HorizontalBarAccessor<D, Output> = (bar: HorizontalBar<D>) => Output;
export type HorizontalBarStyle<D, T> = ValueOrAccessor<[bar: HorizontalBar<D>], T>;

export type HorizontalBarsProps<D> = LayoutComponentProps<HorizontalBarsLayout<D>> &
  LabelStyleProps & {
    /** Unique prefix for the clip-path ids this component defines. */
    id: string;

    // Bars
    /** A color or a paint server reference, e.g. `url(#my-gradient)`. */
    barFill?: HorizontalBarStyle<D, string | undefined>;
    barOpacity?: number;
    /** Clip bars to the plotting area (needed for the rounded-end overhang). */
    clipToPlotArea?: boolean;

    // End markers
    showMarkers?: boolean;
    markerFill?: HorizontalBarStyle<D, string | undefined>;

    // Baseline (theme role: `baseline`)
    showBaseline?: boolean;
    baselineStroke?: string;
    baselineStrokeWidth?: number;

    // Labels (theme roles: `valueLabel`, `categoryLabel`)
    showValues?: boolean;
    showCategories?: boolean;
    formatValue?: HorizontalBarAccessor<D, string>;
    formatCategory?: (category: string) => string;
  };
