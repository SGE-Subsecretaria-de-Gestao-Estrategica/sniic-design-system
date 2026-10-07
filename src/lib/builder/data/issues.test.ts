import { describe, expect, it } from "vitest";
import { cellFails, columnIssues, describeIssues } from "./issues";
import type { Table } from "./types";

const table = (columns: string[], ...rows: string[][]): Table => ({
  columns,
  rows: rows.map((cells) =>
    Object.fromEntries(columns.map((c, i) => [c, cells[i]])),
  ),
});

describe("cellFails", () => {
  it("flags filled cells that don't read under the column's type", () => {
    const total = { name: "total", type: "number" } as const;
    expect(cellFails("n/d", total, ",")).toBe(true);
    expect(cellFails("1.234,5", total, ",")).toBe(false);
    expect(cellFails("  ", total, ",")).toBe(false);
    expect(cellFails(undefined, total, ",")).toBe(false);
    expect(cellFails("x", { name: "uf", type: "text" }, ",")).toBe(false);
  });
});

describe("columnIssues", () => {
  it("counts failed cells with distinct examples", () => {
    const t = table(
      ["uf", "total"],
      ["SP", "1.234"],
      ["RJ", "n/d"],
      ["MG", "–"],
      ["ES", ""],
      ["BA", "n/d"],
    );
    const issues = columnIssues(
      t,
      [
        { name: "uf", type: "text" },
        { name: "total", type: "number" },
      ],
      ",",
    );
    expect(issues).toEqual({
      uf: { failed: 0, examples: [] },
      total: { failed: 3, examples: ["n/d", "–"] },
    });
  });
});

describe("describeIssues", () => {
  it("pluralizes and quotes examples", () => {
    expect(describeIssues("number", 1, ["n/d"])).toBe(
      "1 valor não numérico: “n/d”",
    );
    expect(describeIssues("date", 1200, ["x", "y"])).toBe(
      "1.200 valores que não são datas: “x”, “y”",
    );
    expect(describeIssues("text", 3, ["x"])).toBe("");
    expect(describeIssues("number", 0, [])).toBe("");
  });
});
