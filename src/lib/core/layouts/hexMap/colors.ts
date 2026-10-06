import chroma from "chroma-js";
import { CHOROPLETH_COLOR_DEFAULTS } from "./defaults";
import type { ChoroplethColorConfig } from "./types";

export function choroplethStepColors({
  colors,
  steps = CHOROPLETH_COLOR_DEFAULTS.steps,
  mode = CHOROPLETH_COLOR_DEFAULTS.mode,
}: ChoroplethColorConfig): string[] {
  return chroma.scale(colors).mode(mode).colors(steps);
}
