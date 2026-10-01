import { describe, expect, it } from "vitest";
import type { ColumnSchema, Row } from "../data/types";
import {
  MissingValueError,
  columnAccessor,
  createChannelReader,
  dropIncomplete,
  readCell,
} from "./accessors";

const columns: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "total", type: "number" },
  { name: "ano", type: "date", datePattern: "yyyy" },
];
const row: Row = { dominio: "Música", total: 10, ano: new Date(2020, 0, 1) };

describe("readCell / columnAccessor", () => {
  it("reads null for absent cells", () => {
    expect(readCell(row, "nope")).toBeNull();
  });

  it("returns typed values and throws on missing ones", () => {
    expect(columnAccessor("total", "number")(row)).toBe(10);
    expect(() => columnAccessor("total", "number")({ total: null })).toThrow(MissingValueError);
  });
});

describe("createChannelReader", () => {
  const read = createChannelReader({ category: ["dominio"], value: ["total"], x: ["ano"] }, columns);

  it("builds accessors by channel", () => {
    expect(read.text("category")(row)).toBe("Música");
    expect(read.number("value")(row)).toBe(10);
    expect(read.x("x")(row)).toEqual(new Date(2020, 0, 1));
    expect(read.has("value")).toBe(true);
    expect(read.has("group")).toBe(false);
    expect(read.columns("value")).toEqual(["total"]);
  });

  it("refuses a channel read with the wrong type", () => {
    expect(() => read.number("category")).toThrow(/is text/);
    expect(() => read.x("category")).toThrow(/numbers or dates/);
  });

  it("refuses unmapped or multi-column channels for single reads", () => {
    expect(() => read.text("group")).toThrow(/exactly one column/);
    const multi = createChannelReader({ series: ["total", "total"] }, columns);
    expect(() => multi.number("series")).toThrow(/exactly one column/);
  });
});

describe("dropIncomplete", () => {
  it("drops rows with a missing value in the given columns", () => {
    const rows: Row[] = [row, { dominio: null, total: 3 }, { dominio: "Teatro", total: null }];
    expect(dropIncomplete(rows, ["dominio"])).toEqual({ rows: [row, rows[2]], dropped: 1 });
    expect(dropIncomplete(rows, ["dominio", "total"]).dropped).toBe(2);
  });
});
