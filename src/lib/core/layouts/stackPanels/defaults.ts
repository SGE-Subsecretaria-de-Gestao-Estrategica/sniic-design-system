import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { StackPanelsSpacing } from "./types";

export const STACK_PANELS_DEFAULTS: Readonly<StackPanelsSpacing> = {
  gap: spacing.xl,
};

export function resolveSpacing(overrides: Partial<StackPanelsSpacing>) {
  return resolveDefaults(STACK_PANELS_DEFAULTS, overrides);
}
