import type { Snippet } from "svelte";

export type LabelMaskProps = {
  children: Snippet;
  /** Patch colour. Defaults to the theme's `labelMask.fill`, the chart background. */
  fill?: string;
  /** How much of the marks under the patch is hidden: 1 hides them entirely. */
  fillOpacity?: number;
  /** Space around the label, in px — one number, or `[horizontal, vertical]`. */
  padding?: number | readonly [number, number];
  radius?: number;
  /** Explicit box in place of the measured one. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};
