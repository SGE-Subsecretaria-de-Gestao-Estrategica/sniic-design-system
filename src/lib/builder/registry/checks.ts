import type { Accessor } from "$lib/types/Accessor";
import type { Row } from "../data/types";

/**
 * For charts that need one row per key. Throws a pt-BR message naming an
 * example; `resolveChart` shows it to the user.
 */
export function assertUnique(rows: readonly Row[], getKey: Accessor<Row, string>, plural: string) {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = getKey(row);
    if (seen.has(key)) {
      throw new Error(
        `Há ${plural} repetidas (ex.: “${key}”). Este gráfico precisa de uma linha por valor.`,
      );
    }
    seen.add(key);
  }
}
