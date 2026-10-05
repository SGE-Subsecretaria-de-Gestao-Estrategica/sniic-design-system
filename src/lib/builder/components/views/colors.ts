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
