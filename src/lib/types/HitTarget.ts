import type { HoverState } from "$lib/core/interaction/hover.svelte.js";

export type HitTargetProps = {
  hover: HoverState;
  index: number;
  x: number;
  y: number;
  /** Radius of the painted mark; the target grows from here. */
  r?: number;
  /** Rect target: its size, with `x`/`y` as the top-left corner. */
  width?: number;
  height?: number;
  /** Path target: an SVG path in the same coordinates as the mark it covers. */
  d?: string;
  /** Extra transform for a path target drawn in another coordinate space. */
  transform?: string;
  /** Minimum diameter of the target, per the 24px hit-area floor. */
  minSize?: number;
  container?: HTMLElement | null;
  label?: string;
};
