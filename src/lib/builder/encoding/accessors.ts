import type { Accessor } from "$lib/types/Accessor";
import type { XValue } from "$lib/core/layouts/types";
import type {
  CellValue,
  ColumnSchema,
  ColumnType,
  Row,
  ValueOf,
} from "../data/types";
import { parseUf } from "../data/uf";
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
  uf: (v): v is string => typeof v === "string",
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
  /** Any text column, a UF column included (as written in the file). */
  text(channel: string): Accessor<Row, string>;
  /** A UF column, as the state's sigla. */
  uf(channel: string): Accessor<Row, string>;
  number(channel: string): Accessor<Row, number>;
  x(channel: string): Accessor<Row, XValue>;
};

export function createChannelReader(
  encoding: Encoding,
  columns: readonly ColumnSchema[],
): ChannelReader {
  const schema = new Map(columns.map((c) => [c.name, c]));

  const single = (channel: string): ColumnSchema => {
    const name = encoding[channel];
    if (!name) throw new Error(`Channel "${channel}" has no column.`);
    const column = schema.get(name);
    if (!column) throw new Error(`Column "${name}" is not in the schema.`);
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
    has: (channel) => !!encoding[channel],
    text: (channel) =>
      typed(channel, single(channel).type === "uf" ? "uf" : "text"),
    uf: (channel) => {
      const read = typed(channel, "uf");
      return (row) => {
        const code = parseUf(read(row));
        if (!code) throw new MissingValueError(single(channel).name);
        return code;
      };
    },
    number: (channel) => typed(channel, "number"),
    x: (channel) => {
      const column = single(channel);
      if (column.type === "text" || column.type === "uf") {
        throw new Error(
          `Channel "${channel}" needs numbers or dates; "${column.name}" is text.`,
        );
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
  const complete = rows.filter((row) =>
    columns.every((c) => readCell(row, c) !== null),
  );
  return { rows: complete, dropped: rows.length - complete.length };
}
