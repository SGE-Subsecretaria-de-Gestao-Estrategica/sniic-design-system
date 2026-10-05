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
  setAggregate,
  setChart,
  setData,
  setEncoding,
  setFormat,
  setOption,
  setParam,
  setStyle,
  SIZE_LIMITS,
} from "./spec";

const id = (chart: string) => chart as ChartId;

const stub = (
  id: string,
  channels: AnyChartDefinition["channels"],
): AnyChartDefinition => ({
  id,
  label: id,
  description: "",
  channels,
  keys: [],
  measures: [],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: 100, height: 100 },
  margin: "even",
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
    { id: "series", label: "Série", accepts: ["text"], required: false },
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
  spec = setEncoding(spec, "category", "dominio", registry).spec;
  return setEncoding(spec, "value", "total", registry).spec;
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
    expect(() => setEncoding(spec, "nope", "total", registry)).toThrow(
      /Unknown channel/,
    );
    expect(() => setEncoding(spec, "value", "nope", registry)).toThrow(
      /Unknown column/,
    );
    expect(() => setEncoding(spec, "value", "dominio", registry)).toThrow(
      /does not accept/,
    );
  });

  it("clears a channel with an empty list", () => {
    expect(
      setEncoding(mappedBars(), "value", null, registry).spec.encoding,
    ).toEqual({
      category: "dominio",
    });
  });
});

describe("invalidation", () => {
  it("retyping a column clears the mappings it no longer fits", () => {
    const spec = mappedBars();
    const retyped = columns.map((c) =>
      c.name === "total" ? { ...c, type: "text" as const } : c,
    );
    const { spec: next, reset } = setData(
      spec,
      { ...spec.data, columns: retyped },
      registry,
    );
    expect(next.encoding).toEqual({ category: "dominio" });
    expect(reset).toEqual([
      { channel: "value", column: "total", reason: "type-mismatch" },
    ]);
  });

  it("removing a column clears its mapping", () => {
    const spec = mappedBars();
    const { reset } = setData(
      spec,
      { ...spec.data, columns: columns.slice(1) },
      registry,
    );
    expect(reset).toEqual([
      { channel: "category", column: "dominio", reason: "column-removed" },
    ]);
  });

  it("switching chart keeps channels that still exist and clears options, params and margin", () => {
    const styled = setStyle(mappedBars(), { margin: "namesRight" }).spec;
    const spec: typeof styled = {
      ...styled,
      style: {
        ...styled.style,
        options: { sort: "ascending" },
        params: { thickness: 20 },
      },
    };
    const { spec: next, reset } = setChart(spec, id("lines"), registry);
    expect(next.encoding).toEqual({ value: "total" });
    expect(next.style).toMatchObject({ options: {}, params: {}, margin: null });
    expect(reset).toEqual([
      { channel: "category", column: "dominio", reason: "channel-removed" },
    ]);
  });

  it("clearing the chart clears every mapping", () => {
    expect(setChart(mappedBars(), null, registry).spec.encoding).toEqual({});
  });

  it("setting the same chart changes nothing", () => {
    const spec = mappedBars();
    expect(setChart(spec, id("bars"), registry)).toEqual({ spec, reset: [] });
  });

  it("an unknown chart id throws", () => {
    expect(() => setChart(createSpec(), id("pie"), registry)).toThrow(
      /Unknown chart/,
    );
  });
});

