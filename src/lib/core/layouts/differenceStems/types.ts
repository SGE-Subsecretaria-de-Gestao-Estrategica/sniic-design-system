import type { ScaleLinear } from "d3";
import type {
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  Point,
  SeriesAccessor,
  SharedXAxis,
  ValueAccessor,
  XAccessor,
  XValue,
} from "../types";

export type DifferenceStemsSpacing = {
  /** Stem thickness. */
  stemWidth: number;
  /** Multiplier on the largest |difference| (room for the labels). */
  valueHeadroom: number;
  /** Gap between a stem's tip and its value label. */
  labelGap: number;
  /** Horizontal gap between the last stem and its end label. */
  endLabelGap: number;
};

/** `xScale` / `width` come from a shared axis (spread `lineSeriesLayout(...).xAxis`). */
export type DifferenceStemsLayoutConfig<D> = Partial<DifferenceStemsSpacing> &
  SharedXAxis &
  XAccessor<D> &
  SeriesAccessor<D> &
  ValueAccessor<D> & {
  /** Difference = minuend − subtrahend, per x. */
  minuend: string;
  subtrahend: string;
  height: number;
  /** Pin the largest |difference| the height represents. */
  maxValue?: number;
  cornerRadius?: number;
  /** Place the last value label to the right of the last stem. Default true. */
  endLabel?: boolean;
};

/** The two data points a difference is computed from. */
export type DifferencePair<D> = {
  /** Datum of the minuend series at this x. */
  minuend: D;
  /** Datum of the subtrahend series at this x. */
  subtrahend: D;
};

export type DifferenceStemsEntry<D> = {
  xValue: XValue;
  data: DifferencePair<D>;
  value: number;
};

export type StemRect = { x: number; y: number; width: number; height: number };

export type DifferenceStem<D> = DifferenceStemsEntry<D> & LayoutItem<DifferencePair<D>> & {
  x: number;
  sign: -1 | 0 | 1;
  isLast: boolean;
  rect: StemRect;
  cornerRadius: number;
  tip: Point;
  label: LabelPlacement;
};

export type DifferenceStemsLayout<D> = LayoutBox & {
  stems: DifferenceStem<D>[];
  valueScale: ScaleLinear<number, number>;
  /** y of the zero line. */
  baselineY: number;
};
