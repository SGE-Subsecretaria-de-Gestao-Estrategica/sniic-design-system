import type {
  DifferenceStem,
  DifferenceStemsLayout,
} from "$lib/core/layouts/differenceStems";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type DifferenceStemStyle<D, T> = ValueOrAccessor<[stem: DifferenceStem<D>], T>;

export type DifferenceStemsProps<D> = LayoutComponentProps<DifferenceStemsLayout<D>> &
  LabelStyleProps & {
    // Stems (undefined → theme role `auxiliaryMark`)
    fill?: DifferenceStemStyle<D, string | undefined>;
    fillOpacity?: DifferenceStemStyle<D, number | undefined>;

    // Zero line (theme role: `baseline`)
    showBaseline?: boolean;
    baselineStroke?: string;
    baselineStrokeWidth?: number;

    // Labels (theme role: `valueLabel`)
    showValues?: DifferenceStemStyle<D, boolean>;
    formatValue?: (stem: DifferenceStem<D>) => string;
    /** Wrapping width of the end label. */
    endLabelWidth?: number;
  };
