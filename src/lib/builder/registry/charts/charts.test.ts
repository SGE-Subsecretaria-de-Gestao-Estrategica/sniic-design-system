import { describe, expect, it } from "vitest";
import { coerceRows } from "../../data/coerce";
import type { ColumnSchema, RawRow } from "../../data/types";
import { defaultRegistry } from "..";
import type { ChartId } from "../layouts";
import { resolveChart } from "../../resolve/resolveChart";
import {
  autoEncode,
  createSpec,
  setChart,
  setData,
  setEncoding,
  setOption,
  setParam,
} from "../../spec/spec";

function resolve(
  chart: ChartId,
  columns: ColumnSchema[],
  raw: RawRow[],
  extra: Record<string, string> = {},
) {
  let spec = createSpec();
  spec = setData(
    spec,
    { ...spec.data, decimal: ",", columns },
    defaultRegistry,
  ).spec;
  spec = autoEncode(
    setChart(spec, chart, defaultRegistry).spec,
    defaultRegistry,
  ).spec;
  for (const [channel, column] of Object.entries(extra)) {
    spec = setEncoding(spec, channel, column, defaultRegistry).spec;
  }
  const result = resolveChart(
    spec,
    coerceRows(raw, columns, ","),
    defaultRegistry,
  );
  if (result.status !== "ready") throw new Error(JSON.stringify(result));
  return { spec, result };
}

const SERIES: ColumnSchema[] = [
  { name: "ano", type: "number" },
  { name: "valor", type: "number" },
  { name: "setor", type: "text" },
];
const seriesRows = ["Cultura", "Agricultura"].flatMap((setor, s) =>
  [2019, 2020, 2021].map((ano, i) => ({
    ano: String(ano),
    valor: String(10 * (s + 1) + i),
    setor,
  })),
);

const GROUPED: ColumnSchema[] = [
  { name: "dominio", type: "text" },
  { name: "sexo", type: "text" },
  { name: "salario", type: "number" },
];
const groupedRows = ["Música", "Teatro", "Design"].flatMap((dominio, d) =>
  ["Feminino", "Masculino"].map((sexo, g) => ({
    dominio,
    sexo,
    salario: String(1000 * (d + 1) + 200 * g),
  })),
);

describe("lineSeries", () => {
  it("draws one line when no series is mapped (rows sharing x are combined)", () => {
    const { result } = resolve("lineSeries", SERIES, seriesRows);
    if (result.view.chart !== "lineSeries") throw new Error();
    expect(result.view.layout.series).toHaveLength(1);
    expect(result.combined).toBe(3);
    expect(result.figure).toEqual({ width: 581.1, height: 320 });
  });

  it("draws one line per series", () => {
    const { result } = resolve("lineSeries", SERIES, seriesRows, {
      series: "setor",
    });
    if (result.view.chart !== "lineSeries") throw new Error();
    expect(result.view.layout.series.map((s) => s.key)).toEqual([
      "Cultura",
      "Agricultura",
    ]);
    expect(result.combined).toBe(0);
  });
});

describe("rangeRows", () => {
  it("draws a row per category with a marker per group", () => {
    const { result } = resolve("rangeRows", GROUPED, groupedRows);
    if (result.view.chart !== "rangeRows") throw new Error();
    const { rows, groups } = result.view.layout;
    expect(rows.map((r) => r.category)).toEqual(["Design", "Teatro", "Música"]);
    expect(groups).toEqual(["Feminino", "Masculino"]);
    expect(rows[0].markers).toHaveLength(2);
  });
});

