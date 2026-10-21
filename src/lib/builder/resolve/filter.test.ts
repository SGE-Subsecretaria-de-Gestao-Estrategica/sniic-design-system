import { describe, expect, it } from "vitest";
import { coerceRows } from "../data/coerce";
import type { ColumnSchema } from "../data/types";
import { defaultRegistry } from "../registry";
import {
  createSpec,
  setChart,
  setData,
  setEncoding,
  setFilters,
} from "../spec/spec";
import { filterRows, filterValues } from "./filter";
import { resolveChart } from "./resolveChart";

const columns: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "uf", type: "uf" },
  { name: "total", type: "number" },
];
const rows = coerceRows(
  [
    { dominio: "Música", uf: "SP", total: "10" },
    { dominio: "Teatro", uf: "SP", total: "20" },
    { dominio: "Música", uf: "RJ", total: "30" },
    { dominio: "", uf: "RJ", total: "40" },
  ],
  columns,
  ",",
);

describe("filterRows", () => {
  it("keeps everything without filters, or with nothing excluded", () => {
    expect(filterRows(rows, []).filtered).toBe(0);
    expect(filterRows(rows, [{ column: "uf", exclude: [] }]).rows).toHaveLength(4);
  });

  it("leaves out the excluded values, every filter applying", () => {
    const one = filterRows(rows, [{ column: "uf", exclude: ["RJ"] }]);
    expect(one.rows.map((r) => r.dominio)).toEqual(["Música", "Teatro"]);
    expect(one.filtered).toBe(2);
    const both = filterRows(rows, [
      { column: "uf", exclude: ["RJ"] },
      { column: "dominio", exclude: ["Teatro"] },
    ]);
    expect(both.rows.map((r) => r.total)).toEqual([10]);
  });

  it("treats an empty cell as the value ''", () => {
    expect(filterValues(rows, "dominio")).toEqual(["Música", "Teatro", ""]);
    const kept = filterRows(rows, [{ column: "dominio", exclude: [""] }]);
    expect(kept.rows).toHaveLength(3);
  });
});

describe("resolveChart with filters", () => {
  function bars() {
    let spec = setData(
      createSpec(),
      { ...createSpec().data, columns },
      defaultRegistry,
    ).spec;
    spec = setChart(spec, "horizontalBars", defaultRegistry).spec;
    spec = setEncoding(spec, "category", "dominio", defaultRegistry).spec;
    return setEncoding(spec, "value", "total", defaultRegistry).spec;
  }

  it("builds the chart from the rows the filters keep", () => {
    const spec = setFilters(bars(), [{ column: "uf", exclude: ["RJ"] }]).spec;
    const result = resolveChart(spec, rows, defaultRegistry);
    if (result.status !== "ready" || result.view.chart !== "horizontalBars")
      throw new Error();
    expect(result.filtered).toBe(2);
    expect(result.view.layout.bars.map((b) => b.value).sort()).toEqual([
      10, 20,
    ]);
  });

  it("is an error when the filters leave no row", () => {
    const spec = setFilters(bars(), [
      { column: "uf", exclude: ["SP", "RJ"] },
    ]).spec;
    expect(resolveChart(spec, rows, defaultRegistry)).toMatchObject({
      status: "error",
      step: "mapping",
    });
  });
});
