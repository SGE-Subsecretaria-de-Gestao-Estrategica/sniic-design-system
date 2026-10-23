// Pure helpers: every input is an argument, no defaults or config reads.

/** A share of `whole`, 0 when the whole is empty. */
export function shareOf(value: number, whole: number): number {
  return whole > 0 ? value / whole : 0;
}

/**
 * Where the 100% end sits: the width minus the room for the values, never
 * below zero.
 */
export function fullLengthOf(width: number, valueSpace: number): number {
  return Math.max(0, width - valueSpace);
}
