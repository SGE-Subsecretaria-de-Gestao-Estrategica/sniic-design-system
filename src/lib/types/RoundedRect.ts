import type { SVGAttributes } from "svelte/elements";

/** Which corners of a rect to round; a corner defaults to sharp (`false`). */
export type RoundedRectCorners = {
  topLeft?: boolean;
  topRight?: boolean;
  bottomLeft?: boolean;
  bottomRight?: boolean;
};

export type RoundedRectConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * Requested radius; capped per corner to `min(radius, width / 2, height / 2)`
   * so a bar/segment too small for the radius it was asked for still renders
   * a valid, merely-rounder shape instead of self-intersecting.
   */
  radius?: number;
  /** Every corner rounds by default — a `<rect rx>` equivalent. */
  corners?: RoundedRectCorners;
};

export type RoundedBarOwnProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  corners?: RoundedRectCorners;
  class?: string;
  innerRef?: SVGPathElement | null;
  fill?: string;
  fillOpacity?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeOpacity?: number | string;
};

export type RoundedBarProps = RoundedBarOwnProps &
  Omit<SVGAttributes<SVGPathElement>, keyof RoundedBarOwnProps>;
