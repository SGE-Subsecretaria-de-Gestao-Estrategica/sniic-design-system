import type { Accessor } from "$lib/types/Accessor";
import type { XValue } from "$lib/core/layouts/types";
import type {
  CellValue,
  ColumnSchema,
  ColumnType,
  Row,
  ValueOf,
} from "../data/types";
import type { Encoding } from "../spec/types";

export class MissingValueError extends Error {
  constructor(readonly column: string) {
    super(`Valor ausente na coluna "${column}".`);
    this.name = "MissingValueError";
  }
}

export function readCell(row: Row, column: string): CellValue {
  return row[column] ?? null;
}

const isOfType: { [T in ColumnType]: (v: CellValue) => v is ValueOf<T> } = {
  number: (v): v is number => typeof v === "number",
  date: (v): v is Date => v instanceof Date,
  text: (v): v is string => typeof v === "string",
};

export function columnAccessor<T extends ColumnType>(
  column: string,
  type: T,
): Accessor<Row, ValueOf<T>> {
  const check = isOfType[type];
  return (row) => {
    const value = readCell(row, column);
    if (!check(value)) throw new MissingValueError(column);
    return value;
  };
}

export type ChannelReader = {
  has(channel: string): boolean;
  columns(channel: string): string[];
  text(channel: string): Accessor<Row, string>;
  number(channel: string): Accessor<Row, number>;
  date(channel: string): Accessor<Row, Date>;
  x(channel: string): Accessor<Row, XValue>;
};

export function createChannelReader(
  encoding: Encoding,
  columns: readonly ColumnSchema[],
): ChannelReader {
  const schema = new Map(columns.map((c) => [c.name, c]));

  const single = (channel: string): ColumnSchema => {
    const mapped = encoding[channel] ?? [];
    if (mapped.length !== 1) {
      throw new Error(`Channel "${channel}" needs exactly one column (has ${mapped.length}).`);
    }
    const column = schema.get(mapped[0]);
    if (!column) throw new Error(`Column "${mapped[0]}" is not in the schema.`);
    return column;
  };

  const typed = <T extends ColumnType>(channel: string, type: T) => {
    const column = single(channel);
    if (column.type !== type) {
      throw new Error(
        `Channel "${channel}" reads "${column.name}" as ${type}, but it is ${column.type}.`,
      );
    }
    return columnAccessor(column.name, type);
  };

  return {
    has: (channel) => (encoding[channel]?.length ?? 0) > 0,
    columns: (channel) => [...(encoding[channel] ?? [])],
    text: (channel) => typed(channel, "text"),
    number: (channel) => typed(channel, "number"),
    date: (channel) => typed(channel, "date"),
    x: (channel) => {
      const column = single(channel);
      if (column.type === "text") {
        throw new Error(`Channel "${channel}" needs numbers or dates; "${column.name}" is text.`);
      }
      return columnAccessor(column.name, column.type);
    },
  };
}

/** Drops rows with a missing value in any of `columns`. */
export function dropIncomplete(
  rows: readonly Row[],
  columns: readonly string[],
): { rows: Row[]; dropped: number } {
  const complete = rows.filter((row) => columns.every((c) => readCell(row, c) !== null));
  return { rows: complete, dropped: rows.length - complete.length };
}
