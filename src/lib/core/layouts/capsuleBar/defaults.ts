import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { CapsuleBarSpacing } from "./types";

export const CAPSULE_BAR_DEFAULTS: Readonly<CapsuleBarSpacing> = {
  dotRatio: 0.55,
};

export function resolveCapsuleBarSpacing(overrides: Partial<CapsuleBarSpacing>) {
  return resolveDefaults(CAPSULE_BAR_DEFAULTS, overrides);
}
