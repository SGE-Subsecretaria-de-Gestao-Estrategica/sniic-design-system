import { spacing, strokeWidth } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { DifferenceStemsSpacing } from "./types";

export const DIFFERENCE_STEMS_DEFAULTS: Readonly<DifferenceStemsSpacing> = {
  stemWidth: strokeWidth.lg,
  valueHeadroom: 1.5,
  labelGap: spacing.xs,
  endLabelGap: spacing.md,
};

export function resolveSpacing(overrides: Partial<DifferenceStemsSpacing>) {
  return resolveDefaults(DIFFERENCE_STEMS_DEFAULTS, overrides);
}