describe("setStyle", () => {
  it("merges valid changes", () => {
    const { spec, reset } = setStyle(createSpec(), {
      pillar: 6,
      width: 800,
      height: null,
    });
    expect(spec.style).toMatchObject({ pillar: 6, width: 800, height: null });
    expect(reset).toEqual([]);
  });

  it("clamps sizes to SIZE_LIMITS", () => {
    expect(setStyle(createSpec(), { width: 10 }).spec.style.width).toBe(
      SIZE_LIMITS.min,
    );
    expect(setStyle(createSpec(), { height: 99999 }).spec.style.height).toBe(
      SIZE_LIMITS.max,
    );
    // One decimal survives: page-grid widths like 581,1.
    expect(setStyle(createSpec(), { width: 581.14 }).spec.style.width).toBe(
      581.1,
    );
  });

  it("leaves options, params and extra formats to their own setters", () => {
    const sneaky = {
      pillar: 6,
      options: { sort: "x" },
      params: { n: 1 },
    } as never;
    expect(setStyle(createSpec(), sneaky).spec.style).toMatchObject({
      pillar: 6,
      options: {},
      params: {},
    });
  });

  it("validates the number format", () => {
    const format = { ...createSpec().style.format, decimals: 2, compact: true };
    expect(setStyle(createSpec(), { format }).spec.style.format).toEqual(
      format,
    );
    expect(() =>
      setStyle(createSpec(), { format: { ...format, decimals: 9 } }),
    ).toThrow(/decimals/);
  });

  it("accepts a margin preset or null, and rejects other ids", () => {
    const preset = setStyle(createSpec(), { margin: "namesRight" }).spec;
    expect(preset.style.margin).toBe("namesRight");
    expect(setStyle(preset, { margin: null }).spec.style.margin).toBeNull();
    expect(() => setStyle(createSpec(), { margin: "huge" as never })).toThrow(
      /Unknown margin/,
    );
  });

  it("rejects an unknown pillar and non-positive or non-finite sizes", () => {
    expect(() => setStyle(createSpec(), { pillar: 99 })).toThrow(
      /Unknown pillar/,
    );
    expect(() => setStyle(createSpec(), { width: 0 })).toThrow(/positive/);
    expect(() => setStyle(createSpec(), { height: -10 })).toThrow(/positive/);
    expect(() => setStyle(createSpec(), { width: Number.NaN })).toThrow(
      /positive/,
    );
  });
});

describe("setAggregate / setOption", () => {
  it("stores the aggregation", () => {
    expect(setAggregate(createSpec(), "mean").spec.aggregate).toBe("mean");
  });

  it("sets and clears options the chart declares, and rejects others", () => {
    const sortable = createRegistry([
      {
        ...stub("bars", []),
        options: [
          {
            id: "sort",
            label: "",
            step: "style",
            kind: "choice",
            choices: [],
            default: "",
          },
        ],
      },
    ]);
    const spec = setChart(createSpec(), id("bars"), sortable).spec;
    const sorted = setOption(spec, "sort", "ascending", sortable).spec;
    expect(sorted.style.options).toEqual({ sort: "ascending" });
    expect(
      setOption(sorted, "sort", undefined, sortable).spec.style.options,
    ).toEqual({});
    expect(() => setOption(spec, "nope", 1, sortable)).toThrow(
      /Unknown option/,
    );
  });
});

describe("setFormat", () => {
  const withExtra = createRegistry([
    {
      ...stub("bars", []),
      formats: [{ id: "bubbles", label: "", default: { decimals: 1 } }],
    },
  ]);
  const spec = setChart(createSpec(), id("bars"), withExtra).spec;

  it("patches the main format and checks the decimals", () => {
    const next = setFormat(
      spec,
      { decimals: 2, prefix: "R$ " },
      undefined,
      withExtra,
    ).spec;
    expect(next.style.format).toMatchObject({
      decimals: 2,
      prefix: "R$ ",
      compact: false,
    });
    expect(() =>
      setFormat(spec, { decimals: 9 }, undefined, withExtra),
    ).toThrow(/decimals/);
  });

  it("starts an extra format from its default and keeps it apart from the main one", () => {
    const next = setFormat(spec, { percent: true }, "bubbles", withExtra).spec;
    expect(next.style.formats.bubbles).toMatchObject({
      percent: true,
      decimals: 1,
    });
    expect(next.style.format).toEqual(spec.style.format);
    const again = setFormat(
      next,
      { decimals: null },
      "bubbles",
      withExtra,
    ).spec;
    expect(again.style.formats.bubbles).toMatchObject({
      percent: true,
      decimals: null,
    });
  });

  it("rejects a format the chart doesn't declare", () => {
    expect(() => setFormat(spec, {}, "nope", withExtra)).toThrow(
      /Unknown format/,
    );
    expect(() => setFormat(createSpec(), {}, "bubbles", withExtra)).toThrow(
      /Unknown format/,
    );
  });
});

