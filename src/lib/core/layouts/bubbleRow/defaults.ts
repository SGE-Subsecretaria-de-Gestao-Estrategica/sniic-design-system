import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { BubbleRowSpacing } from "./types";

export const BUBBLE_ROW_DEFAULTS: Readonly<BubbleRowSpacing> = {
  minRadius: 7,
  maxRadius: 14,
  labelGap: spacing.sm,
  endLabelGap: spacing.md,
};


export function resolveSpacing(overrides: Partial<BubbleRowSpacing>) {
  return resolveDefaults(BUBBLE_ROW_DEFAULTS, overrides);
}
