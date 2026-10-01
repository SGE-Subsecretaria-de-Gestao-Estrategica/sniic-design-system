import type { SVGAttributes } from "svelte/elements";

export type CapsuleBarOwnProps = {
  /** Left edge of the bar's box. For `vertical`, the box's left edge too. */
  x?: number;
  /** Top edge of the bar's box. */
  y?: number;
  /**
   * Box width. Horizontal: the bar's length, from the base at `x`.
   * Vertical: the bar's thickness.
   */
  width?: number;
  /**
   * Box height. Horizontal: the bar's thickness.
   * Vertical: the bar's length, from the base at `y + height`.
   */
  height?: number;
  /**
   * `horizontal` grows rightwards from a flat base at `x`; `vertical` grows
   * upwards from a flat base at `y + height`. The far end is always a full
   * half-disc.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Grows the other way: leftwards from a base at `x + width`, or downwards
   * from a base at `y` — the left half of a diverging chart, or a bar hanging
   * below a zero line.
   */
  reverse?: boolean;
  /**
   * One colour for a solid bar, or `[base, tip]` for a gradient along the
   * bar's length. Defaults to the theme's `primaryVariant` → `primary`.
   */
  fill?: string | readonly [string, string];
  fillOpacity?: number;
  /**
   * The dot inside the cap — the same mark that sits on the thick lines of
   * the line charts. `false` drops it.
   */
  dot?: boolean;
  /** Dot colour. Defaults to the theme's `primary`. */
  dotFill?: string;
  /** Dot radius as a fraction of the cap's radius (half the thickness). */
  dotRatio?: number;
  class?: string;
};

export type CapsuleBarProps = CapsuleBarOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleBarOwnProps>;
