import type { SVGAttributes } from "svelte/elements";
import type { Rect } from "$lib/core/layouts/types";
import type { CapsuleBox, CapsuleOrientation } from "./CapsuleBar";

/** One piece of a stack, from the base outward; extra fields pass through. */
export type CapsuleStackSegment = {
  /** Length along the stack's axis, in px. */
  length: number;
};

export type CapsuleStackConfig = CapsuleBox & {
  orientation: CapsuleOrientation;
  /** Gap between segments, in px. */
  gap: number;
};

export type CapsuleStackPiece<S extends CapsuleStackSegment> = S & {
  index: number;
  /** Distances from the stack's base. */
  from: number;
  to: number;
  rect: Rect;
};

/** What `capsuleStack` computes from a box and its segments. */
export type CapsuleStackGeometry<S extends CapsuleStackSegment> = {
  /** Sum of the segments' lengths. */
  total: number;
  thickness: number;
  /** The visible box, exactly from the base to the stack's total length. */
  clip: Rect;
  /** The stack's capsule: every piece is clipped to it. */
  path: string;
  pieces: CapsuleStackPiece<S>[];
  /** Thin bands between adjacent pieces. */
  gaps: Rect[];
};

/** A stack segment as `CapsuleStack` paints it. */
export type CapsuleStackFillSegment = CapsuleStackSegment & {
  fill: string;
  fillOpacity?: number;
};

export type CapsuleStackOwnProps = CapsuleBox & {
  /** Which way the stack runs. Defaults to `"vertical"`. */
  orientation?: CapsuleOrientation;
  /** The pieces, from the base outward; the box's length is their sum. */
  segments: readonly CapsuleStackFillSegment[];
  /** Gap between segments, in px. Defaults to the theme's `capsule.gap`. */
  gap?: number;
  /** Colour of the gaps — the surface behind the chart. Defaults to the theme's `capsule.gapFill`. */
  gapFill?: string;
  class?: string;
};

export type CapsuleStackProps = CapsuleStackOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleStackOwnProps>;
