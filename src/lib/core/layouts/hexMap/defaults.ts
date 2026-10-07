import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type {
  ChoroplethColorConfig,
  ChoroplethSpacing,
  TwinBarsSpacing,
} from "./types";

export const TWIN_BARS_DEFAULTS: Readonly<TwinBarsSpacing> = {
  barWidth: 20,
  barGap: 2,
  barBaseRatio: 0.45,
  barHeightRatio: 0.8,
  thresholdOverhang: spacing.sm,
  valueLabelGap: spacing.sm,
  nameLabelInset: spacing.md,
  nameCornerRatio: 2 / 3,
};

export const CHOROPLETH_DEFAULTS: Readonly<ChoroplethSpacing> = {
  nameLabelGap: spacing.xs,
  valueLabelGap: 0,
};

export const CHOROPLETH_COLOR_DEFAULTS: Readonly<Required<Omit<ChoroplethColorConfig, "colors">>> = {
  steps: 7,
  mode: "lab",
};

/** @deprecated use `TWIN_BARS_DEFAULTS`. */
export const TWIN_BARS_LABEL_DEFAULTS = TWIN_BARS_DEFAULTS;
/** @deprecated use `CHOROPLETH_DEFAULTS`. */
export const CHOROPLETH_LABEL_DEFAULTS = CHOROPLETH_DEFAULTS;

export function resolveTwinBarsSpacing(overrides: Partial<TwinBarsSpacing>) {
  return resolveDefaults(TWIN_BARS_DEFAULTS, overrides);
}

export function resolveChoroplethSpacing(overrides: Partial<ChoroplethSpacing>) {
  return resolveDefaults(CHOROPLETH_DEFAULTS, overrides);
}
