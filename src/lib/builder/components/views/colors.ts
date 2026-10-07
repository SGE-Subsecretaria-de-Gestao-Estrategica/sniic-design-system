import chroma from "chroma-js";
import type { PillarTheme } from "./types";

export type ColorPair = { main: string; variant: string };

/**
 * Line colours follow the report: every series in the primary pair, and the
 * one in highlight in the secondary pair. No colour is derived from another.
 */
export function seriesColors(
  isHighlight: boolean,
  theme: PillarTheme,
): ColorPair {
  const { palette } = theme;
  return isHighlight
    ? { main: palette.secondary, variant: palette.secondaryVariant }
    : { main: palette.primary, variant: palette.primaryVariant };
}

/** Colour of group `index`: the palette's own colours, in order, repeating after the fifth. */
export function groupColor(index: number, theme: PillarTheme): string {
  const { primary, secondary, accent, primaryVariant, secondaryVariant } =
    theme.palette;
  const colors = [primary, secondary, accent, primaryVariant, secondaryVariant];
  return colors[((index % colors.length) + colors.length) % colors.length];
}

export const RAMPS = ["secondary", "primary"] as const;
export type Ramp = (typeof RAMPS)[number];

export const RAMP_ORDERS = ["lightToDark", "toVariant", "fromVariant"] as const;
export type RampOrder = (typeof RAMP_ORDERS)[number];

/**
 * The anchors of a stepped ramp: from the page colour through the two colours
 * of the pair. `lightToDark` puts the lighter one first, as in G6.10; the
 * other orders run from the colour to its variant, or back.
 */
export function rampColors(
  ramp: Ramp,
  order: RampOrder,
  theme: PillarTheme,
): [string, string, string] {
  const { palette } = theme;
  const [main, variant] =
    ramp === "primary"
      ? [palette.primary, palette.primaryVariant]
      : [palette.secondary, palette.secondaryVariant];
  const toVariant =
    order === "lightToDark"
      ? chroma(main).luminance() > chroma(variant).luminance()
      : order === "toVariant";
  return toVariant
    ? [palette.base[100], main, variant]
    : [palette.base[100], variant, main];
}

/** WCAG AA for text. */
const MIN_LIGHT_LABEL_CONTRAST = 4.5;

/**
 * Label colour on a filled tile: the light one only where it is readable,
 * otherwise the dark one (G6.10.1 switches at the same step).
 */
export function labelColorOn(background: string, theme: PillarTheme): string {
  const light = theme.palette.base[100];
  return chroma.contrast(light, background) >= MIN_LIGHT_LABEL_CONTRAST
    ? light
    : theme.palette.neutral[300];
}
