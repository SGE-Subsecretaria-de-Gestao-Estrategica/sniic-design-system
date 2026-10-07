/**
 * Resolves a "value or accessor" prop: calls it with `args` when it is a
 * function, returns it unchanged otherwise.
 */
export default function resolveValue<T, A extends unknown[]>(
  value: T | ((...args: A) => T),
  ...args: A
): T {
  return typeof value === "function"
    ? (value as (...args: A) => T)(...args)
    : value;
}
