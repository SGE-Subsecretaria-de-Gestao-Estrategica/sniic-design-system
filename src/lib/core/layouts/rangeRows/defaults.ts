import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { RangeRowsSpacing } from "./types";

export const RANGE_ROWS_DEFAULTS: Readonly<RangeRowsSpacing> = {
  rowThickness: 28,
  rowGapRatio: 1 / 3,
  markerRadius: 10,
  strapInset: 2,
  domainPaddingRatio: 0.1,
  insetStart: spacing["3xl"],
  insetEnd: 0,
  valueLabelGap: spacing.xs,
  categoryLabelGap: spacing.sm,
};

export function resolveSpacing(overrides: Partial<RangeRowsSpacing>) {
  return resolveDefaults(RANGE_ROWS_DEFAULTS, overrides);
}
