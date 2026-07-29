import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { ChartTheme } from '$lib/core/theme/types';

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Resolved layout of a `<Chart>`, handed to its `children` snippet so scales
 * can be built inline without binding.
 */
export type ChartDimensions = {
  /** Rendered SVG width (the measured container width when `responsive`). */
  width: number;
  height: number;
  /** `width` minus horizontal margins — the plotting area. */
  innerWidth: number;
  /** `height` minus vertical margins — the plotting area. */
  innerHeight: number;
  margin: Margin;
};

export type ChartOwnProps = {
  width?: number;
  height?: number;
  /** Merged over the theme default; pass only the sides you need. */
  margin?: Partial<Margin>;
  /**
   * When true the SVG width tracks the container width. `height` is always
   * honoured directly.
   */
  responsive?: boolean;
  /**
   * Sets the chart theme for this subtree. Omit to inherit an ancestor
   * `<Theme>` (or the default theme when there is none).
   */
  theme?: ChartTheme;
  ariaLabel?: string;
  containerRef?: HTMLDivElement | null;
  innerRef?: SVGSVGElement | null;
  /** Bindable — the resolved SVG width. */
  measuredWidth?: number;
  /** Bindable — width minus horizontal margins. */
  innerWidth?: number;
  /** Bindable — height minus vertical margins. */
  innerHeight?: number;
  children?: Snippet<[ChartDimensions]>;
};

export type ChartProps = ChartOwnProps &
  Omit<SVGAttributes<SVGSVGElement>, keyof ChartOwnProps | 'xmlns'>;
