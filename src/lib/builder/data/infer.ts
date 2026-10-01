import { DATE_PATTERNS, parseDate, parseNumber } from "./coerce";
import type {
  ColumnSchema,
  ColumnType,
  DatePattern,
  DecimalSeparator,
  Table,
} from "./types";

const SAMPLE_ROWS = 1000;
const MIN_PARSE_RATE = 0.9;

const NUMERIC_LOOKING = /^[-+−]?[\d.,\s]*\d[\d.,\s]*$/;
// Codes like 001 or 0350102 lose their zeros as numbers, so they stay text.
const LEADING_ZERO = /^[-+]?0\d/;

function filled(table: Table, column: string): string[] {
  return table.rows
    .slice(0, SAMPLE_ROWS)
    .map((row) => row[column]?.trim() ?? "")
    .filter(Boolean);
}

function parseRate(values: readonly string[], parses: (v: string) => boolean): number {
  return values.length ? values.filter(parses).length / values.length : 0;
}

export function detectDecimal(table: Table): DecimalSeparator {
  const values = table.columns.flatMap((c) => filled(table, c)).filter((v) => NUMERIC_LOOKING.test(v));
  const comma = values.filter((v) => parseNumber(v, ",") !== null).length;
  const point = values.filter((v) => parseNumber(v, ".") !== null).length;
  return point > comma ? "." : ",";
}

export function guessDatePattern(values: readonly string[]): DatePattern {
  let best: { pattern: DatePattern; rate: number } = { pattern: "dd/mm/yyyy", rate: 0 };
  for (const pattern of DATE_PATTERNS) {
    const rate = parseRate(values, (v) => parseDate(v, pattern) !== null);
    if (rate > best.rate) best = { pattern, rate };
  }
  return best.pattern;
}

export function inferColumn(name: string, values: readonly string[], decimal: DecimalSeparator): ColumnSchema {
  if (!values.length) return { name, type: "text" };
  const numeric = parseRate(values, (v) => parseNumber(v, decimal) !== null) >= MIN_PARSE_RATE;
  if (numeric && !values.some((v) => LEADING_ZERO.test(v))) {
    return { name, type: "number" };
  }
  const datePattern = guessDatePattern(values);
  if (parseRate(values, (v) => parseDate(v, datePattern) !== null) >= MIN_PARSE_RATE) {
    return { name, type: "date", datePattern };
  }
  return { name, type: "text" };
}

export function inferSchema(table: Table, decimal: DecimalSeparator): ColumnSchema[] {
  return table.columns.map((name) => inferColumn(name, filled(table, name), decimal));
}

export function columnAs(table: Table, name: string, type: ColumnType): ColumnSchema {
  return type === "date"
    ? { name, type, datePattern: guessDatePattern(filled(table, name)) }
    : { name, type };
}
