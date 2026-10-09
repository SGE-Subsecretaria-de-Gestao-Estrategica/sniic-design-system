import type { SVGAttributes } from "svelte/elements";
import type { LineSegment, Point, Rect } from "$lib/core/layouts/types";

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

export type CapsuleBarConfig = CapsuleBox & {
  orientation: CapsuleOrientation;
  /** Dot radius as a fraction of the cap's radius (half the thickness). */
  dotRatio: number;
};

export type CapsuleDot = Point & { radius: number };

/** What `capsuleBar` computes from a box: the pieces `CapsuleBar` draws. */
export type CapsuleBarGeometry = {
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

export type CapsuleBarOwnProps = CapsuleBox & {
  /** Which way the bar runs. Defaults to `"horizontal"`. */
  orientation?: CapsuleOrientation;
  /**
   * One colour for a solid bar, or `[base, tip]` for a gradient along the
   * bar's length. Defaults to the theme's `capsule.fill`.
   */
  fill?: string | readonly [string, string];
  fillOpacity?: number;
  /**
   * The dot inside the cap — the same mark that sits on the thick lines of
   * the line charts. `false` drops it.
   */
  dot?: boolean;
  /** Dot colour. Defaults to the theme's `capsule.dotFill`. */
  dotFill?: string;
  /** Dot size relative to the cap. Defaults to the theme's `capsule.dotRatio`. */
  dotRatio?: number;
  class?: string;
};

export type CapsuleBarProps = CapsuleBarOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleBarOwnProps>;
