/** `uf`: text that names a Brazilian state (sigla, name or IBGE code). */
export type ColumnType = "number" | "date" | "text" | "uf";

export type DatePattern = "yyyy" | "mm/yyyy" | "dd/mm/yyyy" | "yyyy-mm-dd";

export type FieldSeparator = ";" | "," | "\t" | "|";
export type DecimalSeparator = "," | ".";

export type ColumnSchema = {
  name: string;
  type: ColumnType;
  datePattern?: DatePattern;
};

export type CellValue = number | Date | string | null;

export type RawRow = Record<string, string | undefined>;
export type Row = Record<string, CellValue>;

export type ValueOf<T extends ColumnType> = T extends "number"
  ? number
  : T extends "date"
    ? Date
    : string;

export type FileEncoding = "utf-8" | "windows-1252";

export type Table = {
  columns: string[];
  rows: RawRow[];
};

export type ColumnIssues = {
  failed: number;
  examples: string[];
};