describe("setParam", () => {
  const sized = createRegistry([
    {
      ...stub("bars", []),
      params: [
        { id: "thickness", label: "", min: 8, max: 80, step: 1, default: 32 },
      ],
    },
  ]);
  const spec = setChart(createSpec(), id("bars"), sized).spec;

  it("stores a value clamped to the param's range, and clears it with null", () => {
    const set = setParam(spec, "thickness", 20, sized).spec;
    expect(set.style.params).toEqual({ thickness: 20 });
    expect(setParam(spec, "thickness", 500, sized).spec.style.params).toEqual({
      thickness: 80,
    });
    expect(setParam(set, "thickness", null, sized).spec.style.params).toEqual(
      {},
    );
  });

  it("rejects params the chart doesn't declare and values that aren't numbers", () => {
    expect(() => setParam(spec, "nope", 1, sized)).toThrow(/Unknown param/);
    expect(() => setParam(spec, "thickness", Number.NaN, sized)).toThrow(
      /must be a number/,
    );
  });
});

describe("helpers", () => {
  const lines = registry.require("lines");

  it("compatibleColumns filters by accepted type", () => {
    expect(
      compatibleColumns(lines.channels[0], columns).map((c) => c.name),
    ).toEqual(["total", "ano"]);
  });

  it("missingChannels lists unmapped required channels", () => {
    expect(
      missingChannels(lines.channels, { value: "total" }).map((c) => c.id),
    ).toEqual(["x"]);
  });

  it("pruneEncoding with no chart resets everything", () => {
    expect(pruneEncoding({ value: "total" }, null, columns).encoding).toEqual(
      {},
    );
  });
});

describe("createRegistry", () => {
  it("rejects duplicate ids", () => {
    expect(() => createRegistry([stub("a", []), stub("a", [])])).toThrow(
      /Duplicate chart/,
    );
    const dupChannels = [
      { id: "v", label: "", accepts: ["number"], required: true },
      { id: "v", label: "", accepts: ["number"], required: true },
    ] as const;
    expect(() => createRegistry([stub("b", dupChannels)])).toThrow(
      /duplicate channel/,
    );
  });
});

describe("autoEncode", () => {
  const withColumns = () =>
    setData(createSpec(), { ...createSpec().data, columns }, registry).spec;

  it("fills required channels with the first unused compatible column", () => {
    const spec = setChart(withColumns(), id("bars"), registry).spec;
    expect(autoEncode(spec, registry).spec.encoding).toEqual({
      category: "dominio",
      value: "total",
    });
  });

  it("keeps existing mappings, skips optional channels and doesn't reuse a column", () => {
    let spec = setChart(withColumns(), id("lines"), registry).spec;
    spec = setEncoding(spec, "value", "total", registry).spec;
    expect(autoEncode(spec, registry).spec.encoding).toEqual({
      value: "total",
      x: "ano",
    });
  });

  it("prefers year-like columns for a time axis and avoids them for measures", () => {
    const yearFirst: ColumnSchema[] = [
      { name: "ano", type: "number" },
      { name: "total", type: "number" },
      { name: "dominio", type: "text" },
    ];
    const withYears = setData(
      createSpec(),
      { ...createSpec().data, columns: yearFirst },
      registry,
    ).spec;
    const years = new Set(["ano"]);

    const bars = setChart(withYears, id("bars"), registry).spec;
    expect(autoEncode(bars, registry, years).spec.encoding).toEqual({
      category: "dominio",
      value: "total",
    });
    expect(autoEncode(bars, registry).spec.encoding.value).toBe("ano");

    const lines = setChart(withYears, id("lines"), registry).spec;
    expect(autoEncode(lines, registry, years).spec.encoding).toEqual({
      x: "ano",
      value: "total",
    });
  });

  it("does nothing without a chart", () => {
    const spec = withColumns();
    expect(autoEncode(spec, registry).spec).toBe(spec);
  });
});
