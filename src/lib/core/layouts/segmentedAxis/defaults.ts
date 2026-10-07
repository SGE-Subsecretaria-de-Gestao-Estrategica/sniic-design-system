import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { SegmentedAxisSpacing } from "./types";

export const SEGMENTED_AXIS_DEFAULTS: Readonly<SegmentedAxisSpacing> = {
  breakWidthRatio: 0.175,
};

export function resolveSpacing(overrides: Partial<SegmentedAxisSpacing>) {
  return resolveDefaults(SEGMENTED_AXIS_DEFAULTS, overrides);
}