describe("bubbleColumns", () => {
  it("draws one column without a group, and one per group with it", () => {
    const single = resolve("bubbleColumns", GROUPED, groupedRows).result;
    if (single.view.chart !== "bubbleColumns") throw new Error();
    expect(single.view.layout.isGrouped).toBe(false);
    expect(single.combined).toBe(3);

    const grouped = resolve("bubbleColumns", GROUPED, groupedRows, {
      group: "sexo",
    }).result;
    if (grouped.view.chart !== "bubbleColumns") throw new Error();
    expect(grouped.view.layout.columns.map((c) => c.group)).toEqual([
      "Feminino",
      "Masculino",
    ]);
  });

  it("uses the chosen main group, and ignores one that is no longer in the data", () => {
    const { spec } = resolve("bubbleColumns", GROUPED, groupedRows, {
      group: "sexo",
    });
    const rows = coerceRows(groupedRows, GROUPED, ",");
    const mainOf = (value: string) => {
      const result = resolveChart(
        setOption(spec, "mainGroup", value, defaultRegistry).spec,
        rows,
        defaultRegistry,
      );
      if (result.status !== "ready" || result.view.chart !== "bubbleColumns")
        throw new Error();
      return result.view.layout.columns.find((c) => c.isMain)?.group;
    };
    expect(mainOf("Masculino")).toBe("Masculino");
    expect(mainOf("Sumiu")).toBe("Feminino");
  });
});

