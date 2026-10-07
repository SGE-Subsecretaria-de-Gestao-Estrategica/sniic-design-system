import resolveDefaults from "$lib/core/utils/resolveDefaults";
import type { CapsuleStackSpacing } from "./types";

export const CAPSULE_STACK_DEFAULTS: Readonly<CapsuleStackSpacing> = {
  gap: 2,
};

export function resolveCapsuleStackSpacing(overrides: Partial<CapsuleStackSpacing>) {
  return resolveDefaults(CAPSULE_STACK_DEFAULTS, overrides);
}
