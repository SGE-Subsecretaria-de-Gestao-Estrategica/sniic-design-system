import type { SVGAttributes } from "svelte/elements";
import type { CapsuleBarLayout } from "$lib/core/layouts/capsuleBar";

export type CapsuleBarOwnProps = {
  /** Geometry from `capsuleBarLayout`. */
  layout: CapsuleBarLayout;
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
  class?: string;
};

export type CapsuleBarProps = CapsuleBarOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof CapsuleBarOwnProps>;
