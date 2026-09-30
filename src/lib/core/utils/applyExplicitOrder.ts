/**
 * Reorders `keys` so the entries listed in `order` come first, in that order,
 * followed by the remaining keys in their original order.
 *
 * Entries of `order` that are not present in `keys` are ignored, so the same
 * order list can be reused across datasets that don't share every key.
 */
export default function applyExplicitOrder<K>(
  keys: readonly K[],
  order: readonly K[],
): K[] {
  const present = new Set(keys);
  const listed = [...new Set(order)].filter((k) => present.has(k));
  const listedSet = new Set(listed);
  return [...listed, ...keys.filter((k) => !listedSet.has(k))];
}
