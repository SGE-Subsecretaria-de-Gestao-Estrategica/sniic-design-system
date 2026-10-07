import type { SVGAttributes } from "svelte/elements";
import type { CapsuleStackLayout, CapsuleStackSegment } from "$lib/core/layouts/capsuleStack";

/** A stack segment as `CapsuleStack` paints it. */
export type CapsuleStackFillSegment = CapsuleStackSegment & {
  fill: string;
  fillOpacity?: number;
};

export type CapsuleStackOwnProps = {
  /** Geometry from `capsuleStackLayout`. */
  layout: CapsuleStackLayout<CapsuleStackFillSegment>;
  /** Colour of the gaps — the surface behind the chart. Defaults to the theme's `capsule.gapFill`. */
  gapFill?: string;
  class?: string;
};

export type CapsuleStackProps = CapsuleStackOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleStackOwnProps>;
