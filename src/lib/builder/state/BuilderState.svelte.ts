import { coerceData } from "../data/coerce";
import { readCsvFile } from "../data/file";
import { columnAs, detectDecimal, inferColumn, inferSchema } from "../data/infer";
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
import type { ChartRegistry } from "../registry/types";
import type { ChartId } from "../registry/layouts";
import { resolveChart } from "../resolve/resolveChart";
import { autoEncode, createSpec, setChart, setData, setEncoding, setStyle } from "../spec/spec";
import type { ChartSpec, DataSpec, ResetNotice, SpecChange } from "../spec/types";
import { blockingReason, canEnter, STEPS, stepStatuses, type StepId } from "./steps";

type Source = { text: string; encoding: FileEncoding };


function chain(change: SpecChange, next: (spec: ChartSpec) => SpecChange): SpecChange {
  const after = next(change.spec);
  return { spec: after.spec, reset: [...change.reset, ...after.reset] };
}

export class BuilderState {
  spec = $state<ChartSpec>(createSpec());
  source = $state<Source | null>(null);
  error = $state<string | null>(null);
  reset = $state<ResetNotice[]>([]);


  readonly #delimiter = $derived(this.spec.data.delimiter);
  readonly #data = $derived(this.spec.data);

  readonly table: Table | null = $derived(
    this.source ? parseTable(this.source.text, this.#delimiter) : null,
  );
  readonly rows = $derived(this.table ? coerceData(this.table.rows, this.#data) : []);
  readonly issues = $derived(
    this.table ? columnIssues(this.table, this.#data.columns, this.#data.decimal) : {},
  );

  // The layout follows only what shapes it; a pillar change doesn't rebuild it.
  readonly #chart = $derived(this.spec.chart);
  readonly #encoding = $derived(this.spec.encoding);
  readonly #width = $derived(this.spec.style.width);
  readonly #height = $derived(this.spec.style.height);
  readonly #options = $derived(this.spec.style.options);

  readonly resolution = $derived.by(() =>
    resolveChart(
      {
        data: this.#data,
        chart: this.#chart,
        encoding: this.#encoding,
        style: { width: this.#width, height: this.#height, options: this.#options },
      },
      this.rows,
      this.registry,
    ),
  );
  readonly steps = $derived(
    stepStatuses({ table: this.table, chart: this.#chart, resolution: this.resolution }),
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
    const delimiter = detectDelimiter(result.text);
    const table = parseTable(result.text, delimiter);
    if (!table.rows.length) {
      this.error = "O arquivo não tem linhas de dados.";
      return;
    }
    const decimal = detectDecimal(table);

    this.error = null;
    this.#manual.clear();
    this.source = { text: result.text, encoding: result.encoding };
    this.#setData(
      { fileName: result.fileName, delimiter, decimal, columns: inferSchema(table, decimal) },
      { autoFill: true },
    );
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
    this.#setData({ ...this.spec.data, decimal, columns: this.#reinfer(this.table, decimal) });
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
    this.apply(chain(setChart(this.spec, chartId, this.registry), (spec) => autoEncode(spec, this.registry)));
  }

  setEncoding(channelId: string, columns: readonly string[]) {
    this.apply(setEncoding(this.spec, channelId, columns, this.registry));
  }

  setPillar(pillar: number) {
    this.apply(setStyle(this.spec, { pillar }));
  }

  /** `null` or an unreadable number = the chart's default size. `setStyle` clamps the rest. */
  setSize(axis: "width" | "height", size: number | null) {
    const value = size !== null && Number.isFinite(size) && size > 0 ? size : null;
    this.apply(setStyle(this.spec, { [axis]: value }));
  }

  #reinfer(table: Table, decimal: DecimalSeparator): ColumnSchema[] {
    const current = new Map(this.spec.data.columns.map((c) => [c.name, c]));
    return table.columns.map((name) => {
      const kept = current.get(name);
      if (kept && this.#manual.has(name)) return kept;
      const values = table.rows.map((r) => r[name]?.trim() ?? "").filter(Boolean);
      return inferColumn(name, values, decimal);
    });
  }

  #replaceColumn(column: ColumnSchema) {
    const columns = this.spec.data.columns.map((c) => (c.name === column.name ? column : c));
    this.#setData({ ...this.spec.data, columns });
  }

  // Auto-fill runs for a new file (and on chart pick), not for separator or
  // type edits: a cleared mapping stays cleared instead of swapping columns.
  #setData(data: DataSpec, { autoFill = false } = {}) {
    const change = setData(this.spec, data, this.registry);
    this.apply(autoFill ? chain(change, (spec) => autoEncode(spec, this.registry)) : change);
  }
}
