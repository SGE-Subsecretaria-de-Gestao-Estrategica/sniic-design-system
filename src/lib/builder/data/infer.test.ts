import { describe, expect, it } from "vitest";
import { columnAs, detectDecimal, guessDatePattern, inferColumn, inferSchema } from "./infer";
import type { Table } from "./types";

const table = (columns: string[], ...rows: string[][]): Table => ({
  columns,
  rows: rows.map((cells) => Object.fromEntries(columns.map((c, i) => [c, cells[i]]))),
});

describe("detectDecimal", () => {
  it("prefers the separator under which more cells parse", () => {
    expect(detectDecimal(table(["v"], ["1,5"], ["2.345,6"]))).toBe(",");
    expect(detectDecimal(table(["v"], ["1.5"], ["2,345.6"]))).toBe(".");
  });

  it("goes with , when both read the cells", () => {
    expect(detectDecimal(table(["v"], ["10"], ["1.234"]))).toBe(",");
  });
});

describe("inferColumn", () => {
  it("types numbers, dates and text", () => {
    expect(inferColumn("v", ["1.234,5", "10"], ",")).toEqual({ name: "v", type: "number" });
    expect(inferColumn("d", ["15/03/2023", "01/12/2022"], ",")).toEqual({
      name: "d",
      type: "date",
      datePattern: "dd/mm/yyyy",
    });
    expect(inferColumn("m", ["2023-03", "x"], ",")).toEqual({ name: "m", type: "text" });
    expect(inferColumn("e", [], ",")).toEqual({ name: "e", type: "text" });
  });

  it("keeps codes with leading zeros as text", () => {
    expect(inferColumn("cod", ["0350102", "3550308"], ",")).toEqual({ name: "cod", type: "text" });
    expect(inferColumn("v", ["0,5", "0", "10"], ",").type).toBe("number");
  });

  it("treats years as numbers", () => {
    expect(inferColumn("ano", ["2019", "2020"], ",")).toEqual({ name: "ano", type: "number" });
  });

  it("tolerates a few bad cells", () => {
    const values = [...Array(9).fill("10"), "n/d"];
    expect(inferColumn("v", values, ",").type).toBe("number");
    expect(inferColumn("v", [...values.slice(0, 8), "n/d", "–"], ",").type).toBe("text");
  });
});

describe("guessDatePattern / columnAs", () => {
  it("guesses the pattern most cells match", () => {
    expect(guessDatePattern(["2023-03-15"])).toBe("yyyy-mm-dd");
    expect(guessDatePattern(["2019", "2020"])).toBe("yyyy");
    expect(guessDatePattern(["abc"])).toBe("dd/mm/yyyy");
  });

  it("columnAs adds a pattern only for dates", () => {
    const t = table(["ano"], ["2019"]);
    expect(columnAs(t, "ano", "date")).toEqual({ name: "ano", type: "date", datePattern: "yyyy" });
    expect(columnAs(t, "ano", "text")).toEqual({ name: "ano", type: "text" });
  });
});

describe("inferSchema", () => {
  it("infers each column", () => {
    const t = table(["uf", "total"], ["SP", "1.234"], ["RJ", "n/d"], ["MG", "–"]);
    expect(inferSchema(t, ",")).toEqual([
      { name: "uf", type: "text" },
      { name: "total", type: "text" },
    ]);
  });
});
