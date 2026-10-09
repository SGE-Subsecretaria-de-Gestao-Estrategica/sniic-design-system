import type {
  CategoryAccessor,
  LayoutBox,
  LayoutItem,
  PositionScale,
  Rect,
  SeriesAccessors,
} from "../types";

export type BarStackLayoutConfig<D, K extends string = string> = CategoryAccessor<D> &
  SeriesAccessors<D, K> & {
    xScale: PositionScale;
    yScale: PositionScale;
    /**
     * When true, categories run down `yScale` (band) and values along `xScale`
     * (linear). When false, the reverse.
     */
    horizontal?: boolean;
    /** Passed to `d3.stack().order()`. */
    order?: (series: any) => number[];
    /** Passed to `d3.stack().offset()`. */
    offset?: (series: any, order: number[]) => void;
  };

/** One category's share of one series. */
export type BarStackBar<D, K extends string = string> = LayoutItem<D> &
  Rect & {
    series: K;
    category: string;
    value: number;
  };

export type BarStackSeries<D, K extends string = string> = {
  key: K;
  index: number;
  bars: BarStackBar<D, K>[];
};

export type BarStackLayout<D, K extends string = string> = LayoutBox & {
  series: BarStackSeries<D, K>[];
};
