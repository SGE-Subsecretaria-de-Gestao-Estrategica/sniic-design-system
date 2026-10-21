// Options shared by the charts coloured by steps (heatmap, choropleth): the
// pillar pair they already had, or a ramp from a base colour to one colour.

export const RAMP_KINDS = ["pair", "base"] as const;
export type RampKind = (typeof RAMP_KINDS)[number];

export const RAMP_BASES = ["100", "200", "300"] as const;
export type RampBase = (typeof RAMP_BASES)[number];

export const RAMP_TARGETS = [
  "primary",
  "primaryVariant",
  "secondary",
  "secondaryVariant",
] as const;
export type RampTarget = (typeof RAMP_TARGETS)[number];

export const BASE_RAMP_ORDERS = ["fromBase", "toBase"] as const;
export type BaseRampOrder = (typeof BASE_RAMP_ORDERS)[number];

const BASE = { option: "rampKind", equals: "base" } as const;

/** The kind of ramp, `pairLabel` naming the chart's own; its pair options take `when: PAIR_RAMP`. */
export function rampKindOption(pairLabel: string) {
  return {
    id: "rampKind",
    label: "Escala de cores",
    step: "style",
    drawingOnly: true,
    kind: "choice",
    choices: [
      { value: "pair", label: pairLabel },
      { value: "base", label: "De uma cor de fundo até uma cor do pilar" },
    ],
    default: "pair",
  } as const;
}

export const PAIR_RAMP = { option: "rampKind", equals: "pair" } as const;

/** Shown while the ramp runs from a base colour. */
export const BASE_RAMP_OPTIONS = [
  {
    id: "rampBase",
    label: "Cor de fundo",
    step: "style",
    drawingOnly: true,
    kind: "choice",
    when: BASE,
    choices: [
      { value: "100", label: "Base 100" },
      { value: "200", label: "Base 200" },
      { value: "300", label: "Base 300" },
    ],
    default: "100",
  },
  {
    id: "rampTarget",
    label: "Cor do pilar",
    step: "style",
    drawingOnly: true,
    kind: "choice",
    when: BASE,
    choices: [
      { value: "primary", label: "Primária" },
      { value: "primaryVariant", label: "Primária variante" },
      { value: "secondary", label: "Secundária" },
      { value: "secondaryVariant", label: "Secundária variante" },
    ],
    default: "primary",
  },
  {
    id: "rampBaseOrder",
    label: "Sentido das cores",
    step: "style",
    drawingOnly: true,
    kind: "choice",
    when: BASE,
    choices: [
      { value: "fromBase", label: "Do fundo (menor valor) para a cor" },
      { value: "toBase", label: "Da cor (menor valor) para o fundo" },
    ],
    default: "fromBase",
  },
] as const;
