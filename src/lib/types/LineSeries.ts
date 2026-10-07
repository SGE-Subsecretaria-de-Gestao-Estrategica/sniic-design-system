import type {
  LineSeriesItem,
  LineSeriesLayout,
  LineSeriesPoint,
} from "$lib/core/layouts/lineSeries";
import type { ValueOrAccessor } from "./ValueOrAccessor";
import type { LayoutComponentProps } from "./LayoutComponent";

export type SeriesStyle<D, T> = ValueOrAccessor<[series: LineSeriesItem<D>], T>;
export type PointStyle<D, T> = ValueOrAccessor<
  [point: LineSeriesPoint<D>, series: LineSeriesItem<D>],
  T
>;

export type LineSeriesProps<D> = LayoutComponentProps<LineSeriesLayout<D>> & {
  // Lines (undefined → theme)
  stroke?: SeriesStyle<D, string | undefined>;
  strokeWidth?: number;
  strokeOpacity?: number;

  // Bridges across the axis breaks. Undefined → the line's stroke, and the
  // theme `connector` role (width = line width × widthRatio).
  showBridges?: boolean;
  bridgeStroke?: SeriesStyle<D, string | undefined>;
  bridgeStrokeWidth?: number;
  bridgeStrokeOpacity?: number;
  bridgeDasharray?: string;

  // Markers (undefined → theme)
  showMarkers?: boolean;
  markerFill?: PointStyle<D, string | undefined>;
  markerSize?: PointStyle<D, number | undefined>;

  // Value labels (theme roles: `valueLabel`, and `dataLabel` for the end value,
  // whose fill defaults to its marker's colour)
  /** All, none, or a per-point filter (e.g. `(p) => p.isSegmentStart || p.isSegmentEnd`). */
  showValues?: PointStyle<D, boolean>;
  formatValue?: (point: LineSeriesPoint<D>, series: LineSeriesItem<D>) => string;
  valueFill?: PointStyle<D, string | undefined>;
  valueFontSize?: PointStyle<D, number | undefined>;
  valueFontWeight?: PointStyle<D, number | undefined>;
  /** Wrapping width of the end value label. */
  endValueWidth?: number;

  // Series name next to the last point (theme role: `seriesLabel`)
  showNames?: boolean;
  formatName?: (series: LineSeriesItem<D>) => string;
  /** Wrapping width of the name (usually the right margin). */
  nameWidth?: number;
  nameFill?: SeriesStyle<D, string | undefined>;
  nameFontSize?: number;
  nameFontWeight?: number;
};
