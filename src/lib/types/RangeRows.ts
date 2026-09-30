import type {
  RangeMarker,
  RangeRow,
  RangeRowsLayout,
} from "$lib/core/layouts/rangeRows";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type RangeRowStyle<D, T> = ValueOrAccessor<[row: RangeRow<D>], T>;
export type RangeMarkerStyle<D, T> = ValueOrAccessor<
  [marker: RangeMarker<D>, row: RangeRow<D>],
  T
>;

export type RangeRowsProps<D> = LayoutComponentProps<RangeRowsLayout<D>> &
  LabelStyleProps & {
    // Gridlines, one per row (theme role: `baseline`)
    showGridlines?: boolean;
    gridlineStroke?: string;
    gridlineStrokeWidth?: number;

    // Straps from min to max. A colour or a paint server, e.g. by `row.leader`.
    showStraps?: boolean;
    strapFill?: RangeRowStyle<D, string | undefined>;
    strapOpacity?: RangeRowStyle<D, number | undefined>;

    // Markers (undefined → theme)
    showMarkers?: boolean;
    markerFill?: RangeMarkerStyle<D, string | undefined>;

    // Labels (theme roles: `valueLabel`, `categoryLabel`)
    showValues?: RangeMarkerStyle<D, boolean>;
    showCategories?: boolean;
    formatValue?: (marker: RangeMarker<D>, row: RangeRow<D>) => string;
    formatCategory?: (category: string) => string;
  };
