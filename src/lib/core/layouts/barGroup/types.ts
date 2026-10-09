import type { ScaleBand } from "d3";
import type { BarGroupStyle, ChartTheme } from "$lib/core/theme/types";
import type {
  CategoryAccessor,
  LayoutBox,
  LayoutItem,
  PositionScale,
  Rect,
  SeriesAccessors,
} from "../types";

export type BarGroupLayoutConfig<D, K extends string = string> = BarGroupStyle &
  CategoryAccessor<D> &
  SeriesAccessors<D, K> & {
    xScale: PositionScale;
    yScale: PositionScale;
    /**
     * When true, categories run down `yScale` (band) and values along `xScale`
     * (linear). When false, the reverse.
     */
    horizontal?: boolean;
    /** Inner band scale over `keys`; built from the outer bandwidth when omitted. */
    groupScale?: ScaleBand<string>;
    /** Where unset styles (`groupPadding`) come from; `DefaultTheme` when omitted. */
    theme?: ChartTheme;
  };

/** One series' bar within a category's group. */
export type BarGroupBar<D, K extends string = string> = LayoutItem<D> &
  Rect & {
    series: K;
    category: string;
    value: number;
  };

/** One category: its bars side by side within its band. */
export type BarGroupItem<D, K extends string = string> = LayoutItem<D> & {
  category: string;
  /** Where the category's band starts. */
  x0: number;
  y0: number;
  bars: BarGroupBar<D, K>[];
};

export type BarGroupLayout<D, K extends string = string> = LayoutBox & {
  groups: BarGroupItem<D, K>[];
};
