import { describe, expect, it } from "vitest";
import {
  coerceCell,
  coerceData,
  coerceRows,
  parseDate,
  parseNumber,
} from "./coerce";

describe("parseNumber", () => {
  it("reads pt-BR numbers with a comma decimal", () => {
    expect(parseNumber("1.234,5", ",")).toBe(1234.5);
    expect(parseNumber("1.234.567", ",")).toBe(1234567);
    expect(parseNumber("-0,25", ",")).toBe(-0.25);
    expect(parseNumber("−3", ",")).toBe(-3);
    expect(parseNumber(" 12 345,6 ", ",")).toBe(12345.6);
  });

  it("reads point-decimal numbers", () => {
    expect(parseNumber("1,234.5", ".")).toBe(1234.5);
    expect(parseNumber("0.5", ".")).toBe(0.5);
  });

  it("returns null for empty or unparsable input", () => {
    for (const raw of [undefined, null, "", "  ", "n/d", "–", "12%", "1,2,3"]) {
      expect(parseNumber(raw, ",")).toBeNull();
    }
    // thousands separator after the decimal one
    expect(parseNumber("1,234.5", ",")).toBeNull();
  });

  it("accepts the thousands separator only in groups of three", () => {
    expect(parseNumber("12.34", ",")).toBeNull();
    expect(parseNumber("1.2.3", ",")).toBeNull();
    expect(parseNumber("1234.567", ",")).toBeNull();
    expect(parseNumber("12,34", ".")).toBeNull();
    expect(parseNumber("-12.345.678,9", ",")).toBe(-12345678.9);
    expect(parseNumber("1234", ",")).toBe(1234);
  });
});

describe("parseDate", () => {
  it("parses each pattern as a local date", () => {
    expect(parseDate("2023", "yyyy")).toEqual(new Date(2023, 0, 1));
    expect(parseDate("3/2023", "mm/yyyy")).toEqual(new Date(2023, 2, 1));
    expect(parseDate("15/03/2023", "dd/mm/yyyy")).toEqual(
      new Date(2023, 2, 15),
    );
    expect(parseDate("2023-03-15", "yyyy-mm-dd")).toEqual(
      new Date(2023, 2, 15),
    );
  });

  it("rejects the wrong shape and impossible dates", () => {
    expect(parseDate("2023-03-15", "dd/mm/yyyy")).toBeNull();
    expect(parseDate("31/02/2023", "dd/mm/yyyy")).toBeNull();
    expect(parseDate("13/2023", "mm/yyyy")).toBeNull();
    expect(parseDate("", "yyyy")).toBeNull();
  });
});

describe("coerceCell / coerceRows", () => {
  it("trims text and turns empty cells into null", () => {
    const text = { name: "uf", type: "text" } as const;
    expect(coerceCell("  SP ", text, ",")).toBe("SP");
    expect(coerceCell("  ", text, ",")).toBeNull();
  });

  it("throws for a date column without a pattern", () => {
    expect(() =>
      coerceCell("2023", { name: "ano", type: "date" }, ","),
    ).toThrow(/datePattern/);
  });

  it("coerces every schema column and drops the rest", () => {
    const rows = coerceRows(
      [{ uf: "SP", total: "1.234", ano: "2023", extra: "x" }],
      [
        { name: "uf", type: "text" },
        { name: "total", type: "number" },
        { name: "ano", type: "date", datePattern: "yyyy" },
      ],
      ",",
    );
    expect(rows).toEqual([
      { uf: "SP", total: 1234, ano: new Date(2023, 0, 1) },
    ]);
  });
});

describe("coerceData", () => {
  it("coerces with the spec's columns and decimal", () => {
    const data = {
      columns: [{ name: "v", type: "number" as const }],
      decimal: "." as const,
    };
    expect(coerceData([{ v: "1,234.5" }], data)).toEqual([{ v: 1234.5 }]);
  });
});
