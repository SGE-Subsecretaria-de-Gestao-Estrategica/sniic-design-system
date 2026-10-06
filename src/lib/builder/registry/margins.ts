import type { Margin } from "./types";

/** The margin combinations of the Eixo 6 figures (`src/stories/dist/Eixo6`). */
export const MARGIN_PRESETS = [
  {
    id: "left",
    label: "Maior à esquerda",
    margin: { top: 24, right: 24, bottom: 24, left: 120 },
  },
  {
    id: "right",
    label: "Maior à direita",
    margin: { top: 24, right: 120, bottom: 24, left: 24 },
  },
  {
    id: "both",
    label: "Ambos os lados",
    margin: { top: 24, right: 120, bottom: 24, left: 120 },
  },
  {
    id: "even",
    label: "Uniforme",
    margin: { top: 24, right: 24, bottom: 24, left: 24 },
  },
] as const satisfies readonly {
  id: string;
  label: string;
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
