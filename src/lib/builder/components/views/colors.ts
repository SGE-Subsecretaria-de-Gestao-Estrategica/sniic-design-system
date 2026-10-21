import chroma from "chroma-js";
import { getGradientStops } from "$lib/core/utils/getGradientRamp";
import { readChoice, readColorMap } from "../../registry/options";
import {
  BASE_RAMP_ORDERS,
  RAMP_BASES,
  RAMP_KINDS,
  RAMP_TARGETS,
  type BaseRampOrder,
  type RampBase,
  type RampTarget,
} from "../../registry/ramps";
import type { AutomaticColors } from "../../registry/types";
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

/**
 * `steps` colours evenly spaced between the two colours of a pair, without
 * the page colour: a heatmap's steps, lowest first. The order is
 * `rampColors`'s.
 */
export function pairStepColors(
  ramp: Ramp,
  order: RampOrder,
  steps: number,
  theme: PillarTheme,
): string[] {
  const [, from, to] = rampColors(ramp, order, theme);
  return getGradientStops(steps, [from, to]);
}

/**
 * `steps` colours evenly spaced from base colour `base` to the pillar colour
 * `target`, lowest first; `toBase` runs the other way.
 */
export function baseStepColors(
  base: RampBase,
  target: RampTarget,
  order: BaseRampOrder,
  steps: number,
  theme: PillarTheme,
): string[] {
  const { palette } = theme;
  const ends = [palette.base[base], palette[target]];
  return getGradientStops(steps, order === "toBase" ? ends.reverse() : ends);
}

/**
 * The step colours a chart's ramp options ask for: from a base colour
 * (`rampKind` "base"), or the chart's own pair ramp, `pair`, otherwise.
 */
