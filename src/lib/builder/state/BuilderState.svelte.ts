import { coerceData } from "../data/coerce";
import { MAX_FILE_BYTES, readCsvFile } from "../data/file";
import {
  columnAs,
  detectDecimal,
  inferColumn,
  inferSchema,
  yearLikeColumns,
} from "../data/infer";
import { columnIssues } from "../data/issues";
import { detectDelimiter, parseTable } from "../data/table";
import type {
  ColumnSchema,
  ColumnType,
  DatePattern,
  DecimalSeparator,
  FieldSeparator,
  FileEncoding,
  Table,
} from "../data/types";
import { defaultRegistry } from "../registry";
import type { MarginPresetId } from "../registry/margins";
import { layoutOptions } from "../registry/options";
import type { ChartRegistry } from "../registry/types";
import type { ChartId } from "../registry/layouts";
import { resolveChart } from "../resolve/resolveChart";
import {
  readSavedChart,
  restoreSpec,
  SAVED_CHART_EXTENSION,
  saveChart,
  savedColumns,
  savedFileName,
  savedSeparators,
} from "../spec/saved";
import {
  autoEncode,
  createSpec,
  setAggregate,
  setChart,
  setData,
  setEncoding,
  setFormat,
  setOption,
  setParam,
  setStyle,
} from "../spec/spec";
import type {
  Aggregation,
  ChartSpec,
  DataSpec,
  JsonValue,
  NumberFormat,
  ResetNotice,
  SpecChange,
} from "../spec/types";
import {
  blockingReason,
  canEnter,
  STEPS,
  stepStatuses,
  type StepId,
} from "./steps";

type Source = { text: string; encoding: FileEncoding };
type SavedSpec = Record<string, unknown>;

// A saved chart may carry its data: twice the CSV limit leaves room for both.
const MAX_SAVED_BYTES = 2 * MAX_FILE_BYTES;

function chain(
  change: SpecChange,
  next: (spec: ChartSpec) => SpecChange,
): SpecChange {
  const after = next(change.spec);
  return { spec: after.spec, reset: [...change.reset, ...after.reset] };
}

export class BuilderState {
  spec = $state<ChartSpec>(createSpec());
  source = $state<Source | null>(null);
  error = $state<string | null>(null);
  reset = $state<ResetNotice[]>([]);
  /** A chart opened without its data, waiting for the CSV. */
  pending = $state<{ name: string; spec: SavedSpec } | null>(null);

  readonly #delimiter = $derived(this.spec.data.delimiter);
  readonly #data = $derived(this.spec.data);

