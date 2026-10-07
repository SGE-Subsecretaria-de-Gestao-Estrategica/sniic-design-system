import type { CapsuleBox, Rect } from "../capsuleBar/types";

export type CapsuleStackSpacing = {
  /** Gap between segments, in px, painted in the background colour. */
  gap: number;
};

/** One piece of a stack, from the base outward; extra fields pass through. */
export type CapsuleStackSegment = {
  /** Length along the stack's axis, in px. */
  length: number;
};

export type CapsuleStackLayoutConfig = CapsuleBox & Partial<CapsuleStackSpacing>;

export type CapsuleStackPiece<S extends CapsuleStackSegment> = S & {
  index: number;
  /** Distances from the stack's base. */
  from: number;
  to: number;
  rect: Rect;
};

export type CapsuleStackLayout<S extends CapsuleStackSegment> = {
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
