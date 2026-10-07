import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { BubbleColumnsSpacing } from "./types";

export const BUBBLE_COLUMNS_DEFAULTS: Readonly<BubbleColumnsSpacing> = {
  maxRadius: 40,
  rowGap: 40 + spacing.md,
  columnHalfWidth: 24,
  columnGap: spacing.md,
  axisOverhang: spacing.md,
  labelGap: spacing.sm,
  smallRadiusThreshold: 16,
  groupLabelGap: spacing.sm,
  categoryLabelGap: spacing.md,
};

export function resolveSpacing(overrides: Partial<BubbleColumnsSpacing>) {
  return resolveDefaults(BUBBLE_COLUMNS_DEFAULTS, overrides);
}
