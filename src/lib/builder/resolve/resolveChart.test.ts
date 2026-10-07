import { describe, expect, it } from "vitest";
import { coerceRows } from "../data/coerce";
import type { ColumnSchema } from "../data/types";
import { createRegistry, defaultRegistry, defineChart } from "../registry";
import type { ChartId } from "../registry/layouts";
import { marginOf } from "../registry/margins";
import { resolveChart } from "./resolveChart";
import {
  createSpec,
  roundSize,
  setChart,
  setData,
  setEncoding,
  setOption,
  setParam,
  setStyle,
} from "../spec/spec";

const columns: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "total", type: "number" },
];
const rows = coerceRows(
  [
    { dominio: "Música", total: "1.200" },
    { dominio: "Teatro", total: "800" },
    { dominio: "Dança", total: "n/d" },
    { dominio: "Circo", total: "300" },
  ],
  columns,
  ",",
);

function mapped() {
  let spec = setEncoding(
    barsSpec(),
    "category",
    "dominio",
    defaultRegistry,
  ).spec;
  spec = setEncoding(spec, "value", "total", defaultRegistry).spec;
  return spec;
}

function barsSpec() {
  let spec = createSpec();
  spec = setData(spec, { ...spec.data, columns }, defaultRegistry).spec;
  return setChart(spec, "horizontalBars", defaultRegistry).spec;
}

