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
import { createSpec, setData } from "../spec/spec";
import type { ChartSpec, DataSpec, ResetNotice, SpecChange } from "../spec/types";

type Source = { text: string; encoding: FileEncoding };

/**
 * The wizard's state: the spec plus the file it was read from. The table,
 * coerced rows and per-column issues follow the spec on their own.
 */
export class BuilderState {
  spec = $state<ChartSpec>(createSpec());
  source = $state<Source | null>(null);
  /** Why the last file couldn't be loaded. */
  error = $state<string | null>(null);
  /** Mappings the last change cleared. */
  reset = $state<ResetNotice[]>([]);

  // Narrow deriveds: a style or chart change keeps `spec.data` as is, so the
  // file isn't reparsed and rows aren't re-coerced.
  readonly #delimiter = $derived(this.spec.data.delimiter);
  readonly #data = $derived(this.spec.data);

  readonly table: Table | null = $derived(
    this.source ? parseTable(this.source.text, this.#delimiter) : null,
  );
  readonly rows = $derived(this.table ? coerceData(this.table.rows, this.#data) : []);
  readonly issues = $derived(
    this.table ? columnIssues(this.table, this.#data.columns, this.#data.decimal) : {},
  );

  /** Columns whose type the user picked; re-detection leaves them alone. */
  #manual = new Set<string>();
  /** Only the latest `loadFile` call may apply its result. */
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
    this.#setData({
      fileName: result.fileName,
      delimiter,
      decimal,
      columns: inferSchema(table, decimal),
    });
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

  #setData(data: DataSpec) {
    this.apply(setData(this.spec, data, this.registry));
  }
}
