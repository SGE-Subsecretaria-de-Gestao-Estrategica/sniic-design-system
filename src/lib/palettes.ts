import { colorScales } from './tokens.js';

/** A pair of colors for two-variable charts. */
export type ColorPair = readonly [string, string];

// ── Recommended two-color pairings (midpoint / 500 stop) ──────────────
export const colorPairs = {
  blueOrange:     [colorScales.blue[2], colorScales.orange[2]] as const,
  bluePurple:     [colorScales.blue[2], colorScales.purple[2]] as const,
  blueTeal:       [colorScales.blue[2], colorScales.teal[2]] as const,
  tealYellow:     [colorScales.teal[2], colorScales.yellow[2]] as const,
  limeRed:        [colorScales.lime[2], colorScales.red[2]] as const,
  purpleYellow:   [colorScales.purple[2], colorScales.yellow[2]] as const,
  orangeTeal:     [colorScales.orange[2], colorScales.teal[2]] as const,
  yellowLavender: [colorScales.yellow[2], colorScales.lavender[2]] as const,
} as const;

// ── Categorical palettes for 3+ variable charts ───────────────────────

/** 3 categories (e.g. age groups: youth / adult / senior). */
export const categorical3 = [
  colorScales.yellow[2],
  colorScales.blue[2],
  colorScales.lime[2],
] as const;

/** 5 categories (e.g. Brazilian regions). */
export const categorical5 = [
  colorScales.lime[2],
  colorScales.yellow[2],
  colorScales.orange[2],
  colorScales.blue[2],
  colorScales.red[2],
] as const;

/** Full 8-color categorical palette (one per hue scale). */
export const categorical8 = [
  colorScales.blue[2],
  colorScales.orange[2],
  colorScales.teal[2],
  colorScales.yellow[2],
  colorScales.purple[2],
  colorScales.lime[2],
  colorScales.red[2],
  colorScales.lavender[2],
] as const;
