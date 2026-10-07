import { fontSize, spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { LineSeriesSpacing } from "./types";

export const LINE_SERIES_DEFAULTS: Readonly<LineSeriesSpacing> = {
  yPaddingRatio: 0.1,
  valueLabelGap: spacing.md,
  endLabelGap: spacing.md,
  endValueGap: spacing.xs,
  endValueHeight: fontSize.lg,
};


export function resolveSpacing(overrides: Partial<LineSeriesSpacing>) {
  return resolveDefaults(LINE_SERIES_DEFAULTS, overrides);
}
