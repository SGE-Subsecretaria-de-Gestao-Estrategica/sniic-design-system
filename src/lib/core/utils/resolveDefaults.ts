/**
 * Fills each setting of `defaults` from `overrides` when defined (`??`).
 * Only the keys of `defaults` are read, so a whole layout config (accessors
 * included) can be passed as `overrides`.
 */
export default function resolveDefaults<S extends object>(
  defaults: Readonly<S>,
  overrides: Partial<S>,
): S {
  const resolved = { ...defaults } as S;
  for (const key of Object.keys(defaults) as (keyof S)[]) {
    const value = overrides[key];
    if (value !== undefined) resolved[key] = value as S[keyof S];
  }
  return resolved;
}
