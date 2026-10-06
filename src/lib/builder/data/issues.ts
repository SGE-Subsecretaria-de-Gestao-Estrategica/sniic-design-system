import { formatLocale } from "$lib/core/format";
import { coerceCell } from "./coerce";
import type {
  ColumnIssues,
  ColumnSchema,
  ColumnType,
  DecimalSeparator,
  Table,
} from "./types";

const ISSUE_EXAMPLES = 2;

const formatNumber = formatLocale.format(",");

/** A filled cell that doesn't read under its column's type. */
export function cellFails(
  raw: string | undefined,
  column: ColumnSchema,
  decimal: DecimalSeparator,
): boolean {
  const text = raw?.trim();
  return !!text && coerceCell(text, column, decimal) === null;
}

export function columnIssues(
  table: Table,
  columns: readonly ColumnSchema[],
  decimal: DecimalSeparator,
): Record<string, ColumnIssues> {
  const issues: Record<string, ColumnIssues> = {};
  for (const column of columns) {
    const examples = new Set<string>();
    let failed = 0;
    for (const row of table.rows) {
      const raw = row[column.name];
      if (!cellFails(raw, column, decimal)) continue;
      failed++;
      if (examples.size < ISSUE_EXAMPLES) examples.add(raw!.trim());
    }
    issues[column.name] = { failed, examples: [...examples] };
  }
  return issues;
}

const FAILURE_LABEL: Record<
  Exclude<ColumnType, "text">,
  [one: string, many: string]
> = {
  number: ["valor não numérico", "valores não numéricos"],
  date: ["valor que não é data", "valores que não são datas"],
  uf: ["valor que não é UF", "valores que não são UFs"],
};

/** e.g. `12 valores não numéricos: “–”, “n/d”` */
export function describeIssues(
  type: ColumnType,
  failed: number,
  examples: readonly string[],
): string {
  if (type === "text" || !failed) return "";
  const [one, many] = FAILURE_LABEL[type];
  const quoted = examples.map((e) => `“${e}”`).join(", ");
  return `${formatNumber(failed)} ${failed === 1 ? one : many}${quoted ? `: ${quoted}` : ""}`;
}
