import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { BarTableSpacing } from "./types";

export const BAR_TABLE_DEFAULTS: Readonly<BarTableSpacing> = {
  barThickness: 16,
  barGapRatio: 0.625,
  // Narrow columns need room past the longest bar for its value.
  valueHeadroom: 1.4,
  columnGap: spacing.xl,
  headerHeight: spacing.xl,
  valueLabelGap: spacing.sm,
  categoryLabelGap: spacing.md,
  missingLabelGap: spacing.sm,
};

export function resolveSpacing(overrides: Partial<BarTableSpacing>) {
  return resolveDefaults(BAR_TABLE_DEFAULTS, overrides);
}
