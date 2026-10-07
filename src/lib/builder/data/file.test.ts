import { describe, expect, it } from "vitest";
import { decodeBytes, MAX_FILE_BYTES, readCsvFile } from "./file";

const latin1 = (text: string) =>
  Uint8Array.from(text, (c) => c.charCodeAt(0)).buffer;

describe("decodeBytes", () => {
  it("reads UTF-8 and strips the BOM", () => {
    const bytes = new TextEncoder().encode("﻿domínio;total").buffer;
    expect(decodeBytes(bytes)).toEqual({
      text: "domínio;total",
      encoding: "utf-8",
    });
  });

  it("falls back to Windows-1252 when the bytes aren't UTF-8", () => {
    expect(decodeBytes(latin1("Música;Ação"))).toEqual({
      text: "Música;Ação",
      encoding: "windows-1252",
    });
  });
});

describe("readCsvFile", () => {
  it("reads a CSV file", async () => {
    const result = await readCsvFile(new File(["a;b\n1;2"], "dados.csv"));
    expect(result).toEqual({
      ok: true,
      fileName: "dados.csv",
      text: "a;b\n1;2",
      encoding: "utf-8",
    });
  });

  it("rejects other extensions, empty files and files over the limit", async () => {
    expect(await readCsvFile(new File(["x"], "dados.xlsx"))).toMatchObject({
      ok: false,
      error: /\.csv/,
    });
    expect(await readCsvFile(new File([" \n "], "dados.csv"))).toMatchObject({
      ok: false,
      error: /vazio/,
    });
    const big = new File([new Uint8Array(MAX_FILE_BYTES + 1)], "dados.csv");
    expect(await readCsvFile(big)).toMatchObject({
      ok: false,
      error: /limite/,
    });
  });
});
