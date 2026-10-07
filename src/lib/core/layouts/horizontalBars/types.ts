import type { ScaleLinear } from "d3";
import type {
  CategoryAccessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  Point,
  SortOrder,
  ValueAccessor,
} from "../types";

export type { SortOrder, Point };

export type HorizontalBarsSpacing = {
  barThickness: number;
  barGapRatio: number;
  valueHeadroom: number;
  markerInset: number;
  valueLabelGap: number;
  categoryLabelGap: number;
  clipOverhangRatio: number;
};

export type HorizontalBarsLayoutConfig<D> = Partial<HorizontalBarsSpacing> &
  CategoryAccessor<D> &
  ValueAccessor<D> & {
  width: number;
  sort?: SortOrder;
  categoryOrder?: readonly string[];
  cornerRadius?: number;
  maxValue?: number;
};

export type HorizontalBarsEntry<D> = {
  data: D;
  category: string;
  value: number;
};

export type HorizontalBarMarker = Point & { radius: number };

export type HorizontalBar<D> = HorizontalBarsEntry<D> & LayoutItem<D> & {
  y: number;
  cy: number;
  length: number;
  thickness: number;
  clipPath: string;
  marker: HorizontalBarMarker;
  valueLabel: LabelPlacement;
  categoryLabel: LabelPlacement;
};

export type HorizontalBarsLayout<D> = LayoutBox & {
  bars: HorizontalBar<D>[];
  valueScale: ScaleLinear<number, number>;
  baseline: LineSegment;
};
