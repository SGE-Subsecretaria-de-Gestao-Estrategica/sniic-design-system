import chroma from "chroma-js";
import { getGradientStops } from "$lib/core/utils/getGradientRamp";
import { readColorMap } from "../../registry/options";
import type { JsonValue } from "../../spec/types";
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

/** The groups the colour choices are listed in, in order. */
export const SERIES_COLOR_GROUPS = [
  { id: "base", label: "Paleta do pilar" },
  { id: "primarySteps", label: "Degraus: primária → variante" },
  { id: "secondarySteps", label: "Degraus: secundária → variante" },
  { id: "neutral", label: "Neutros" },
] as const;
export type SeriesColorGroup = (typeof SERIES_COLOR_GROUPS)[number]["id"];

/** A colour a series can be given, in one of `SERIES_COLOR_GROUPS`. */
export type SeriesColorChoice = {
  id: string;
  label: string;
  color: string;
  group: SeriesColorGroup;
};

const NEUTRAL_STEPS = [100, 200, 300, 400] as const;

/** `steps` stops (at least 2) from `from` to `to`, as choices `${prefix}-i`. */
function stepChoices(
  steps: number,
  [from, to]: [string, string],
  prefix: string,
  label: string,
  group: SeriesColorGroup,
): SeriesColorChoice[] {
  const stops = getGradientStops(Math.max(2, steps), [from, to]);
  return stops.map((color, i) => ({
    id: `${prefix}-${i}`,
    label: `${label} · ${i + 1} de ${stops.length}`,
    color,
    group,
  }));
}

/**
 * The colours offered per series, by group: the pillar's own five colours;
 * `steps` stops from primary to primary variant (the stops
 * `BubbleColumnsView`'s gradients run through) and as many from secondary to
 * secondary variant; and the neutrals 100 to 400.
 */
export function seriesColorChoices(
  steps: number,
  theme: PillarTheme,
): SeriesColorChoice[] {
  const { palette } = theme;
  const base: SeriesColorChoice[] = [
    { id: "primary", label: "Primária", color: palette.primary },
    {
      id: "primaryVariant",
      label: "Primária variante",
      color: palette.primaryVariant,
    },
    { id: "secondary", label: "Secundária", color: palette.secondary },
    {
      id: "secondaryVariant",
      label: "Secundária variante",
      color: palette.secondaryVariant,
    },
    { id: "accent", label: "Acento", color: palette.accent },
  ].map((c) => ({ ...c, group: "base" as const }));
  const neutral = NEUTRAL_STEPS.map((step): SeriesColorChoice => ({
    id: `neutral-${step}`,
    label: `Neutro ${step}`,
    color: palette.neutral[step],
    group: "neutral",
  }));
  return [
    ...base,
    // `gradient-i`: the ids saved charts already hold.
    ...stepChoices(
      steps,
      [palette.primary, palette.primaryVariant],
      "gradient",
      "Primária → variante",
      "primarySteps",
    ),
    ...stepChoices(
      steps,
      [palette.secondary, palette.secondaryVariant],
      "secondaryGradient",
      "Secundária → variante",
      "secondarySteps",
    ),
    ...neutral,
  ];
}

/**
 * The colour of each series: the stored choice when it is still offered,
 * otherwise `groupColor` of its position.
 */
export function pickedSeriesColors(
  series: readonly string[],
  stored: JsonValue | undefined,
  theme: PillarTheme,
): Map<string, string> {
  const choices = seriesColorChoices(series.length, theme);
  const picked = readColorMap(stored);
  return new Map(
    series.map((key, i) => {
      const choice = choices.find((c) => c.id === picked[key]);
      return [key, choice?.color ?? groupColor(i, theme)];
    }),
  );
}
