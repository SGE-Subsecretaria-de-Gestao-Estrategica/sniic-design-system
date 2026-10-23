import { spacing } from "$lib/core/theme/tokens";
import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { PartitionBarsSpacing } from "./types";

export const PARTITION_BARS_DEFAULTS: Readonly<PartitionBarsSpacing> = {
  barThickness: 32,
  pieceThickness: 20,
  rowGap: spacing.lg,
  pieceGap: spacing.md,
  headerHeight: 28,
  blockGap: spacing.lg,
  valueSpace: 96,
  valueGap: spacing.sm,
  categoryLabelGap: spacing.md,
};

export function resolveSpacing(overrides: Partial<PartitionBarsSpacing>) {
  return resolveDefaults(PARTITION_BARS_DEFAULTS, overrides);
}
