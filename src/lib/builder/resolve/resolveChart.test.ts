import { describe, expect, it } from "vitest";
import { coerceRows } from "../data/coerce";
import type { ColumnSchema } from "../data/types";
import { createRegistry, defaultRegistry, defineChart } from "../registry";
import type { ChartId } from "../registry/layouts";
import { resolveChart } from "./resolveChart";
import { createSpec, setChart, setData, setEncoding, setStyle } from "../spec/spec";

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
    const spec = setEncoding(barsSpec(), "category", ["dominio"], defaultRegistry).spec;
    const result = resolveChart(spec, rows, defaultRegistry);
    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete") expect(result.missing.map((c) => c.id)).toEqual(["value"]);
  });

  it("builds horizontal bars end to end", () => {
    let spec = setEncoding(barsSpec(), "category", ["dominio"], defaultRegistry).spec;
    spec = setEncoding(spec, "value", ["total"], defaultRegistry).spec;
    spec = setStyle(spec, { width: 800 }).spec;

    const result = resolveChart(spec, rows, defaultRegistry);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    const { margin } = result;
    expect(result.dropped).toBe(1);
    const { chart, layout } = result.view;
    expect(chart).toBe("horizontalBars");
    expect(layout.width).toBe(800 - margin.left - margin.right);
    expect(result.figure.width).toBe(800);
    expect(result.figure.height).toBe(layout.height + margin.top + margin.bottom);
    expect(layout.bars.map((b) => b.category)).toEqual(["Música", "Teatro", "Circo"]);
  });

  it("falls back to the default width", () => {
    let spec = setEncoding(barsSpec(), "category", ["dominio"], defaultRegistry).spec;
    spec = setEncoding(spec, "value", ["total"], defaultRegistry).spec;
    const result = resolveChart(spec, rows, defaultRegistry);
    if (result.status !== "ready") throw new Error(result.status);
    expect(result.figure.width).toBe(result.definition.defaultSize.width);
  });

  it("reports a figure smaller than its margins as an error", () => {
    let spec = setEncoding(barsSpec(), "category", ["dominio"], defaultRegistry).spec;
    spec = setEncoding(spec, "value", ["total"], defaultRegistry).spec;
    spec = setStyle(spec, { width: 100 }).spec;
    expect(resolveChart(spec, rows, defaultRegistry).status).toBe("error");
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
      description: "",
      channels: [
        { id: "value", label: "", accepts: ["number"], required: true },
        { id: "group", label: "", accepts: ["text"], required: false },
      ],
      sizing: { width: "free", height: "free" },
      defaultSize: { width: 100, height: 100 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
      [{ total: "1", dominio: "A" }, { total: "2", dominio: "" }],
      groupColumns,
      ",",
    );
    let spec = createSpec();
    spec = setData(spec, { ...spec.data, columns: groupColumns }, registry).spec;
    spec = setChart(spec, "grouped" as ChartId, registry).spec;
    spec = setEncoding(spec, "value", ["total"], registry).spec;
    spec = setEncoding(spec, "group", ["dominio"], registry).spec;

    const result = resolveChart(spec, groupRows, registry);
    expect(result).toMatchObject({ status: "ready", dropped: 1 });
  });
});