describe("resolveChart", () => {
  it("is empty without a chart or data", () => {
    expect(resolveChart(createSpec(), rows, defaultRegistry)).toEqual({
      status: "empty",
      reason: "no-chart",
    });
    expect(resolveChart(barsSpec(), [], defaultRegistry)).toEqual({
      status: "empty",
      reason: "no-data",
    });
  });

  it("lists missing required channels", () => {
    const spec = setEncoding(
      barsSpec(),
      "category",
      "dominio",
      defaultRegistry,
    ).spec;
    const result = resolveChart(spec, rows, defaultRegistry);
    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete")
      expect(result.missing.map((c) => c.id)).toEqual(["value"]);
  });

  it("builds horizontal bars end to end", () => {
    let spec = setEncoding(
      barsSpec(),
      "category",
      "dominio",
      defaultRegistry,
    ).spec;
    spec = setEncoding(spec, "value", "total", defaultRegistry).spec;
    spec = setStyle(spec, { width: 800 }).spec;

    const result = resolveChart(spec, rows, defaultRegistry);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    const { margin } = result;
    expect(result.dropped).toBe(1);
    if (result.view.chart !== "horizontalBars")
      throw new Error(result.view.chart);
    const { layout } = result.view;
    expect(layout.width).toBe(800 - margin.left - margin.right);
    expect(result.figure.width).toBe(800);
    expect(result.figure.height).toBe(
      roundSize(layout.height + margin.top + margin.bottom),
    );
    expect(layout.bars.map((b) => b.category)).toEqual([
      "Música",
      "Teatro",
      "Circo",
    ]);
  });

  it("falls back to the default width", () => {
    let spec = setEncoding(
      barsSpec(),
      "category",
      "dominio",
      defaultRegistry,
    ).spec;
    spec = setEncoding(spec, "value", "total", defaultRegistry).spec;
    const result = resolveChart(spec, rows, defaultRegistry);
    if (result.status !== "ready") throw new Error(result.status);
    expect(result.figure.width).toBe(result.definition.defaultSize.width);
  });

  it("reports a figure smaller than its margins as an error", () => {
    let spec = setEncoding(
      barsSpec(),
      "category",
      "dominio",
      defaultRegistry,
    ).spec;
    spec = setEncoding(spec, "value", "total", defaultRegistry).spec;
    // Bypasses `setStyle`, which would clamp the width (e.g. a hand-edited spec).
    spec = { ...spec, style: { ...spec.style, width: 100 } };
    expect(resolveChart(spec, rows, defaultRegistry).status).toBe("error");
  });

  describe("repeated keys", () => {
    const repeated = coerceRows(
      [
        { dominio: "Música", total: "10" },
        { dominio: "Teatro", total: "5" },
        { dominio: "Música", total: "30" },
      ],
      columns,
      ",",
    );
    const valuesWith = (aggregate: "sum" | "mean" | "count" | "first") => {
      const result = resolveChart(
        { ...mapped(), aggregate },
        repeated,
        defaultRegistry,
      );
      if (result.status !== "ready" || result.view.chart !== "horizontalBars")
        throw new Error(result.status);
      expect(result.combined).toBe(1);
      return Object.fromEntries(
        result.view.layout.bars.map((b) => [b.category, b.value]),
      );
    };

    it("combines rows sharing a category, by the chosen aggregation", () => {
      expect(valuesWith("sum")).toEqual({ Música: 40, Teatro: 5 });
      expect(valuesWith("mean")).toEqual({ Música: 20, Teatro: 5 });
      expect(valuesWith("count")).toEqual({ Música: 2, Teatro: 5 });
      expect(valuesWith("first")).toEqual({ Música: 10, Teatro: 5 });
    });
  });

  describe("options and fitting", () => {
    const bars = (spec: ReturnType<typeof mapped>) => {
      const result = resolveChart(spec, rows, defaultRegistry);
      if (result.status !== "ready" || result.view.chart !== "horizontalBars")
        throw new Error(result.status);
      return { ...result, layout: result.view.layout };
    };
    const categories = (spec: ReturnType<typeof mapped>) =>
      bars(spec).layout.bars.map((b) => b.category);

    it("sorts and applies a manual order", () => {
      expect(categories(mapped())).toEqual(["Música", "Teatro", "Circo"]);
      const ascending = setOption(
        mapped(),
        "sort",
        "ascending",
        defaultRegistry,
      ).spec;
      expect(categories(ascending)).toEqual(["Circo", "Teatro", "Música"]);
    });

    it("applies the manual order only while the sort option is on manual", () => {
      const ordered = setOption(
        mapped(),
        "categoryOrder",
        ["Teatro", "Circo", "Música"],
        defaultRegistry,
      ).spec;
      expect(categories(ordered)).toEqual(["Música", "Teatro", "Circo"]);
      const manual = setOption(ordered, "sort", "manual", defaultRegistry).spec;
      expect(categories(manual)).toEqual(["Teatro", "Circo", "Música"]);
      // Categories the list doesn't name follow in file order.
      const partial = setOption(
        manual,
        "categoryOrder",
        ["Circo"],
        defaultRegistry,
      ).spec;
      expect(categories(partial)).toEqual(["Circo", "Música", "Teatro"]);
    });

    it("uses the chart's margin preset, or the one in the spec", () => {
      const standard = bars(mapped());
      const left = marginOf("left");
      expect(standard.margin).toEqual(left);
      const even = bars(setStyle(mapped(), { margin: "even" }).spec);
      expect(even.margin).toEqual(marginOf("even"));
      expect(even.figure.width).toBe(standard.figure.width);
      expect(even.layout.width).toBe(
        standard.layout.width + (left.left - marginOf("even").left),
      );
    });

    it("passes layout params, with defaults for the ones not set", () => {
      const thickness = (spec: ReturnType<typeof mapped>) =>
        bars(spec).layout.bars[0].thickness;
      expect(thickness(mapped())).toBe(32);
      const thin = setParam(mapped(), "barThickness", 20, defaultRegistry).spec;
      expect(thickness(thin)).toBe(20);
      expect(bars(thin).figure.height).toBeLessThan(
        bars(mapped()).figure.height,
      );
      // A target height wins over the thickness param, and says what it used instead.
      expect(bars(thin).solved).toEqual({});
      const fitted = bars(setStyle(thin, { height: 600 }).spec);
      expect(fitted.figure.height).toBe(600);
      expect(fitted.solved.barThickness).toBeCloseTo(
        fitted.layout.bars[0].thickness,
        8,
      );
    });

    it("fits the bars to a target height and warns when they get too thin", () => {
      const automatic = bars(mapped());
      expect(automatic.warnings).toEqual([]);

      const tall = bars(setStyle(mapped(), { height: 600 }).spec);
      expect(tall.figure.height).toBe(600);

      const short = bars({
        ...mapped(),
        style: { ...mapped().style, height: 80 },
      });
      expect(short.figure.height).toBe(80);
      expect(short.warnings).toHaveLength(1);
    });
  });

  it("reports a chart missing from the registry as an error", () => {
    const spec = { ...barsSpec(), chart: "pie" as ChartId };
    const result = resolveChart(spec, rows, defaultRegistry);
    expect(result).toMatchObject({ status: "error", definition: null });
  });

  it("drops rows missing a value in an optional mapped channel", () => {
    const withGroup = defineChart({
      id: "grouped",
      label: "",
      group: "categories",
      channels: [
        { id: "value", label: "", accepts: ["number"], required: true },
        { id: "group", label: "", accepts: ["text"], required: false },
      ],
      keys: [],
      measures: [],
      sizing: { width: "free", height: "free" },
      defaultSize: { width: 100, height: 100 },
      margin: "even",
      build: (rows, { read, box }) => {
        const getGroup = read.text("group");
        return { ...box, groups: rows.map(getGroup) };
      },
    });
    const registry = createRegistry([withGroup]);
    const groupColumns: ColumnSchema[] = [
      { name: "total", type: "number" },
      { name: "dominio", type: "text" },
    ];
    const groupRows = coerceRows(
      [
        { total: "1", dominio: "A" },
        { total: "2", dominio: "" },
      ],
      groupColumns,
      ",",
    );
    let spec = createSpec();
    spec = setData(
      spec,
      { ...spec.data, columns: groupColumns },
      registry,
    ).spec;
    spec = setChart(spec, "grouped" as ChartId, registry).spec;
    spec = setEncoding(spec, "value", "total", registry).spec;
    spec = setEncoding(spec, "group", "dominio", registry).spec;

    const result = resolveChart(spec, groupRows, registry);
    expect(result).toMatchObject({ status: "ready", dropped: 1 });
  });
});
