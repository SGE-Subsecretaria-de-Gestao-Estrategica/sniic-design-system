/** A number as the wizard shows it: pt-BR, at most two decimals. */
export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/** A number input's text: empty = no value. */
export function readNumber(text: string): number | null {
  return text.trim() === "" ? null : Number(text);
}
