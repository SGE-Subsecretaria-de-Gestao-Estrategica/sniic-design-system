import { describe, expect, it } from "vitest";
import type { Row } from "../data/types";
import { aggregateRows } from "./aggregate";

const rows: Row[] = [
  { uf: "SP", ano: new Date(2020, 0, 1), v: 1, nota: "a" },
  { uf: "SP", ano: new Date(2020, 0, 1), v: 3, nota: "b" },
  { uf: "SP", ano: new Date(2021, 0, 1), v: 5, nota: "c" },
  { uf: "RJ", ano: new Date(2020, 0, 1), v: 7, nota: "d" },
];

describe("aggregateRows", () => {
  it("returns the rows untouched when no key repeats or there are no keys", () => {
    expect(aggregateRows(rows, [], ["v"], "sum")).toEqual({
      rows,
      combined: 0,
    });
    expect(aggregateRows(rows, ["uf", "ano", "nota"], ["v"], "sum")).toEqual({
      rows,
      combined: 0,
    });
  });

  it("combines rows by all keys, dates included, keeping the first row's other columns", () => {
    const result = aggregateRows(rows, ["uf", "ano"], ["v"], "sum");
    expect(result.combined).toBe(1);
    expect(result.rows).toEqual([
      { uf: "SP", ano: new Date(2020, 0, 1), v: 4, nota: "a" },
      rows[2],
      rows[3],
    ]);
  });

  it("supports mean, count and first", () => {
    const value = (how: "mean" | "count" | "first") =>
      aggregateRows(rows, ["uf"], ["v"], how).rows[0].v;
    expect(value("mean")).toBe(3);
    expect(value("count")).toBe(3);
    expect(value("first")).toBe(1);
  });
});
