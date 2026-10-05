import type { Margin } from "./types";

/** The margin combinations of the Eixo 6 figures (`src/stories/dist/Eixo6`). */
export const MARGIN_PRESETS = [
  {
    id: "categoriesLeft",
    label: "Categorias à esquerda",
    figures: "G6.20",
    margin: { top: 24, right: 24, bottom: 24, left: 150 },
  },
  {
    id: "categoriesLeftTight",
    label: "Categorias à esquerda, direita curta",
    figures: "G6.26",
    margin: { top: 24, right: 12, bottom: 24, left: 150 },
  },
  {
    id: "namesRight",
    label: "Nomes à direita",
    figures: "G6.05, G6.07, G6.08",
    margin: { top: 12, right: 120, bottom: 24, left: 24 },
  },
  {
    id: "labelsBothSides",
    label: "Rótulos dos dois lados",
    figures: "G6.12 a G6.16",
    margin: { top: 24, right: 120, bottom: 8, left: 120 },
  },
  {
    id: "labelsBothSidesLow",
    label: "Rótulos dos dois lados, topo curto",
    figures: "G6.31",
    margin: { top: 12, right: 120, bottom: 24, left: 120 },
  },
  {
    id: "even",
    label: "Igual nos quatro lados",
    figures: "G6.09, G6.10",
    margin: { top: 24, right: 24, bottom: 24, left: 24 },
  },
] as const satisfies readonly {
  id: string;
  label: string;
  figures: string;
  margin: Margin;
}[];

export type MarginPreset = (typeof MARGIN_PRESETS)[number];
export type MarginPresetId = MarginPreset["id"];

export function isMarginPresetId(id: unknown): id is MarginPresetId {
  return MARGIN_PRESETS.some((p) => p.id === id);
}

export function marginOf(id: MarginPresetId): Margin {
  return MARGIN_PRESETS.find((p) => p.id === id)!.margin;
}

export function addMargins(
  margin: Margin,
  extra: Partial<Margin> = {},
): Margin {
  return {
    top: margin.top + (extra.top ?? 0),
    right: margin.right + (extra.right ?? 0),
    bottom: margin.bottom + (extra.bottom ?? 0),
    left: margin.left + (extra.left ?? 0),
  };
}
