import { describe, expect, it } from "vitest";
import type { ColumnSchema } from "../data/types";
import { defaultRegistry } from "../registry";
import {
  readSavedChart,
  restoreSpec,
  saveChart,
  savedChartName,
  savedColumns,
  savedSeparators,
} from "./saved";
import {
  createSpec,
  setChart,
  setData,
  setEncoding,
  setOption,
  setParam,
  setStyle,
} from "./spec";
import type { ChartSpec, DataSpec } from "./types";

const COLUMNS: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "total", type: "number" },
];
const dataOf = (columns: ColumnSchema[]): DataSpec => ({
  fileName: "dados.csv",
  delimiter: ";",
  decimal: ",",
  columns,
});

function bars(): ChartSpec {
  let spec = setData(createSpec(), dataOf(COLUMNS), defaultRegistry).spec;
  spec = setChart(spec, "horizontalBars", defaultRegistry).spec;
  spec = setEncoding(spec, "category", "dominio", defaultRegistry).spec;
  spec = setEncoding(spec, "value", "total", defaultRegistry).spec;
  spec = setOption(spec, "sort", "ascending", defaultRegistry).spec;
  spec = setParam(spec, "barThickness", 20, defaultRegistry).spec;
  return setStyle(spec, {
    pillar: 6,
    width: 581.1,
    margin: "even",
    format: { ...spec.style.format, percent: true, suffix: "%" },
  }).spec;
}

const reread = (spec: ChartSpec, data?: string) => {
  const result = readSavedChart(saveChart(spec, data));
  if (!result.ok) throw new Error(result.error);
  return result.saved;
};

describe("saveChart / readSavedChart", () => {
  it("round-trips the spec, with or without the data", () => {
    expect(reread(bars())).toEqual({ spec: bars(), data: undefined });
    expect(reread(bars(), "a;b\n1;2").data).toBe("a;b\n1;2");
  });

  it("names the file after the CSV", () => {
    expect(savedChartName("vinculos 2024.csv")).toBe(
      "vinculos 2024.grafico.json",
    );
    expect(savedChartName(null)).toBe("grafico.grafico.json");
  });

  it("refuses what is not a saved chart", () => {
    const error = (text: string) => {
      const result = readSavedChart(text);
      return result.ok ? null : result.error;
    };
    expect(error("{ not json")).toMatch(/JSON válido/);
    expect(error('{"a": 1}')).toMatch(/não é um gráfico salvo/);
    expect(error('{"kind":"sniic-chart","spec":[]}')).toMatch(
      /não é um gráfico salvo/,
    );
    expect(error('{"kind":"sniic-chart","spec":{"version":99}}')).toMatch(
      /versão mais nova/,
    );
  });
});

describe("restoreSpec", () => {
  it("gives the same spec back over the same data", () => {
    const { spec } = reread(bars());
    expect(restoreSpec(spec, dataOf(COLUMNS), defaultRegistry)).toEqual({
      spec: bars(),
      reset: [],
    });
  });

  it("keeps the choices whose columns still exist and lists the others", () => {
    const updated = dataOf([
      { name: "dominio", type: "text" },
      { name: "vinculos", type: "number" },
    ]);
    const { spec, reset } = restoreSpec(
      reread(bars()).spec,
      updated,
      defaultRegistry,
    );
    expect(spec.chart).toBe("horizontalBars");
    expect(spec.encoding).toEqual({ category: "dominio" });
    expect(reset).toEqual([
      { channel: "value", column: "total", reason: "column-removed" },
    ]);
    expect(spec.style.options).toEqual({ sort: "ascending" });
    expect(spec.style.pillar).toBe(6);
    expect(spec.data).toEqual(updated);
  });

  it("notes a column that changed type", () => {
    const retyped = dataOf([
      { name: "dominio", type: "text" },
      { name: "total", type: "text" },
    ]);
    const { reset } = restoreSpec(
      reread(bars()).spec,
      retyped,
      defaultRegistry,
    );
    expect(reset).toEqual([
      { channel: "value", column: "total", reason: "type-mismatch" },
    ]);
  });

  it("leaves out whatever the file holds that no longer fits", () => {
    const tampered = {
      ...bars(),
      chart: "horizontalBars",
      aggregate: "median",
      encoding: { category: "dominio", value: 3, ghost: "total" },
      style: {
        pillar: 999,
        width: "wide",
        height: 400,
        margin: "namesRight",
        format: { decimals: 2, prefix: 7 },
        options: { sort: "ascending", unknown: true },
        params: { barThickness: 5000, unknown: 1 },
        formats: { ghost: { decimals: 1 } },
      },
    };
    const { spec, reset } = restoreSpec(
      tampered,
      dataOf(COLUMNS),
      defaultRegistry,
    );
    const fresh = createSpec();
    expect(spec.encoding).toEqual({ category: "dominio" });
    expect(reset).toEqual([
      { channel: "ghost", column: "total", reason: "channel-removed" },
    ]);
    expect(spec.aggregate).toBe(fresh.aggregate);
    expect(spec.style).toMatchObject({
      pillar: fresh.style.pillar,
      width: null,
      height: 400,
      margin: null,
      format: { ...fresh.style.format, decimals: 2 },
      options: { sort: "ascending" },
      formats: {},
    });
    expect(spec.style.params.barThickness).toBeLessThan(5000);
    expect(Object.keys(spec.style.params)).toEqual(["barThickness"]);
  });

  it("drops a chart the registry doesn't have, and keeps the rest", () => {
    const { spec, reset } = restoreSpec(
      { ...bars(), chart: "pie" },
      dataOf(COLUMNS),
      defaultRegistry,
    );
    expect(spec.chart).toBeNull();
    expect(spec.encoding).toEqual({});
    expect(reset).toEqual([]);
    expect(spec.style.pillar).toBe(6);
  });
});

describe("saved data settings", () => {
  it("reads the column types, skipping malformed ones", () => {
    const columns = savedColumns({
      data: {
        columns: [
          { name: "uf", type: "uf" },
          { name: "ano", type: "date", datePattern: "yyyy" },
          { name: "semPadrao", type: "date" },
          { name: "tipoErrado", type: "money" },
          { type: "text" },
          "texto",
        ],
      },
    });
    expect([...columns.values()]).toEqual([
      { name: "uf", type: "uf" },
      { name: "ano", type: "date", datePattern: "yyyy" },
    ]);
    expect(savedColumns({}).size).toBe(0);
  });

  it("reads the separators the builder knows", () => {
    expect(
      savedSeparators({ data: { delimiter: "\t", decimal: "," } }),
    ).toEqual({ delimiter: "\t", decimal: "," });
    expect(savedSeparators({ data: { delimiter: "#", decimal: 1 } })).toEqual({
      delimiter: undefined,
      decimal: undefined,
    });
  });
});
