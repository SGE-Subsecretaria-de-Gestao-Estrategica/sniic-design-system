import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { BarGroupSpacing } from "./types";

export const BAR_GROUP_DEFAULTS: Readonly<BarGroupSpacing> = {
  groupPadding: 0.1,
};

export function resolveSpacing(overrides: Partial<BarGroupSpacing>) {
  return resolveDefaults(BAR_GROUP_DEFAULTS, overrides);
}
