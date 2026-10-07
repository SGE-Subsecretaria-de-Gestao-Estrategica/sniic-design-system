import * as d3 from "d3";
import type { FieldSeparator, RawRow, Table } from "./types";

export const FIELD_SEPARATORS: readonly FieldSeparator[] = [
  ";",
  ",",
  "\t",
  "|",
];

const SAMPLE_LINES = 20;

export function detectDelimiter(text: string): FieldSeparator {
  const sample = text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .slice(0, SAMPLE_LINES)
    .join("\n");
  let best: {
    separator: FieldSeparator;
    consistency: number;
    columns: number;
  } | null = null;

  for (const separator of FIELD_SEPARATORS) {
    const counts = d3
      .dsvFormat(separator)
      .parseRows(sample)
      .map((r) => r.length);
    const mode = d3.mode(counts) ?? 0;
    if (mode < 2) continue;
    const consistency = counts.filter((c) => c === mode).length / counts.length;
    const better =
      !best ||
      consistency > best.consistency ||
      (consistency === best.consistency && mode > best.columns);
    if (better) best = { separator, consistency, columns: mode };
  }
  return best?.separator ?? ";";
}

export function uniqueHeaders(header: readonly string[]): string[] {
  const used = new Set<string>();
  return header.map((raw, i) => {
    const base = raw.trim() || `Coluna ${i + 1}`;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base} (${n})`;
    used.add(name);
    return name;
  });
}

export function parseTable(text: string, separator: FieldSeparator): Table {
  const lines = d3.dsvFormat(separator).parseRows(text);
  const nonEmpty = lines.filter((cells) => cells.some((c) => c.trim()));
  if (!nonEmpty.length) return { columns: [], rows: [] };

  const columns = uniqueHeaders(nonEmpty[0]);
  const rows = nonEmpty.slice(1).map((cells) => {
    const row: RawRow = {};
    columns.forEach((name, i) => (row[name] = cells[i]));
    return row;
  });
  return { columns, rows };
}
