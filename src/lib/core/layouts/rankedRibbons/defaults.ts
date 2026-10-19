import { fontSize, spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { RankedRibbonsSpacing } from "./types";

export const RANKED_RIBBONS_DEFAULTS: Readonly<RankedRibbonsSpacing> = {
  plateau: 0.18,
  ribbonGap: 0,
  totalsRoom: fontSize.md * 1.2 + spacing.md,
  totalGap: spacing.sm,
  endLabelGap: spacing.md,
  endValueHeight: fontSize.lg * 1.15,
  endNameHeight: fontSize.md * 1.2,
  endLabelSpacing: spacing.xs,
  valueLabelHeight: fontSize.sm,
  valueLabelPadding: 8,
};

export function resolveSpacing(overrides: Partial<RankedRibbonsSpacing>) {
  return resolveDefaults(RANKED_RIBBONS_DEFAULTS, overrides);
}
