import type {
  ColumnSchema,
  ColumnType,
  DatePattern,
  DecimalSeparator,
  FieldSeparator,
} from "../data/types";
import { fileBaseName } from "../export/names";
import type { ChartId } from "../registry/layouts";
import type { ChartRegistry } from "../registry/types";
import {
  createSpec,
  pruneEncoding,
  type StylePatch,
  setAggregate,
  setChart,
  setData,
  setEncoding,
  setFormat,
  setOption,
  setParam,
  setStyle,
} from "./spec";
import {
  CHART_SPEC_VERSION,
  type Aggregation,
  type ChartSpec,
  type DataSpec,
  type Encoding,
  type JsonValue,
  type NumberFormat,
  type ResetNotice,
  type SpecChange,
} from "./types";

export const SAVED_CHART_KIND = "sniic-chart";
export const SAVED_CHART_EXTENSION = ".json";

/** A chart saved to a file: the spec, and the file's text when saved with the data. */
export type SavedChart = {
  kind: typeof SAVED_CHART_KIND;
  spec: ChartSpec;
  data?: string;
};

/** What a saved file holds once read: nothing in `spec` is trusted yet. */
export type SavedChartFile = {
  spec: Record<string, unknown>;
  data?: string;
};

export type SavedChartResult =
  { ok: true; saved: SavedChartFile } | { ok: false; error: string };

type Loose = Record<string, unknown>;

const isRecord = (value: unknown): value is Loose =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const AGGREGATIONS: readonly Aggregation[] = ["sum", "mean", "count", "first"];
const COLUMN_TYPES: readonly ColumnType[] = ["number", "date", "text", "uf"];
const DATE_PATTERNS: readonly DatePattern[] = [
  "yyyy",
  "mm/yyyy",
  "dd/mm/yyyy",
  "yyyy-mm-dd",
];
const FIELD_SEPARATORS: readonly FieldSeparator[] = [";", ",", "\t", "|"];
const DECIMAL_SEPARATORS: readonly DecimalSeparator[] = [",", "."];

export function saveChart(spec: ChartSpec, data?: string): string {
  const saved: SavedChart = { kind: SAVED_CHART_KIND, spec };
  if (data !== undefined) saved.data = data;
  return JSON.stringify(saved, null, 2);
}

/** `vinculos.csv` → `vinculos.grafico.json` */
export function savedChartName(fileName: string | null): string {
  return `${fileBaseName(fileName)}.grafico${SAVED_CHART_EXTENSION}`;
}

export function readSavedChart(text: string): SavedChartResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  if (
    !isRecord(parsed) ||
    parsed.kind !== SAVED_CHART_KIND ||
    !isRecord(parsed.spec)
  ) {
    return {
      ok: false,
      error: "O arquivo não é um gráfico salvo por este construtor.",
    };
  }
  const { version } = parsed.spec;
  if (typeof version !== "number" || version > CHART_SPEC_VERSION) {
    return {
      ok: false,
      error: "O gráfico foi salvo por uma versão mais nova do construtor.",
    };
  }
  return {
    ok: true,
    saved: {
      spec: parsed.spec,
      data: typeof parsed.data === "string" ? parsed.data : undefined,
    },
  };
}

/** The column types a saved spec holds, by name; malformed entries are left out. */
export function savedColumns(saved: Loose): Map<string, ColumnSchema> {
  const columns = isRecord(saved.data) ? saved.data.columns : undefined;
  const byName = new Map<string, ColumnSchema>();
  for (const column of Array.isArray(columns) ? columns : []) {
    if (!isRecord(column) || typeof column.name !== "string") continue;
    const type = COLUMN_TYPES.find((t) => t === column.type);
    if (!type) continue;
    if (type !== "date") {
      byName.set(column.name, { name: column.name, type });
      continue;
    }
    const datePattern = DATE_PATTERNS.find((p) => p === column.datePattern);
    if (datePattern) {
      byName.set(column.name, { name: column.name, type, datePattern });
    }
  }
  return byName;
}

/** The separators a saved spec holds, when they are ones the builder knows. */
export function savedSeparators(saved: Loose): {
  delimiter?: FieldSeparator;
  decimal?: DecimalSeparator;
} {
  const data = isRecord(saved.data) ? saved.data : {};
  return {
    delimiter: FIELD_SEPARATORS.find((s) => s === data.delimiter),
    decimal: DECIMAL_SEPARATORS.find((s) => s === data.decimal),
  };
}

export function savedFileName(saved: Loose): string | null {
  const name = isRecord(saved.data) ? saved.data.fileName : null;
  return typeof name === "string" ? name : null;
}

function stringEntries(value: unknown): Encoding {
  return Object.fromEntries(
    Object.entries(isRecord(value) ? value : {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function formatPatch(value: unknown): Partial<NumberFormat> {
  if (!isRecord(value)) return {};
  const patch: Partial<NumberFormat> = {};
  if (value.decimals === null || typeof value.decimals === "number")
    patch.decimals = value.decimals;
  if (typeof value.compact === "boolean") patch.compact = value.compact;
  if (typeof value.percent === "boolean") patch.percent = value.percent;
  if (typeof value.prefix === "string") patch.prefix = value.prefix;
  if (typeof value.suffix === "string") patch.suffix = value.suffix;
  return patch;
}

/**
 * Rebuilds a saved spec over `data`. Every choice goes through its setter, so
 * the result is valid whatever the file holds: a choice that no longer fits
 * is left out, and `reset` lists the mappings whose column is gone or changed
 * type.
 */
export function restoreSpec(
  saved: Loose,
  data: DataSpec,
  registry: ChartRegistry,
): SpecChange {
  let spec = setData(createSpec(), data, registry).spec;
  const reset: ResetNotice[] = [];
  const attempt = (change: (spec: ChartSpec) => SpecChange) => {
    try {
      spec = change(spec).spec;
    } catch {
      // Left out.
    }
  };

  const chart =
    typeof saved.chart === "string" ? registry.get(saved.chart) : undefined;
  const style = isRecord(saved.style) ? saved.style : {};

  if (chart) {
    spec = setChart(spec, chart.id as ChartId, registry).spec;
    const kept = pruneEncoding(
      stringEntries(saved.encoding),
      chart.channels,
      data.columns,
    );
    reset.push(...kept.reset);
    for (const [channel, column] of Object.entries(kept.encoding)) {
      spec = setEncoding(spec, channel, column, registry).spec;
    }
    for (const [id, value] of Object.entries(
      isRecord(style.options) ? style.options : {},
    )) {
      attempt((s) => setOption(s, id, value as JsonValue, registry));
    }
    for (const [id, value] of Object.entries(
      isRecord(style.params) ? style.params : {},
    )) {
      if (typeof value === "number")
        attempt((s) => setParam(s, id, value, registry));
    }
    for (const [id, value] of Object.entries(
      isRecord(style.formats) ? style.formats : {},
    )) {
      attempt((s) => setFormat(s, formatPatch(value), id, registry));
    }
  }

  const aggregate = AGGREGATIONS.find((a) => a === saved.aggregate);
  if (aggregate) spec = setAggregate(spec, aggregate).spec;

  // One key at a time, so a bad one doesn't take the others with it.
  for (const key of ["pillar", "width", "height", "margin"] as const) {
    if (key in style)
      attempt((s) => setStyle(s, { [key]: style[key] } as StylePatch));
  }
  attempt((s) => setFormat(s, formatPatch(style.format), undefined, registry));

  return { spec, reset };
}
