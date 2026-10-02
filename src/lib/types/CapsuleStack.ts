import type { SVGAttributes } from "svelte/elements";

/** One piece of a stack, from the base outward. */
export type CapsuleStackSegment = {
  /** Length along the stack's axis, in px. */
  length: number;
  fill: string;
  fillOpacity?: number;
};

export type CapsuleStackOwnProps = {
  /** The stack's box: `x`/`y` top-left, as for `CapsuleBar`. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** `vertical` stacks upwards from a base at `y + height`; `horizontal` rightwards from `x`. */
  orientation?: "horizontal" | "vertical";
  segments: CapsuleStackSegment[];
  /** Gap between segments, in px, painted in the background colour. */
  gap?: number;
  /** Colour of the gap — the surface behind the chart. Defaults to the theme's `base[100]`. */
  gapFill?: string;
  class?: string;
};

export type CapsuleStackProps = CapsuleStackOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleStackOwnProps>;
