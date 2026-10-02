import type { SVGAttributes } from "svelte/elements";

export type DumbbellOwnProps = {
  /** Start point — the "before" end. */
  from: { x: number; y: number };
  /** End point — the "after" end, emphasised like the last point of a line. */
  to: { x: number; y: number };
  /** Stroke colour. Defaults to the theme's line stroke (`primary`). */
  stroke?: string;
  /** Stroke thickness. Defaults to the theme's line stroke width. */
  strokeWidth?: number;
  strokeOpacity?: number;
  /** Start dot colour. Defaults to the theme's marker colour (`primaryVariant`). */
  fromFill?: string;
  /** End dot colour. Defaults to the theme's `accent`, the line charts' last point. */
  toFill?: string;
  /** Start dot radius. Defaults to the theme's marker size. */
  fromSize?: number;
  /** End dot radius. Defaults to 1.6× the start dot. */
  toSize?: number;
  /** Hide either end's dot — to reveal the pair in steps. */
  showFrom?: boolean;
  showTo?: boolean;
  /** Draw the stroke between the dots. */
  showStroke?: boolean;
  class?: string;
};

export type DumbbellProps = DumbbellOwnProps &
  Omit<SVGAttributes<SVGGElement>, keyof DumbbellOwnProps>;