export function rampStepColors(
  options: Record<string, JsonValue>,
  steps: number,
  theme: PillarTheme,
  pair: () => string[],
): string[] {
  if (readChoice(options, "rampKind", RAMP_KINDS, "pair") !== "base") {
    return pair();
  }
  return baseStepColors(
    readChoice(options, "rampBase", RAMP_BASES, "100"),
    readChoice(options, "rampTarget", RAMP_TARGETS, "primary"),
    readChoice(options, "rampBaseOrder", BASE_RAMP_ORDERS, "fromBase"),
    steps,
    theme,
  );
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

/** Stops offered between a colour and its variant, whatever the series count. */
export const SERIES_COLOR_STEPS = 8;

/** `steps` stops from `from` to `to`, evenly spaced, as choices `${prefix}-i`. */
function stepChoices(
  steps: number,
  [from, to]: [string, string],
  prefix: string,
  label: string,
  group: SeriesColorGroup,
): SeriesColorChoice[] {
  const stops = getGradientStops(steps, [from, to]);
  return stops.map((color, i) => ({
    id: `${prefix}-${i}`,
    label: `${label} · ${i + 1} de ${stops.length}`,
    color,
    group,
  }));
}

/**
 * The colours offered per series, by group: the pillar's own five colours;
 * `SERIES_COLOR_STEPS` evenly spaced stops from primary to primary variant,
 * and as many from secondary to secondary variant; and the neutrals 100 to
 * 400.
 */
export function seriesColorChoices(theme: PillarTheme): SeriesColorChoice[] {
  const steps = SERIES_COLOR_STEPS;
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

/** The pillar colours that pair with each other (a colour and its variant). */
const BASE_PARTNERS: Record<string, string> = {
  primary: "primaryVariant",
  primaryVariant: "primary",
  secondary: "secondaryVariant",
  secondaryVariant: "secondary",
};

/**
 * The choice drawn with `id` where a series needs a second colour (a line's
 * markers): the end of the pair farther from it. A step in the first half of
 * a ramp pairs with the last stop, one in the second half with the first
 * (7 of 8 → 1 of 8); a pillar colour pairs with its variant, and back. The
 * accent and the neutrals pair with themselves.
 */
export function partnerChoiceId(id: string): string {
  if (id in BASE_PARTNERS) return BASE_PARTNERS[id];
  const step = /^(gradient|secondaryGradient)-(\d+)$/.exec(id);
  if (!step) return id;
  const last = SERIES_COLOR_STEPS - 1;
  return `${step[1]}-${Number(step[2]) < SERIES_COLOR_STEPS / 2 ? last : 0}`;
}

/**
 * The stored colour of each series whose choice is still offered, with its
 * partner (`partnerChoiceId`) as the variant.
 */
export function chosenSeriesPairs(
  stored: JsonValue | undefined,
  theme: PillarTheme,
): Map<string, ColorPair> {
  const choices = seriesColorChoices(theme);
  const colorOf = (id: string) => choices.find((c) => c.id === id)?.color;
  const chosen = new Map<string, ColorPair>();
  for (const [key, id] of Object.entries(readColorMap(stored))) {
    const main = colorOf(id);
    if (main) {
      chosen.set(key, { main, variant: colorOf(partnerChoiceId(id)) ?? main });
    }
  }
  return chosen;
}

/** The stored colour of each series whose choice is still offered. */
export function chosenSeriesColors(
  stored: JsonValue | undefined,
  theme: PillarTheme,
): Map<string, string> {
  return new Map(
    [...chosenSeriesPairs(stored, theme)].map(([key, pair]) => [key, pair.main]),
  );
}

/**
 * The colour a series left on "Automática" gets: `byPosition`, `groupColor`
 * of its position; `lines`, the line's main colour (`seriesColors`);
 * `mainRamp`, primary for the first and secondary for the others (the first
 * one's ramp starts at primary, `automaticItemFill`).
 */
export function automaticSeriesColor(
  automatic: AutomaticColors,
  key: string,
  index: number,
  theme: PillarTheme,
  highlight?: string,
): string {
  if (automatic === "mainRamp") {
    return index === 0 ? theme.palette.primary : theme.palette.secondary;
  }
  return automatic === "lines"
    ? seriesColors(key === highlight, theme).main
    : groupColor(index, theme);
}

/**
 * The colour of each series: the stored choice when it is still offered,
 * otherwise its automatic colour (`byPosition` unless said).
 */
export function pickedSeriesColors(
  series: readonly string[],
  stored: JsonValue | undefined,
  theme: PillarTheme,
  automatic: AutomaticColors = "byPosition",
  highlight?: string,
): Map<string, string> {
  const chosen = chosenSeriesColors(stored, theme);
  return new Map(
    series.map((key, i) => [
      key,
      chosen.get(key) ??
        automaticSeriesColor(automatic, key, i, theme, highlight),
    ]),
  );
}

/** Where the ramp choices are listed in a `colors` option that offers them. */
export const RAMP_COLOR_GROUP = {
  id: "ramps",
  label: "Degraus ao longo das categorias",
} as const;

/** A ramp an item can be given: its categories run from `colors[0]` to `colors[1]`. */
export type RampColorChoice = {
  id: string;
  label: string;
  colors: [string, string];
};

/** The ramps offered where an item can run along its categories: each colour pair. */
export function rampColorChoices(theme: PillarTheme): RampColorChoice[] {
  const { palette } = theme;
  return [
    {
      id: "ramp-primary",
      label: "Primária → variante",
      colors: [palette.primary, palette.primaryVariant],
    },
    {
      id: "ramp-secondary",
      label: "Secundária → variante",
      colors: [palette.secondary, palette.secondaryVariant],
    },
  ];
}

/** How an item is filled: one colour, or a ramp along its categories. */
export type ItemFill =
  | { kind: "solid"; color: string }
  | { kind: "ramp"; colors: [string, string] };

/**
 * The fill of an item left on "Automática": with `mainRamp`, the first item
 * runs from primary to primary variant; otherwise `automaticSeriesColor`.
 */
export function automaticItemFill(
  automatic: AutomaticColors,
  key: string,
  index: number,
  theme: PillarTheme,
  highlight?: string,
): ItemFill {
  const { palette } = theme;
  if (automatic === "mainRamp" && index === 0) {
    return { kind: "ramp", colors: [palette.primary, palette.primaryVariant] };
  }
  return {
    kind: "solid",
    color: automaticSeriesColor(automatic, key, index, theme, highlight),
  };
}

/**
 * The fill of each item of a `colors` option that offers ramps: the stored
 * ramp or colour when it is still offered, otherwise its automatic fill.
 */
export function pickedItemFills(
  items: readonly string[],
  stored: JsonValue | undefined,
  theme: PillarTheme,
  automatic: AutomaticColors = "byPosition",
  highlight?: string,
): Map<string, ItemFill> {
  const ids = readColorMap(stored);
  const ramps = new Map(rampColorChoices(theme).map((r) => [r.id, r.colors]));
  const colors = chosenSeriesColors(stored, theme);
  return new Map(
    items.map((key, i): [string, ItemFill] => {
      const ramp = ramps.get(ids[key]);
      const color = colors.get(key);
      if (ramp) return [key, { kind: "ramp", colors: ramp }];
      if (color) return [key, { kind: "solid", color }];
      return [key, automaticItemFill(automatic, key, i, theme, highlight)];
    }),
  );
}

/** A fill as a CSS background, for the swatches. */
export function fillSwatch(fill: ItemFill): string {
  return fill.kind === "solid"
    ? fill.color
    : `linear-gradient(90deg, ${fill.colors[0]}, ${fill.colors[1]})`;
}