  readonly table: Table | null = $derived(
    this.source ? parseTable(this.source.text, this.#delimiter) : null,
  );
  readonly rows = $derived(
    this.table ? coerceData(this.table.rows, this.#data) : [],
  );
  readonly issues = $derived(
    this.table
      ? columnIssues(this.table, this.#data.columns, this.#data.decimal)
      : {},
  );

  readonly #chart = $derived(this.spec.chart);
  readonly #encoding = $derived(this.spec.encoding);
  readonly #aggregate = $derived(this.spec.aggregate);
  readonly #width = $derived(this.spec.style.width);
  readonly #height = $derived(this.spec.style.height);
  readonly #margin = $derived(this.spec.style.margin);
  #layoutOptions: Record<string, JsonValue> = {};
  readonly #options = $derived.by(() => {
    const defs = this.#chart
      ? this.registry.get(this.#chart)?.options
      : undefined;
    const next = layoutOptions(defs, this.spec.style.options);
    if (JSON.stringify(next) !== JSON.stringify(this.#layoutOptions))
      this.#layoutOptions = next;
    return this.#layoutOptions;
  });
  readonly #params = $derived(this.spec.style.params);

  readonly resolution = $derived.by(() =>
    resolveChart(
      {
        data: this.#data,
        chart: this.#chart,
        encoding: this.#encoding,
        aggregate: this.#aggregate,
        style: {
          width: this.#width,
          height: this.#height,
          margin: this.#margin,
          options: this.#options,
          params: this.#params,
        },
      },
      this.rows,
      this.registry,
    ),
  );
  readonly steps = $derived(
    stepStatuses({
      table: this.table,
      chart: this.#chart,
      resolution: this.resolution,
    }),
  );
  step = $state<StepId>("data");

  #manual = new Set<string>();
  #loads = 0;

  constructor(readonly registry: ChartRegistry = defaultRegistry) {}

  apply(change: SpecChange) {
    this.spec = change.spec;
    this.reset = change.reset;
  }

  async loadFile(file: File) {
    const load = ++this.#loads;
    const result = await readCsvFile(file);
    if (load !== this.#loads) return;
    if (!result.ok) {
      this.error = result.error;
      return;
    }
    this.#open(
      result.text,
      result.encoding,
      result.fileName,
      this.pending?.spec,
    );
  }

  /**
   * Opens a chart saved with `save`. With its data inside, everything comes
   * back. Without, its choices go onto the CSV already loaded, or wait for
   * the next one.
   */
  async openSaved(file: File) {
    const load = ++this.#loads;
    if (!file.name.toLowerCase().endsWith(SAVED_CHART_EXTENSION)) {
      this.error = `Envie um arquivo ${SAVED_CHART_EXTENSION} salvo por este construtor.`;
      return;
    }
    if (file.size > MAX_SAVED_BYTES) {
      this.error = "O arquivo é grande demais para um gráfico salvo.";
      return;
    }
    const result = readSavedChart(await file.text());
    if (load !== this.#loads) return;
    if (!result.ok) {
      this.error = result.error;
      return;
    }
    const { spec, data } = result.saved;
    if (data !== undefined) {
      this.#open(data, "utf-8", savedFileName(spec) ?? file.name, spec);
    } else if (this.source) {
      const { text, encoding } = this.source;
      this.#open(text, encoding, this.spec.data.fileName, spec);
    } else {
      this.error = null;
      this.pending = { name: file.name, spec };
    }
  }

  /** The chart as a file's text; `withData` puts the CSV's text inside it. */
  save(withData = false): string {
    return saveChart(this.spec, withData ? this.source?.text : undefined);
  }

  #open(
    text: string,
    encoding: FileEncoding,
    fileName: string | null,
    saved?: SavedSpec,
  ) {
    const types = saved ? savedColumns(saved) : new Map<string, ColumnSchema>();
    const kept = saved ? savedSeparators(saved) : {};
    // The saved separators were checked by hand: they stand while they still find a saved column.
    const keep =
      kept.delimiter !== undefined &&
      parseTable(text, kept.delimiter).columns.some((c) => types.has(c));
    const delimiter = keep ? kept.delimiter! : detectDelimiter(text);
    const table = parseTable(text, delimiter);
    if (!table.rows.length) {
      this.error = "O arquivo não tem linhas de dados.";
      return;
    }
    const decimal = (keep && kept.decimal) || detectDecimal(table);
    const columns = inferSchema(table, decimal).map(
      (column) => types.get(column.name) ?? column,
    );

    this.error = null;
    this.pending = null;
    this.#manual = new Set(
      columns.filter((c) => types.has(c.name)).map((c) => c.name),
    );
    this.source = { text, encoding };
    const data = { fileName, delimiter, decimal, columns };
    if (saved) {
      this.apply(restoreSpec(saved, data, this.registry));
      this.step = [...STEPS].reverse().find((s) => this.canEnter(s.id))!.id;
    } else {
      this.#setData(data, table);
    }
  }

  setDelimiter(delimiter: FieldSeparator) {
    if (!this.source) return;
    const table = parseTable(this.source.text, delimiter);
    this.#setData({
      ...this.spec.data,
      delimiter,
      columns: this.#reinfer(table, this.spec.data.decimal),
    });
  }

  setDecimal(decimal: DecimalSeparator) {
    if (!this.table) return;
    this.#setData({
      ...this.spec.data,
      decimal,
      columns: this.#reinfer(this.table, decimal),
    });
  }

  setColumnType(name: string, type: ColumnType) {
    if (!this.table) return;
    this.#manual.add(name);
    this.#replaceColumn(columnAs(this.table, name, type));
  }

  setDatePattern(name: string, datePattern: DatePattern) {
    this.#manual.add(name);
    this.#replaceColumn({ name, type: "date", datePattern });
  }

  canEnter(step: StepId): boolean {
    return canEnter(this.steps, step);
  }

  /** Why `step` can't be entered yet, or `null`. */
  blocker(step: StepId): string | null {
    return blockingReason(this.steps, step);
  }

  goTo(step: StepId) {
    if (step === this.step || !this.canEnter(step)) return;
    this.step = step;
    this.reset = [];
  }

  next() {
    const following = STEPS[STEPS.findIndex((s) => s.id === this.step) + 1];
    if (following) this.goTo(following.id);
  }

  back() {
    const previous = STEPS[STEPS.findIndex((s) => s.id === this.step) - 1];
    if (previous) this.goTo(previous.id);
  }

  setChart(chartId: ChartId | null) {
    const change = chain(setChart(this.spec, chartId, this.registry), (spec) =>
      this.#autoFill(spec, this.table),
    );
    // A new chart remaps everything: only columns that ended up unused are worth a notice.
    const used = new Set(Object.values(change.spec.encoding));
    this.apply({
      ...change,
      reset: change.reset.filter((r) => !used.has(r.column)),
    });
  }

  setEncoding(channelId: string, column: string | null) {
    this.apply(setEncoding(this.spec, channelId, column, this.registry));
  }

  setAggregate(aggregate: Aggregation) {
    this.apply(setAggregate(this.spec, aggregate));
  }

  /** `undefined` restores the option's default. */
  setOption(optionId: string, value: JsonValue | undefined) {
    this.apply(setOption(this.spec, optionId, value, this.registry));
  }

  /** `null` restores the layout's default. */
  setParam(paramId: string, value: number | null) {
    this.apply(setParam(this.spec, paramId, value, this.registry));
  }

  /** `null` = the chart's default margin. */
  setMargin(margin: MarginPresetId | null) {
    this.apply(setStyle(this.spec, { margin }));
  }

  /** Patches the main format, or the chart's extra format `formatId`. */
  setFormat(patch: Partial<NumberFormat>, formatId?: string) {
    this.apply(setFormat(this.spec, patch, formatId, this.registry));
  }

  setPillar(pillar: number) {
    this.apply(setStyle(this.spec, { pillar }));
  }

  /** `null` or an unreadable number = the chart's default size. `setStyle` clamps the rest. */
  setSize(axis: "width" | "height", size: number | null) {
    const value =
      size !== null && Number.isFinite(size) && size > 0 ? size : null;
    this.apply(setStyle(this.spec, { [axis]: value }));
  }

  #reinfer(table: Table, decimal: DecimalSeparator): ColumnSchema[] {
    const current = new Map(this.spec.data.columns.map((c) => [c.name, c]));
    return table.columns.map((name) => {
      const kept = current.get(name);
      if (kept && this.#manual.has(name)) return kept;
      const values = table.rows
        .map((r) => r[name]?.trim() ?? "")
        .filter(Boolean);
      return inferColumn(name, values, decimal);
    });
  }

  #replaceColumn(column: ColumnSchema) {
    const columns = this.spec.data.columns.map((c) =>
      c.name === column.name ? column : c,
    );
    this.#setData({ ...this.spec.data, columns });
  }

  // Auto-fill runs for a new file (and on chart pick), not for separator or
  // type edits: a cleared mapping stays cleared instead of swapping columns.
  #setData(data: DataSpec, autoFillFrom?: Table) {
    const change = setData(this.spec, data, this.registry);
    this.apply(
      autoFillFrom
        ? chain(change, (spec) => this.#autoFill(spec, autoFillFrom))
        : change,
    );
  }

  #autoFill(spec: ChartSpec, table: Table | null): SpecChange {
    const { columns, decimal } = spec.data;
    const yearLike = table ? yearLikeColumns(table, columns, decimal) : [];
    return autoEncode(spec, this.registry, new Set(yearLike));
  }
}
