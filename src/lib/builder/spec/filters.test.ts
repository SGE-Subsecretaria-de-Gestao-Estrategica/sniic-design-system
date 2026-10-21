import { describe, expect, it } from "vitest";
import type { ColumnSchema } from "../data/types";
import { defaultRegistry } from "../registry";
import { readSavedChart, restoreSpec, saveChart } from "./saved";
import { createSpec, pruneFilters, setData, setFilters } from "./spec";
import type { DataSpec } from "./types";

const COLUMNS: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "uf", type: "uf" },
  { name: "total", type: "number" },
];
const dataOf = (columns: ColumnSchema[]): DataSpec => ({
  fileName: "dados.csv",
  delimiter: ";",
  decimal: ",",
  columns,
});
const withData = () =>
  setData(createSpec(), dataOf(COLUMNS), defaultRegistry).spec;

describe("setFilters", () => {
  it("starts empty and stores text and UF filters", () => {
    expect(createSpec().filters).toEqual([]);
    const { spec } = setFilters(withData(), [
      { column: "uf", exclude: ["RJ", "RJ"] },
      { column: "dominio", exclude: [] },
    ]);
    expect(spec.filters).toEqual([
      { column: "uf", exclude: ["RJ"] },
      { column: "dominio", exclude: [] },
    ]);
  });

  it("refuses numbers, unknown columns and a column filtered twice", () => {
    expect(() =>
      setFilters(withData(), [{ column: "total", exclude: [] }]),
    ).toThrow();
    expect(() =>
      setFilters(withData(), [{ column: "nada", exclude: [] }]),
    ).toThrow();
    expect(() =>
      setFilters(withData(), [
        { column: "uf", exclude: [] },
        { column: "uf", exclude: ["SP"] },
      ]),
    ).toThrow();
  });

  it("drops the filters whose column is gone or no longer categorical", () => {
    const spec = setFilters(withData(), [
      { column: "uf", exclude: ["RJ"] },
      { column: "dominio", exclude: ["Música"] },
    ]).spec;
    const columns: ColumnSchema[] = [
      { name: "dominio", type: "number" },
      { name: "total", type: "number" },
    ];
    expect(pruneFilters(spec.filters, columns)).toEqual([]);
    const next = setData(spec, dataOf(columns), defaultRegistry).spec;
    expect(next.filters).toEqual([]);
  });
});

describe("saved filters", () => {
  it("come back, the ones that no longer fit left out", () => {
    const spec = setFilters(withData(), [
      { column: "uf", exclude: ["RJ"] },
      { column: "dominio", exclude: ["Música"] },
    ]).spec;
    const saved = readSavedChart(saveChart(spec));
    if (!saved.ok) throw new Error();
    expect(
      restoreSpec(saved.saved.spec, dataOf(COLUMNS), defaultRegistry).spec
        .filters,
    ).toEqual(spec.filters);
    const fewer = dataOf([COLUMNS[1], COLUMNS[2]]);
    expect(
      restoreSpec(saved.saved.spec, fewer, defaultRegistry).spec.filters,
    ).toEqual([{ column: "uf", exclude: ["RJ"] }]);
  });

  it("are empty in a chart saved before filters existed", () => {
    const { filters: _, ...old } = withData();
    expect(restoreSpec(old, dataOf(COLUMNS), defaultRegistry).spec.filters).toEqual([]);
  });
});