describe("lineBubbleRow", () => {
  const SHARES: ColumnSchema[] = [
    { name: "ano", type: "number" },
    { name: "vinculos", type: "number" },
    { name: "participacao", type: "number" },
  ];
  const shareRows = [2019, 2020, 2021].map((ano, i) => ({
    ano: String(ano),
    vinculos: String(1000 + 100 * i),
    participacao: `0,0${i + 1}`,
  }));

  it("stacks a line panel over a bubble row on the same x axis", () => {
    const { result } = resolve("lineBubbleRow", SHARES, shareRows);
    if (result.view.chart !== "lineBubbleRow") throw new Error();
    const { line, row, panels, height } = result.view.layout;
    expect(line.series).toHaveLength(1);
    expect(row.items.map((item) => item.value)).toEqual([0.01, 0.02, 0.03]);
    expect(row.items.map((item) => item.x)).toEqual(
      line.series[0].points.map((p) => p.x),
    );
    expect(panels.byKey.row.bottom).toBeCloseTo(height);
    expect(line.height).toBeCloseTo(panels.byKey.line.height);
  });

  it("names the line from the text option", () => {
    const { spec } = resolve("lineBubbleRow", SHARES, shareRows);
    const named = setOption(spec, "lineName", "Vínculos", defaultRegistry).spec;
    const result = resolveChart(
      named,
      coerceRows(shareRows, SHARES, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "lineBubbleRow")
      throw new Error();
    expect(result.view.layout.line.series[0].key).toBe("Vínculos");
  });
});

describe("lineDifference", () => {
  const differences = (spec: ReturnType<typeof resolve>["spec"]) => {
    const result = resolveChart(
      spec,
      coerceRows(seriesRows, SERIES, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "lineDifference")
      throw new Error();
    return result.view.layout;
  };

  it("subtracts the second series from the first, or the other way when asked", () => {
    const { spec } = resolve("lineDifference", SERIES, seriesRows);
    const layout = differences(spec);
    expect(layout).toMatchObject({
      minuend: "Cultura",
      subtrahend: "Agricultura",
    });
    expect(layout.diff.stems.map((stem) => stem.value)).toEqual([
      -10, -10, -10,
    ]);

    const flipped = differences(
      setOption(spec, "minuend", "Agricultura", defaultRegistry).spec,
    );
    expect(flipped.diff.stems.map((stem) => stem.value)).toEqual([10, 10, 10]);
    // A stored series that is no longer in the data falls back to the first.
    expect(
      differences(setOption(spec, "minuend", "Indústria", defaultRegistry).spec)
        .minuend,
    ).toBe("Cultura");
  });

  it("explains that it needs exactly two series", () => {
    const three = [
      ...seriesRows,
      { ano: "2019", valor: "5", setor: "Indústria" },
    ];
    const { spec } = resolve("lineDifference", SERIES, seriesRows);
    const result = resolveChart(
      spec,
      coerceRows(three, SERIES, ","),
      defaultRegistry,
    );
    expect(result).toMatchObject({ status: "error" });
    if (result.status === "error")
      expect(result.message).toMatch(/duas séries.*tem 3/);
  });
});

describe("RAIS break", () => {
  const LONG: ColumnSchema[] = [
    { name: "ano", type: "number" },
    { name: "valor", type: "number" },
    { name: "setor", type: "text" },
  ];
  const longRows = ["Cultura", "Agricultura"].flatMap((setor, s) =>
    [2019, 2020, 2021, 2022, 2023].map((ano, i) => ({
      ano: String(ano),
      valor: String(10 * (s + 1) + i),
      setor,
    })),
  );
  const layoutOf = (
    chart: ChartId,
    spec: ReturnType<typeof resolve>["spec"],
    raw = longRows,
    columns = LONG,
  ) => {
    const result = resolveChart(
      spec,
      coerceRows(raw, columns, ","),
      defaultRegistry,
    );
    if (result.status !== "ready") throw new Error(JSON.stringify(result));
    return result.view as Extract<typeof result.view, { chart: typeof chart }>;
  };

  it("splits the x axis after 2021 only while the option is on", () => {
    const { spec } = resolve("lineSeries", LONG, longRows);
    const whole = layoutOf("lineSeries", spec);
    if (whole.chart !== "lineSeries") throw new Error();
    expect(whole.layout.segments).toHaveLength(1);

    const broken = layoutOf(
      "lineSeries",
      setOption(spec, "raisBreak", true, defaultRegistry).spec,
    );
    if (broken.chart !== "lineSeries") throw new Error();
    expect(broken.layout.segments.map((s) => s.ticks)).toEqual([
      [2019, 2020, 2021],
      [2022, 2023],
    ]);
    // Each series now has two segment ends on each side of the break.
    const ends = broken.layout.series[0].points.filter(
      (p) => p.isSegmentStart || p.isSegmentEnd,
    );
    expect(ends.map((p) => p.xValue)).toEqual([2019, 2021, 2022, 2023]);
  });

  it("breaks date axes too, and the panel under the lines shares the break", () => {
    const DATED: ColumnSchema[] = [
      { ...LONG[0], type: "date", datePattern: "yyyy" },
      LONG[1],
      LONG[2],
    ];
    const { spec } = resolve("lineDifference", DATED, longRows);
    const view = layoutOf(
      "lineDifference",
      setOption(spec, "raisBreak", true, defaultRegistry).spec,
      longRows,
      DATED,
    );
    if (view.chart !== "lineDifference") throw new Error();
    const { line, diff } = view.layout;
    expect(line.segments).toHaveLength(2);
    expect(diff.stems.map((stem) => line.xAxis.segmentOf(stem.xValue))).toEqual(
      [0, 0, 0, 1, 1],
    );
  });

  it("keeps one segment when the data sits on one side of the break", () => {
    const { spec } = resolve("lineSeries", SERIES, seriesRows);
    const result = resolveChart(
      setOption(spec, "raisBreak", true, defaultRegistry).spec,
      coerceRows(seriesRows, SERIES, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "lineSeries")
      throw new Error();
    expect(result.view.layout.segments).toHaveLength(1);
  });
});

const UF_COLUMNS: ColumnSchema[] = [
  { name: "UF", type: "uf" },
  { name: "Escala", type: "text" },
  { name: "valor", type: "number" },
];
const SIGLAS = ["AC", "SP", "RJ", "DF"];
const ufRows = ["Estadual", "Municipal"].flatMap((Escala, e) =>
  SIGLAS.map((UF, i) => ({ UF, Escala, valor: `0,${e + 1}${i}` })),
);

describe("hexChoropleth", () => {
  it("sizes the map by the hexagon radius and steps one slice of the data", () => {
    const { result } = resolve("hexChoropleth", UF_COLUMNS, ufRows, {
      slice: "Escala",
    });
    if (result.view.chart !== "hexChoropleth") throw new Error();
    const { layout } = result.view;
    // 12,5 radii wide, plus the margins
    expect(layout.width).toBeCloseTo(12.5 * 22);
    expect(result.figure.width).toBe(323);
    expect(result.solved).toEqual({});
    expect(layout.slice).toBe("Estadual");
    expect(layout.data.map((d) => d.key)).toEqual(SIGLAS);
    expect(layout.domain).toEqual([0, 0.13]);
    expect(layout.steps).toBe(10);
    expect(result.warnings.join(" ")).toMatch(/^Sem dados para: AL, AM, AP/);
  });

  it("shows the chosen slice, and starts at the lowest value when asked", () => {
    const { spec } = resolve("hexChoropleth", UF_COLUMNS, ufRows, {
      slice: "Escala",
    });
    let next = setOption(spec, "sliceValue", "Municipal", defaultRegistry).spec;
    next = setOption(next, "fromMin", true, defaultRegistry).spec;
    const result = resolveChart(
      next,
      coerceRows(ufRows, UF_COLUMNS, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "hexChoropleth")
      throw new Error();
    expect(result.view.layout.slice).toBe("Municipal");
    expect(result.view.layout.domain).toEqual([0.2, 0.23]);
  });

  it("reads state names and combines repeated states", () => {
    const columns: ColumnSchema[] = [
      { name: "estado", type: "uf" },
      { name: "valor", type: "number" },
    ];
    const { result } = resolve("hexChoropleth", columns, [
      { estado: "São Paulo", valor: "1" },
      { estado: "São Paulo", valor: "2" },
      { estado: "Acre", valor: "5" },
      { estado: "Brasil", valor: "99" },
    ]);
    if (result.view.chart !== "hexChoropleth") throw new Error();
    expect(result.dropped).toBe(1);
    expect(result.combined).toBe(1);
    expect(result.view.layout.data.map((d) => [d.key, d.value])).toEqual([
      ["SP", 3],
      ["AC", 5],
    ]);
  });

  it("explains a state written in two ways", () => {
    const columns: ColumnSchema[] = [
      { name: "estado", type: "uf" },
      { name: "valor", type: "number" },
    ];
    expect(() =>
      resolve("hexChoropleth", columns, [
        { estado: "SP", valor: "1" },
        { estado: "São Paulo", valor: "2" },
      ]),
    ).toThrow(/A UF SP aparece mais de uma vez/);
  });

  it("follows the radius param, until a width takes its place", () => {
    const { spec } = resolve("hexChoropleth", UF_COLUMNS, ufRows, {
      slice: "Escala",
    });
    const rows = coerceRows(ufRows, UF_COLUMNS, ",");
    const bigger = resolveChart(
      setParam(spec, "radius", 40, defaultRegistry).spec,
      rows,
      defaultRegistry,
    );
    if (bigger.status !== "ready") throw new Error();
    expect(bigger.figure.width).toBe(12.5 * 40 + 48);

    const fitted = resolveChart(
      { ...spec, style: { ...spec.style, width: 581.1 } },
      rows,
      defaultRegistry,
    );
    if (fitted.status !== "ready") throw new Error();
    expect(fitted.figure.width).toBe(581.1);
    expect(fitted.solved.radius).toBeCloseTo((581.1 - 48) / 12.5);
  });

  it("warns when the tiles get too small for their labels", () => {
    const { spec } = resolve("hexChoropleth", UF_COLUMNS, ufRows, {
      slice: "Escala",
    });
    const small = resolveChart(
      { ...spec, style: { ...spec.style, width: 182.4 } },
      coerceRows(ufRows, UF_COLUMNS, ","),
      defaultRegistry,
    );
    if (small.status !== "ready") throw new Error();
    expect(small.warnings.join(" ")).toMatch(/11 px de raio/);
  });
});

describe("hexTwinBars", () => {
  const mapped = { type: "Escala" };

  it("draws up to two bars per state, tied to their type", () => {
    const { result } = resolve("hexTwinBars", UF_COLUMNS, ufRows, mapped);
    if (result.view.chart !== "hexTwinBars") throw new Error();
    const { layout } = result.view;
    // 13,01 radii wide with the regions apart by 0,6, plus the margins
    expect(result.figure.width).toBe(633.5);
    expect(layout.types).toEqual(["Estadual", "Municipal"]);
    expect(layout.data).toHaveLength(4);
    expect(layout.data[0].bars.map((b) => b.type)).toEqual([
      "Estadual",
      "Municipal",
    ]);
    expect(layout.data[0].threshold).toBeUndefined();
  });

  it("takes the first bar and the reference line from the options", () => {
    const { spec } = resolve("hexTwinBars", UF_COLUMNS, ufRows, mapped);
    let next = setOption(spec, "firstType", "Municipal", defaultRegistry).spec;
    next = setOption(next, "threshold", 0.12, defaultRegistry).spec;
    const result = resolveChart(
      next,
      coerceRows(ufRows, UF_COLUMNS, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "hexTwinBars")
      throw new Error();
    const { layout } = result.view;
    expect(layout.types).toEqual(["Municipal", "Estadual"]);
    const sp = layout.data.find((d) => d.key === "SP")!;
    expect(sp.threshold).toBeDefined();
    expect(sp.bars.map((b) => b.isOverThreshold)).toEqual([true, false]);
  });

  it("explains that it takes at most two types", () => {
    const rows = ["A", "B", "C"].map((Escala) => ({
      UF: "SP",
      Escala,
      valor: "1",
    }));
    expect(() => resolve("hexTwinBars", UF_COLUMNS, rows, mapped)).toThrow(
      /até dois tipos por UF; a coluna escolhida tem 3/,
    );
  });

  it("warns when the bars don't fit the tiles", () => {
    const { spec } = resolve("hexTwinBars", UF_COLUMNS, ufRows, mapped);
    const narrow = resolveChart(
      { ...spec, style: { ...spec.style, width: 381.7 } },
      coerceRows(ufRows, UF_COLUMNS, ","),
      defaultRegistry,
    );
    if (narrow.status !== "ready") throw new Error();
    expect(narrow.warnings.join(" ")).toMatch(/barras estão largas demais/);
  });
});

describe("drawing-only options", () => {
  it("don't reach the layout: it is the same with or without them", () => {
    const { spec } = resolve("lineSeries", SERIES, seriesRows, {
      series: "setor",
    });
    const rows = coerceRows(seriesRows, SERIES, ",");
    let styled = setOption(spec, "valueLabels", "all", defaultRegistry).spec;
    styled = setOption(styled, "highlight", "Cultura", defaultRegistry).spec;
    styled = setOption(styled, "accentEnd", ["Cultura"], defaultRegistry).spec;
    const plain = resolveChart(spec, rows, defaultRegistry);
    const drawn = resolveChart(styled, rows, defaultRegistry);
    if (plain.status !== "ready" || drawn.status !== "ready") throw new Error();
    expect(JSON.stringify(drawn.view.layout)).toBe(
      JSON.stringify(plain.view.layout),
    );
  });

  it("are the ones a chart marks, and every layout option stays out of them", () => {
    const drawingOnly = (chart: ChartId) =>
      (defaultRegistry.require(chart).options ?? [])
        .filter((o) => o.drawingOnly)
        .map((o) => o.id);
    expect(drawingOnly("lineSeries")).toEqual([
      "valueLabels",
      "highlight",
      "accentEnd",
    ]);
    expect(drawingOnly("lineBubbleRow")).toEqual([
      "valueLabels",
      "accentEnd",
      "invertColors",
      "caption",
      "endNote",
    ]);
    expect(drawingOnly("horizontalBars")).toEqual([]);
    expect(drawingOnly("hexChoropleth")).toEqual([
      "ramp",
      "rampOrder",
      "legendValues",
    ]);
    expect(drawingOnly("hexTwinBars")).toEqual([
      "accentOver",
      "thresholdName",
      "legend",
    ]);
  });
});
