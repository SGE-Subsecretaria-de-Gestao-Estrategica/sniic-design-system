import type {
  HeatmapBand,
  HeatmapCell,
  HeatmapLayout,
} from "$lib/core/layouts/heatmap";
import type { LabelStyleProps, LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type HeatmapCellStyle<D, T> = ValueOrAccessor<[cell: HeatmapCell<D>], T>;

export type HeatmapProps<D> = LayoutComponentProps<HeatmapLayout<D>> &
  LabelStyleProps & {
    // Cells
    /** One colour per step, lowest first (e.g. `getGradientStops(layout.steps, …)`). */
    stepColors: readonly string[];
    /** Overrides the step colour, per cell. */
    cellFill?: HeatmapCellStyle<D, string | undefined>;
    /** Fill of a cell without data. */
    emptyFill?: string;
    cellRadius?: number;
    cellStroke?: string;
    cellStrokeWidth?: number;

    // Value labels (theme role: `valueLabel`), only on cells with data
    showValues?: HeatmapCellStyle<D, boolean>;
    formatValue?: (cell: HeatmapCell<D>) => string;
    /** E.g. a light label on the dark steps. */
    valueFill?: HeatmapCellStyle<D, string | undefined>;

    // Row and column labels (theme roles: `categoryLabel`, `tickLabel`)
    showRows?: boolean;
    showColumns?: boolean;
    formatRow?: (row: HeatmapBand) => string;
    formatColumn?: (column: HeatmapBand) => string;
    /** Wrapping width of the row labels (usually the left margin). */
    rowLabelWidth?: number;
  };
