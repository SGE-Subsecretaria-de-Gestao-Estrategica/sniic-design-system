import { describe, expect, it } from "vitest";
import type { ColumnSchema } from "../data/types";
import { createRegistry } from "../registry/registry";
import type { ChartId } from "../registry/layouts";
import type { AnyChartDefinition } from "../registry/types";
import {
  autoEncode,
  compatibleColumns,
  createSpec,
  missingChannels,
  pruneEncoding,
  setChart,
  setData,
  setEncoding,
  setStyle,
  SIZE_LIMITS,
} from "./spec";

const id = (chart: string) => chart as ChartId;

const stub = (id: string, channels: AnyChartDefinition["channels"]): AnyChartDefinition => ({
  id,
  label: id,
  description: "",
  channels,
  sizing: { width: "free", height: "free" },
  defaultSize: { width: 100, height: 100 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  build: () => ({ width: 0, height: 0 }),
});

const registry = createRegistry([
  stub("bars", [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
  ]),
  stub("lines", [
    { id: "x", label: "X", accepts: ["date", "number"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "series", label: "Série", accepts: ["number"], required: false, multiple: true },
  ]),
]);

const columns: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "total", type: "number" },
  { name: "ano", type: "date", datePattern: "yyyy" },
];

function mappedBars() {
  let spec = createSpec();
  spec = setData(spec, { ...spec.data, columns }, registry).spec;
  spec = setChart(spec, id("bars"), registry).spec;
  spec = setEncoding(spec, "category", ["dominio"], registry).spec;
  return setEncoding(spec, "value", ["total"], registry).spec;
}

describe("createSpec", () => {
  it("is plain JSON", () => {
    const spec = mappedBars();
    expect(JSON.parse(JSON.stringify(spec))).toEqual(spec);
    expect(spec.version).toBe(1);
  });
});

describe("setEncoding", () => {
  it("validates channel, column and type", () => {
    const spec = mappedBars();
    expect(() => setEncoding(spec, "nope", ["total"], registry)).toThrow(/Unknown channel/);
    expect(() => setEncoding(spec, "value", ["nope"], registry)).toThrow(/Unknown column/);
    expect(() => setEncoding(spec, "value", ["dominio"], registry)).toThrow(/does not accept/);
    expect(() => setEncoding(spec, "value", ["total", "total"], registry)).toThrow(/single/);
  });

  it("clears a channel with an empty list", () => {
    expect(setEncoding(mappedBars(), "value", [], registry).spec.encoding).toEqual({
      category: ["dominio"],
    });
  });
});

describe("invalidation", () => {
  it("retyping a column clears the mappings it no longer fits", () => {
    const spec = mappedBars();
    const retyped = columns.map((c) => (c.name === "total" ? { ...c, type: "text" as const } : c));
    const { spec: next, reset } = setData(spec, { ...spec.data, columns: retyped }, registry);
    expect(next.encoding).toEqual({ category: ["dominio"] });
    expect(reset).toEqual([{ channel: "value", column: "total", reason: "type-mismatch" }]);
  });

  it("removing a column clears its mapping", () => {
    const spec = mappedBars();
    const { reset } = setData(spec, { ...spec.data, columns: columns.slice(1) }, registry);
    expect(reset).toEqual([{ channel: "category", column: "dominio", reason: "column-removed" }]);
  });

  it("switching chart keeps channels that still exist and clears options", () => {
    const spec = setStyle(mappedBars(), { options: { sort: "ascending" } }).spec;
    const { spec: next, reset } = setChart(spec, id("lines"), registry);
    expect(next.encoding).toEqual({ value: ["total"] });
    expect(next.style.options).toEqual({});
    expect(reset).toEqual([{ channel: "category", column: "dominio", reason: "channel-removed" }]);
  });

  it("clearing the chart clears every mapping", () => {
    expect(setChart(mappedBars(), null, registry).spec.encoding).toEqual({});
  });

  it("setting the same chart changes nothing", () => {
    const spec = mappedBars();
    expect(setChart(spec, id("bars"), registry)).toEqual({ spec, reset: [] });
  });

  it("an unknown chart id throws", () => {
    expect(() => setChart(createSpec(), id("pie"), registry)).toThrow(/Unknown chart/);
  });
});

describe("setStyle", () => {
  it("merges valid changes", () => {
    const { spec, reset } = setStyle(createSpec(), { pillar: 6, width: 800, height: null });
    expect(spec.style).toMatchObject({ pillar: 6, width: 800, height: null });
    expect(reset).toEqual([]);
  });

  it("clamps sizes to SIZE_LIMITS", () => {
    expect(setStyle(createSpec(), { width: 10 }).spec.style.width).toBe(SIZE_LIMITS.min);
    expect(setStyle(createSpec(), { height: 99999 }).spec.style.height).toBe(SIZE_LIMITS.max);
    expect(setStyle(createSpec(), { width: 800.4 }).spec.style.width).toBe(800);
  });

  it("rejects an unknown pillar and non-positive or non-finite sizes", () => {
    expect(() => setStyle(createSpec(), { pillar: 99 })).toThrow(/Unknown pillar/);
    expect(() => setStyle(createSpec(), { width: 0 })).toThrow(/positive/);
    expect(() => setStyle(createSpec(), { height: -10 })).toThrow(/positive/);
    expect(() => setStyle(createSpec(), { width: Number.NaN })).toThrow(/positive/);
  });
});

describe("helpers", () => {
  const lines = registry.require("lines");

  it("compatibleColumns filters by accepted type", () => {
    expect(compatibleColumns(lines.channels[0], columns).map((c) => c.name)).toEqual([
      "total",
      "ano",
    ]);
  });

  it("missingChannels lists unmapped required channels", () => {
    expect(missingChannels(lines.channels, { value: ["total"] }).map((c) => c.id)).toEqual(["x"]);
  });

  it("pruneEncoding with no chart resets everything", () => {
    expect(pruneEncoding({ value: ["total"] }, null, columns).encoding).toEqual({});
  });
});

describe("createRegistry", () => {
  it("rejects duplicate ids", () => {
    expect(() => createRegistry([stub("a", []), stub("a", [])])).toThrow(/Duplicate chart/);
    const dupChannels = [
      { id: "v", label: "", accepts: ["number"], required: true },
      { id: "v", label: "", accepts: ["number"], required: true },
    ] as const;
    expect(() => createRegistry([stub("b", dupChannels)])).toThrow(/duplicate channel/);
  });
});

describe("autoEncode", () => {
  const withColumns = () => setData(createSpec(), { ...createSpec().data, columns }, registry).spec;

  it("fills required channels with the first unused compatible column", () => {
    const spec = setChart(withColumns(), id("bars"), registry).spec;
    expect(autoEncode(spec, registry).spec.encoding).toEqual({
      category: ["dominio"],
      value: ["total"],
    });
  });

  it("keeps existing mappings, skips optional channels and doesn't reuse a column", () => {
    let spec = setChart(withColumns(), id("lines"), registry).spec;
    spec = setEncoding(spec, "value", ["total"], registry).spec;
    expect(autoEncode(spec, registry).spec.encoding).toEqual({ value: ["total"], x: ["ano"] });
  });

  it("does nothing without a chart", () => {
    const spec = withColumns();
    expect(autoEncode(spec, registry).spec).toBe(spec);
  });
});
