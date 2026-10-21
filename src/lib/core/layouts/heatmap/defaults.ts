import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { HeatmapSpacing } from "./types";

export const HEATMAP_DEFAULTS: Readonly<HeatmapSpacing> = {
  cellGap: spacing.xs / 2,
  rowLabelGap: spacing.sm,
  columnLabelGap: spacing.sm,
  steps: 5,
};

export function resolveSpacing(overrides: Partial<HeatmapSpacing>) {
  return resolveDefaults(HEATMAP_DEFAULTS, overrides);
}
