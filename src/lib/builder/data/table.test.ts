import { describe, expect, it } from "vitest";
import { detectDelimiter, parseTable, uniqueHeaders } from "./table";

describe("detectDelimiter", () => {
  it("picks the separator with a consistent column count", () => {
    expect(detectDelimiter("uf;total\nSP;1,5\nRJ;2,5")).toBe(";");
    expect(detectDelimiter("uf,total\nSP,1.5\nRJ,2.5")).toBe(",");
    expect(detectDelimiter("uf\ttotal\nSP\t1,5")).toBe("\t");
    expect(detectDelimiter("uf|total\nSP|1,5")).toBe("|");
  });

  it("ignores separators inside quotes", () => {
    expect(detectDelimiter('nome,valor\n"Silva; Souza",10\n"Lima; Reis",20')).toBe(",");
  });

  it("falls back to ; when nothing splits the lines", () => {
    expect(detectDelimiter("só uma coluna\noutra linha")).toBe(";");
  });
});

describe("uniqueHeaders", () => {
  it("names empty headers and numbers duplicates", () => {
    expect(uniqueHeaders(["uf", "", "total", "total", " uf "])).toEqual([
      "uf",
      "Coluna 2",
      "total",
      "total (2)",
      "uf (2)",
    ]);
  });
});

describe("uniqueHeaders collisions", () => {
  it("never repeats a name, even when a header already looks numbered", () => {
    expect(uniqueHeaders(["a", "a (2)", "a"])).toEqual(["a", "a (2)", "a (3)"]);
  });
});

describe("parseTable", () => {
  it("uses the first row as header and skips blank lines", () => {
    expect(parseTable("uf;total\n\nSP;10\nRJ\n;\n", ";")).toEqual({
      columns: ["uf", "total"],
      rows: [
        { uf: "SP", total: "10" },
        { uf: "RJ", total: undefined },
      ],
    });
  });

  it("returns an empty table for blank text", () => {
    expect(parseTable("\n \n", ";")).toEqual({ columns: [], rows: [] });
  });
});
