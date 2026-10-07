import type { LineSegment, Point, Rect } from "../types";

export type { Rect };

export type CapsuleOrientation = "horizontal" | "vertical";

/**
 * The box a capsule sits in, as for an SVG `rect`. Horizontal: `width` is the
 * length, from a flat base at `x`; vertical: `height` is the length, from a
 * flat base at `y + height`. `reverse` grows the other way — from `x + width`
 * leftwards, or from `y` downwards.
 */
export type CapsuleBox = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  orientation?: CapsuleOrientation;
  reverse?: boolean;
};

/** A capsule's axis in user space: everything the geometry helpers read. */
export type CapsuleFrame = {
  horizontal: boolean;
  /** +1 when the capsule grows toward larger coordinates, -1 toward smaller. */
  dir: 1 | -1;
  /** Length along the axis and thickness across it, never negative. */
  length: number;
  thickness: number;
  /** Where the base sits along the axis. */
  baseAt: number;
  /** Where the box starts across the axis. */
  acrossAt: number;
};

export type CapsuleBarSpacing = {
  /** Dot radius as a fraction of the cap's radius (half the thickness). */
  dotRatio: number;
};

export type CapsuleBarLayoutConfig = CapsuleBox & Partial<CapsuleBarSpacing>;

export type CapsuleDot = Point & { radius: number };

export type CapsuleBarLayout = {
  length: number;
  thickness: number;
  /** The visible box, exactly from base to tip. */
  clip: Rect;
  /** The capsule before clipping: flat base, half-disc tip. */
  path: string;
  /** Base-to-tip along the centreline, for a gradient. */
  gradient: LineSegment;
  /** The dot concentric with the tip's half-disc. */
  dot: CapsuleDot;
};
