import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { CoverageDotsSpacing } from "./types";

export const COVERAGE_DOTS_DEFAULTS: Readonly<CoverageDotsSpacing> = {
  rowThickness: 24,
  rowGapRatio: 1 / 3,
  markerRadius: 7,
  headerHeight: 28,
  blockGap: spacing.md,
  referenceLabelHeight: 20,
  axisHeight: 24,
  insetEnd: 48,
  domainPaddingRatio: 0.15,
  tickCount: 5,
  breakSize: spacing.sm,
  valueLabelGap: spacing.xs,
  categoryLabelGap: spacing.sm,
};

export function resolveSpacing(overrides: Partial<CoverageDotsSpacing>) {
  return resolveDefaults(COVERAGE_DOTS_DEFAULTS, overrides);
}
