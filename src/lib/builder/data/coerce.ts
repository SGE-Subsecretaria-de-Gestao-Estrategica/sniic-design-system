import type { DataSpec } from "../spec/types";
import type {
  CellValue,
  ColumnSchema,
  DatePattern,
  DecimalSeparator,
  RawRow,
  Row,
} from "./types";

const THOUSANDS: Record<DecimalSeparator, string> = { ",": ".", ".": "," };

const DATE_PATTERNS: Record<DatePattern, { regex: RegExp; order: ("y" | "m" | "d")[] }> = {
  yyyy: { regex: /^(\d{4})$/, order: ["y"] },
  "mm/yyyy": { regex: /^(\d{1,2})\/(\d{4})$/, order: ["m", "y"] },
  "dd/mm/yyyy": { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, order: ["d", "m", "y"] },
  "yyyy-mm-dd": { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: ["y", "m", "d"] },
};

export function parseNumber(
  raw: string | null | undefined,
  decimal: DecimalSeparator,
): number | null {
  if (raw == null) return null;
  const compact = raw.trim().replace(/−/g, "-").replace(/[\s ]/g, "");
  if (!compact || !/^[-+]?[\d.,]+$/.test(compact)) return null;

  const [integer, ...fraction] = compact.split(decimal);
  if (fraction.length > 1) return null;
  const groups = integer.split(THOUSANDS[decimal]);
  const grouped =
    groups.length === 1 ||
    (/^[-+]?\d{1,3}$/.test(groups[0]) && groups.slice(1).every((g) => /^\d{3}$/.test(g)));
  if (!grouped) return null;
  const digits = groups.join("");
  if (fraction.length && fraction[0].includes(THOUSANDS[decimal])) return null;

  const value = Number(fraction.length ? `${digits}.${fraction[0]}` : digits);
  return Number.isFinite(value) ? value : null;
}

export function parseDate(
  raw: string | null | undefined,
  pattern: DatePattern,
): Date | null {
  const text = raw?.trim();
  if (!text) return null;
  const { regex, order } = DATE_PATTERNS[pattern];
  const match = text.match(regex);
  if (!match) return null;

  const parts = { y: 0, m: 1, d: 1 };
  order.forEach((key, i) => (parts[key] = Number(match[i + 1])));
  const date = new Date(parts.y, parts.m - 1, parts.d);
  const valid =
    date.getFullYear() === parts.y &&
    date.getMonth() === parts.m - 1 &&
    date.getDate() === parts.d;
  return valid ? date : null;
}

export function coerceCell(
  raw: string | null | undefined,
  column: ColumnSchema,
  decimal: DecimalSeparator,
): CellValue {
  switch (column.type) {
    case "number":
      return parseNumber(raw, decimal);
    case "date":
      if (!column.datePattern) {
        throw new Error(`Column "${column.name}" is a date but has no datePattern.`);
      }
      return parseDate(raw, column.datePattern);
    case "text": {
      const text = raw?.trim();
      return text ? text : null;
    }
  }
}

export function coerceRows(
  rows: readonly RawRow[],
  columns: readonly ColumnSchema[],
  decimal: DecimalSeparator,
): Row[] {
  return rows.map((raw) => {
    const row: Row = {};
    for (const column of columns) {
      row[column.name] = coerceCell(raw[column.name], column, decimal);
    }
    return row;
  });
}

export function coerceData(
  rows: readonly RawRow[],
  data: Pick<DataSpec, "columns" | "decimal">,
): Row[] {
  return coerceRows(rows, data.columns, data.decimal);
}
