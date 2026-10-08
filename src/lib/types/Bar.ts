import type { Snippet } from 'svelte';
import type { ClassValue, SVGAttributes } from 'svelte/elements';
import type { BarGroupBar, BarGroupItem, BarGroupLayout } from '$lib/core/layouts/barGroup';
import type { BarStackBar, BarStackLayout, BarStackSeries } from '$lib/core/layouts/barStack';

export type BarOwnProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Corner radius, applied to both axes unless `ry` is given. */
  rx?: number | string;
  ry?: number | string;
  class?: ClassValue;
  innerRef?: SVGRectElement | null;
  fill?: string;
  fillOpacity?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeOpacity?: number | string;
};

export type BarProps = BarOwnProps &
  Omit<SVGAttributes<SVGRectElement>, keyof BarOwnProps>;

/** A bar as `BarStack`/`BarGroup` paint it: the layout's rect plus its colour. */
export type ComputedBar<B> = B & { color: string };

export type ComputedBarStack<D, K extends string = string> = Omit<BarStackSeries<D, K>, "bars"> & {
  color: string;
  bars: ComputedBar<BarStackBar<D, K>>[];
};

export type ComputedBarGroup<D, K extends string = string> = Omit<BarGroupItem<D, K>, "bars"> & {
  bars: ComputedBar<BarGroupBar<D, K>>[];
};

type SeriesSharedProps<K extends string> = {
  /** Colour per series; defaults to the theme's categorical palette. */
  color?: (series: K, index: number) => string;
  /** Corner radius, forwarded to every rect. */
  rx?: number | string;
  ry?: number | string;
  top?: number;
  left?: number;
  className?: ClassValue;
};

export type BarStackProps<D, K extends string = string> = SeriesSharedProps<K> & {
  /** From `barStackLayout`. */
  layout: BarStackLayout<D, K>;
  children?: Snippet<[{ barStacks: ComputedBarStack<D, K>[] }]>;
};

export type BarGroupProps<D, K extends string = string> = SeriesSharedProps<K> & {
  /** From `barGroupLayout`. */
  layout: BarGroupLayout<D, K>;
  children?: Snippet<[{ barGroups: ComputedBarGroup<D, K>[] }]>;
};
