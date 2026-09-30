import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { HorizontalBarsSpacing } from "./types";

export const HORIZONTAL_BARS_DEFAULTS: Readonly<HorizontalBarsSpacing> = {
  barThickness: 32,
  barGapRatio: 1 / 3,
  valueHeadroom: 1.1,
  markerInset: spacing.sm,
  valueLabelGap: spacing.sm,
  categoryLabelGap: spacing.sm,
  clipOverhangRatio: 4,
};

export function resolveSpacing(overrides: Partial<HorizontalBarsSpacing>) {
  return resolveDefaults(HORIZONTAL_BARS_DEFAULTS, overrides);
}
