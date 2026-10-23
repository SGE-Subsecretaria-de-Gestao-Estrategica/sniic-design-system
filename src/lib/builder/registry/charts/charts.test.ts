import { describe, expect, it } from "vitest";
import { coerceRows } from "../../data/coerce";
import type { ColumnSchema, RawRow } from "../../data/types";
import { defaultRegistry } from "..";
import type { ChartId } from "../layouts";
import { resolveChart } from "../../resolve/resolveChart";
import type { JsonValue } from "../../spec/types";
import { MANUAL } from "../options";
import {
  autoEncode,
  createSpec,
  setChart,
  setData,
  setEncoding,
  setOption,
  setParam,
  setStyle,
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

  it("splits into one panel per value of the panel column", () => {
    const columns: ColumnSchema[] = [...SERIES, { name: "regiao", type: "text" }];
    const raw = ["Norte", "Sul"].flatMap((regiao) =>
      seriesRows.map((row) => ({ ...row, regiao })),
    );
    const { result } = resolve("lineSeries", columns, raw, {
      series: "setor",
      panel: "regiao",
    });
    if (result.view.chart !== "lineSeries") throw new Error();
    const { layout } = result.view;
    expect(layout.isPaneled).toBe(true);
    expect(layout.panels.map((p) => p.key)).toEqual(["Norte", "Sul"]);
    expect(layout.series).toHaveLength(4);
    expect(result.combined).toBe(0);
  });

  it("orders the panels as in the file, or by hand", () => {
    const columns: ColumnSchema[] = [...SERIES, { name: "regiao", type: "text" }];
    const raw = ["Norte", "Sul", "Sudeste"].flatMap((regiao) =>
      seriesRows.map((row) => ({ ...row, regiao })),
    );
    const { spec } = resolve("lineSeries", columns, raw, {
      series: "setor",
      panel: "regiao",
    });
    const rows = coerceRows(raw, columns, ",");
    const panelsOf = (next: typeof spec) => {
      const resolved = resolveChart(next, rows, defaultRegistry);
      if (resolved.status !== "ready" || resolved.view.chart !== "lineSeries")
        throw new Error();
      return resolved.view.layout.panels.map((p) => p.key);
    };
    expect(panelsOf(spec)).toEqual(["Norte", "Sul", "Sudeste"]);
    let manual = setOption(spec, "panelSort", MANUAL, defaultRegistry).spec;
    manual = setOption(
      manual,
      "panelOrder",
      ["Sudeste", "Norte", "Sul"],
      defaultRegistry,
    ).spec;
    expect(panelsOf(manual)).toEqual(["Sudeste", "Norte", "Sul"]);
    // Back to the file's order, the manual list is kept but not used.
    const file = setOption(manual, "panelSort", "file", defaultRegistry).spec;
    expect(panelsOf(file)).toEqual(["Norte", "Sul", "Sudeste"]);
  });

  it("lets each panel keep its own y domain", () => {
    const columns: ColumnSchema[] = [...SERIES, { name: "regiao", type: "text" }];
    const raw = ["Norte", "Sul"].flatMap((regiao, r) =>
      seriesRows.map((row) => ({
        ...row,
        valor: String(Number(row.valor) * (r + 1)),
        regiao,
      })),
    );
    const { spec } = resolve("lineSeries", columns, raw, {
      series: "setor",
      panel: "regiao",
    });
    const rows = coerceRows(raw, columns, ",");
    const domains = (sharedY: boolean) => {
      const next = setOption(spec, "panelSharedY", sharedY, defaultRegistry).spec;
      const resolved = resolveChart(next, rows, defaultRegistry);
      if (resolved.status !== "ready" || resolved.view.chart !== "lineSeries")
        throw new Error();
      return resolved.view.layout.panels.map((p) => p.yScale.domain());
    };
    const [a, b] = domains(true);
    expect(a).toEqual(b);
    const [c, d] = domains(false);
    expect(c).not.toEqual(d);
  });
});

describe("heatmap", () => {
  const TIDY: ColumnSchema[] = [
    { name: "regiao", type: "text" },
    { name: "ano", type: "number" },
    { name: "valor", type: "number" },
  ];
  const tidy = ["Sul", "Norte"].flatMap((regiao, r) =>
    [2021, 2019, 2020].map((ano, i) => ({
      regiao,
      ano: String(ano),
      valor: String(10 * r + i),
    })),
  );

  it("pivots the tidy rows into a grid, years ascending", () => {
    const { result } = resolve("heatmap", TIDY, tidy, {
      row: "regiao",
      column: "ano",
      value: "valor",
    });
    if (result.view.chart !== "heatmap") throw new Error();
    const { layout } = result.view;
    expect(layout.rows.map((r) => r.key)).toEqual(["Sul", "Norte"]);
    expect(layout.columns.map((c) => c.key)).toEqual(["2019", "2020", "2021"]);
    expect(layout.cells).toHaveLength(6);
    expect(layout.cells.every((c) => c.value !== null)).toBe(true);
  });

  it("orders the rows by hand", () => {
    const { spec } = resolve("heatmap", TIDY, tidy, {
      row: "regiao",
      column: "ano",
      value: "valor",
    });
    let manual = setOption(spec, "rowSort", MANUAL, defaultRegistry).spec;
    manual = setOption(manual, "rowOrder", ["Norte", "Sul"], defaultRegistry).spec;
    const resolved = resolveChart(
      manual,
      coerceRows(tidy, TIDY, ","),
      defaultRegistry,
    );
    if (resolved.status !== "ready" || resolved.view.chart !== "heatmap")
      throw new Error();
    expect(resolved.view.layout.rows.map((r) => r.key)).toEqual(["Norte", "Sul"]);
  });
});

const COVERAGE: ColumnSchema[] = [
  { name: "categoria", type: "text" },
  { name: "cobertura", type: "number" },
  { name: "recorte", type: "text" },
];
const coverageRows = [
  { categoria: "Estadual", cobertura: "99,4", recorte: "Rede" },
  { categoria: "Privada", cobertura: "96,6", recorte: "Rede" },
  { categoria: "Fundamental", cobertura: "99,0", recorte: "Etapa" },
  { categoria: "Médio", cobertura: "98,7", recorte: "Etapa" },
];

describe("coverageDots", () => {
  it("splits the rows into a block per recorte, on an axis that starts near the data", () => {
    const { result } = resolve("coverageDots", COVERAGE, coverageRows, { group: "recorte" });
    if (result.view.chart !== "coverageDots") throw new Error();
    const { blocks, truncated, valueScale } = result.view.layout;
    expect(blocks.map((b) => b.label)).toEqual(["Rede", "Etapa"]);
    expect(blocks[0].rows.map((r) => r.category)).toEqual(["Estadual", "Privada"]);
    expect(truncated).toBe(true);
    expect(valueScale.domain()[0]).toBeGreaterThan(90);
  });

  it("draws a single unnamed block when no recorte is mapped", () => {
    const { result } = resolve("coverageDots", COVERAGE, coverageRows);
    if (result.view.chart !== "coverageDots") throw new Error();
    expect(result.view.layout.blocks).toHaveLength(1);
    expect(result.view.layout.blocks[0].header).toBeNull();
  });

  it("takes the reference and a pinned axis end from the options", () => {
    const { spec } = resolve("coverageDots", COVERAGE, coverageRows, { group: "recorte" });
    let next = setOption(spec, "reference", 98.8, defaultRegistry).spec;
    next = setOption(next, "domainMax", 100, defaultRegistry).spec;
    const resolved = resolveChart(next, coerceRows(coverageRows, COVERAGE, ","), defaultRegistry);
    if (resolved.status !== "ready" || resolved.view.chart !== "coverageDots") throw new Error();
    expect(resolved.view.layout.reference?.value).toBe(98.8);
    expect(resolved.view.layout.valueScale.domain()[1]).toBe(100);
  });

  it("solves the row thickness from a set height", () => {
    const { spec } = resolve("coverageDots", COVERAGE, coverageRows, { group: "recorte" });
    const next = setStyle(spec, { height: 500 }, defaultRegistry).spec;
    const resolved = resolveChart(next, coerceRows(coverageRows, COVERAGE, ","), defaultRegistry);
    if (resolved.status !== "ready" || resolved.view.chart !== "coverageDots") throw new Error();
    expect(resolved.view.layout.height).toBeCloseTo(
      500 - resolved.margin.top - resolved.margin.bottom,
    );
    expect(resolved.solved.rowThickness).toBeGreaterThan(0);
  });
});

const PARTITION: ColumnSchema[] = [
  { name: "parte", type: "text" },
  { name: "pedaco", type: "text" },
  { name: "escolas", type: "number" },
  { name: "escopo", type: "text" },
];
const partitionRows = [
  { parte: "Sem biblioteca", pedaco: "Sem biblioteca", escolas: "114.018", escopo: "Brasil" },
  { parte: "Com biblioteca", pedaco: "Com profissional", escolas: "28.937", escopo: "Brasil" },
  { parte: "Com biblioteca", pedaco: "Sem profissional", escolas: "37.585", escopo: "Brasil" },
];

describe("partitionBars", () => {
  it("draws a row per part when only part and value are mapped", () => {
    const { result } = resolve("partitionBars", PARTITION, partitionRows);
    if (result.view.chart !== "partitionBars") throw new Error();
    const { rows, blocks } = result.view.layout;
    expect(blocks).toHaveLength(1);
    expect(rows.map((r) => [r.kind, r.label])).toEqual([
      ["part", "Sem biblioteca"],
      ["part", "Com biblioteca"],
    ]);
    expect(rows[0].share).toBeCloseTo(0.632, 3);
  });

  it("adds a row per mapped piece under its part; a piece named like its part is the part itself", () => {
    const { result } = resolve("partitionBars", PARTITION, partitionRows, { subpart: "pedaco" });
    if (result.view.chart !== "partitionBars") throw new Error();
    const { rows } = result.view.layout;
    expect(rows.map((r) => r.label)).toEqual([
      "Sem biblioteca",
      "Com biblioteca",
      "Com profissional",
      "Sem profissional",
    ]);
    expect(rows[3].share).toBeCloseTo(0.565, 3);
    expect(rows[3].trackLength).toBeCloseTo(rows[1].barLength);
  });

  it("names a block per whole when the whole is mapped", () => {
    const { result } = resolve("partitionBars", PARTITION, partitionRows, { category: "escopo" });
    if (result.view.chart !== "partitionBars") throw new Error();
    expect(result.view.layout.blocks.map((b) => b.label)).toEqual(["Brasil"]);
    expect(result.view.layout.blocks[0].header).not.toBeNull();
  });

  it("takes the figure's height from the layout", () => {
    const { result } = resolve("partitionBars", PARTITION, partitionRows, { subpart: "pedaco" });
    if (result.view.chart !== "partitionBars") throw new Error();
    expect(result.figure.height).toBeCloseTo(
      result.view.layout.height + result.margin.top + result.margin.bottom,
      0,
    );
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

  it("pins either end of the x domain, keeping the other automatic", () => {
    const { spec, result } = resolve("rangeRows", GROUPED, groupedRows);
    if (result.view.chart !== "rangeRows") throw new Error();
    // Automatic: 1000–3200 padded by 10% of the range on each side.
    expect(result.view.layout.valueScale.domain()).toEqual([780, 3420]);

    const rows = coerceRows(groupedRows, GROUPED, ",");
    const withOptions = (options: Record<string, number>) => {
      let next = spec;
      for (const [id, value] of Object.entries(options)) {
        next = setOption(next, id, value, defaultRegistry).spec;
      }
      const resolved = resolveChart(next, rows, defaultRegistry);
      if (resolved.status !== "ready" || resolved.view.chart !== "rangeRows")
        throw new Error();
      return {
        domain: resolved.view.layout.valueScale.domain(),
        warnings: resolved.warnings,
      };
    };

    const fromZero = withOptions({ domainMin: 0 });
    expect(fromZero.domain).toEqual([0, 3420]);
    expect(fromZero.warnings).toEqual([]);

    const both = withOptions({ domainMin: 0, domainMax: 5000 });
    expect(both.domain).toEqual([0, 5000]);

    const clipped = withOptions({ domainMax: 2000 });
    expect(clipped.warnings.join(" ")).toMatch(/fora do intervalo/);

    const inverted = withOptions({ domainMin: 4000, domainMax: 1000 });
    expect(inverted.domain).toEqual([780, 3420]);
    expect(inverted.warnings.join(" ")).toMatch(/precisa ser menor/);
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

  it("lists one colour per group, the main one first", () => {
    const { spec } = resolve("bubbleColumns", GROUPED, groupedRows, {
      group: "sexo",
    });
    const rows = coerceRows(groupedRows, GROUPED, ",");
    const result = resolveChart(
      setOption(spec, "mainGroup", "Masculino", defaultRegistry).spec,
      rows,
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "bubbleColumns")
      throw new Error();
    const option = defaultRegistry
      .require("bubbleColumns")
      .options!.find((o) => o.id === "groupColors")!;
    if (option.kind !== "colors") throw new Error();
    expect(option.current(result.view.layout)).toEqual(["Masculino", "Feminino"]);
    expect(option.automatic).toBe("mainRamp");
    expect(option.ramps).toBe(true);
    expect(option.drawingOnly).toBe(true);
    const stored = setOption(
      spec,
      "groupColors",
      { Feminino: "ramp-secondary" },
      defaultRegistry,
    ).spec.style.options.groupColors;
    expect(stored).toEqual({ Feminino: "ramp-secondary" });
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

describe("rankedRibbons", () => {
  const view = (spec: ReturnType<typeof resolve>["spec"], raw = seriesRows) => {
    const result = resolveChart(spec, coerceRows(raw, SERIES, ","), defaultRegistry);
    if (result.status !== "ready" || result.view.chart !== "rankedRibbons")
      throw new Error(JSON.stringify(result));
    return result;
  };

  it("ranks the series at each year, the largest on top", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const { layout } = view(spec).view as Extract<
      ReturnType<typeof view>["view"],
      { chart: "rankedRibbons" }
    >;
    expect(layout.series).toEqual(["Cultura", "Agricultura"]);
    expect(layout.columns.map((c) => c.slots.at(-1)!.series)).toEqual([
      "Agricultura",
      "Agricultura",
      "Agricultura",
    ]);
  });

  it("keeps room for the totals only while they are shown", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const topOf = (s: typeof spec) => {
      const v = view(s).view;
      if (v.chart !== "rankedRibbons") throw new Error();
      return Math.min(...v.layout.columns.map((c) => c.top));
    };
    const withTotals = setOption(spec, "totals", true, defaultRegistry).spec;
    expect(topOf(spec)).toBeCloseTo(0);
    expect(topOf(withTotals)).toBeGreaterThan(0);
  });

  it("leaves the ribbon gap between bands", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const v = view(setParam(spec, "ribbonGap", 6, defaultRegistry).spec).view;
    if (v.chart !== "rankedRibbons") throw new Error();
    const [lower, upper] = v.layout.columns[0].slots;
    expect(lower.y0 - upper.y1).toBeCloseTo(6);
  });

  it("puts the largest at the bottom, or keeps one order, as chosen", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const tops = (s: typeof spec) => {
      const v = view(s).view;
      if (v.chart !== "rankedRibbons") throw new Error();
      return v.layout.columns.map((c) => c.slots.at(-1)!.series);
    };
    const set = (s: typeof spec, id: string, value: JsonValue) =>
      setOption(s, id, value, defaultRegistry).spec;
    expect(tops(set(spec, "rankDirection", "largestAtBottom"))).toEqual([
      "Cultura",
      "Cultura",
      "Cultura",
    ]);
    const fixed = set(spec, "ranked", false);
    expect(tops(fixed)).toEqual(["Cultura", "Cultura", "Cultura"]);
    const manual = set(
      set(fixed, "stackSort", MANUAL),
      "stackOrder",
      ["Agricultura", "Cultura"],
    );
    expect(tops(manual)).toEqual(["Agricultura", "Agricultura", "Agricultura"]);
    // The manual order only counts while the ribbons aren't ranked.
    expect(tops(set(manual, "ranked", true))).toEqual(tops(spec));
  });

  it("lists the colours as the last year stacks, keeping the automatic colours by series", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const v = view(setOption(spec, "rankDirection", "largestAtBottom", defaultRegistry).spec).view;
    if (v.chart !== "rankedRibbons") throw new Error();
    const option = defaultRegistry
      .require("rankedRibbons")
      .options!.find((o) => o.id === "seriesColors")!;
    if (option.kind !== "colors") throw new Error();
    expect(option.current(v.layout)).toEqual(["Cultura", "Agricultura"]);
    expect(option.listed!(v.layout)).toEqual(["Cultura", "Agricultura"]);
    expect(option.listed!(view(spec).view.layout as never)).toEqual(["Agricultura", "Cultura"]);
  });

  it("warns that negative values count as zero", () => {
    const raw = seriesRows.map((r, i) => (i === 0 ? { ...r, valor: "-5" } : r));
    const { spec } = resolve("rankedRibbons", SERIES, raw);
    expect(view(spec, raw).warnings.join(" ")).toMatch(/1 valor negativo/);
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

  it("splits the ribbons too, bridging them across the break", () => {
    const { spec } = resolve("rankedRibbons", LONG, longRows);
    const broken = layoutOf(
      "rankedRibbons",
      setOption(spec, "raisBreak", true, defaultRegistry).spec,
    );
    if (broken.chart !== "rankedRibbons") throw new Error();
    expect(broken.layout.xAxis.segments.map((s) => s.ticks)).toEqual([
      [2019, 2020, 2021],
      [2022, 2023],
    ]);
    expect(broken.layout.ribbons.every((r) => r.bridges.length === 1)).toBe(true);
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

describe("hexCategorical", () => {
  const columns: ColumnSchema[] = [
    { name: "UF", type: "uf" },
    { name: "estagio", type: "text" },
  ];
  const rows = [
    { UF: "AC", estagio: "Em adesão" },
    { UF: "SP", estagio: "Aderiu" },
    { UF: "RJ", estagio: "Aderiu" },
    { UF: "DF", estagio: "Não aderiu" },
  ];

  it("gives each state its category, with the legend under the map", () => {
    const { result } = resolve("hexCategorical", columns, rows);
    if (result.view.chart !== "hexCategorical") throw new Error();
    const { layout } = result.view;
    expect(layout.categories).toEqual(["Em adesão", "Aderiu", "Não aderiu"]);
    expect(layout.counts).toEqual([1, 2, 1]);
    expect(layout.data.map((d) => [d.key, d.categoryIndex])).toEqual([
      ["AC", 0],
      ["SP", 1],
      ["RJ", 1],
      ["DF", 2],
    ]);
    expect(layout.width).toBeCloseTo(12.5 * 22);
    expect(layout.legendTop).toBe(layout.mapHeight + 16);
    expect(layout.height).toBe(layout.legendTop + 3 * 20);
    expect(result.warnings.join(" ")).toMatch(/^Sem dados para: AL, AM, AP/);
  });

  it("takes a manual order of the categories", () => {
    const { spec } = resolve("hexCategorical", columns, rows);
    let next = setOption(spec, "sort", MANUAL, defaultRegistry).spec;
    next = setOption(
      next,
      "categoryOrder",
      ["Não aderiu", "Em adesão", "Aderiu"],
      defaultRegistry,
    ).spec;
    const result = resolveChart(
      next,
      coerceRows(rows, columns, ","),
      defaultRegistry,
    );
    if (result.status !== "ready" || result.view.chart !== "hexCategorical")
      throw new Error();
    expect(result.view.layout.categories).toEqual([
      "Não aderiu",
      "Em adesão",
      "Aderiu",
    ]);
  });

  it("combines repeated rows, and explains a state with two categories", () => {
    const { result } = resolve("hexCategorical", columns, [
      ...rows,
      { UF: "SP", estagio: "Aderiu" },
    ]);
    expect(result.combined).toBe(1);
    expect(() =>
      resolve("hexCategorical", columns, [
        ...rows,
        { UF: "SP", estagio: "Em adesão" },
      ]),
    ).toThrow(/A UF SP aparece com mais de uma categoria \(Aderiu e Em adesão\)/);
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
    styled = setOption(styled, "seriesColors", { Cultura: "gradient-3" }, defaultRegistry).spec;
    const plain = resolveChart(spec, rows, defaultRegistry);
    const drawn = resolveChart(styled, rows, defaultRegistry);
    if (plain.status !== "ready" || drawn.status !== "ready") throw new Error();
    expect(JSON.stringify(drawn.view.layout)).toBe(
      JSON.stringify(plain.view.layout),
    );
  });

  it("leave the ribbons' layout alone too", () => {
    const { spec } = resolve("rankedRibbons", SERIES, seriesRows);
    const rows = coerceRows(seriesRows, SERIES, ",");
    let styled = setOption(spec, "valueLabels", "ends", defaultRegistry).spec;
    styled = setOption(styled, "seriesColors", { Cultura: "accent" }, defaultRegistry).spec;
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
      "seriesColors",
    ]);
    expect(drawingOnly("lineBubbleRow")).toEqual([
      "valueLabels",
      "accentEnd",
      "invertColors",
      "caption",
      "endNote",
    ]);
    expect(drawingOnly("horizontalBars")).toEqual([]);
    expect(drawingOnly("rankedRibbons")).toEqual([
      "valueLabels",
      "seriesColors",
    ]);
    expect(drawingOnly("hexChoropleth")).toEqual([
      "rampKind",
      "ramp",
      "rampOrder",
      "rampBase",
      "rampTarget",
      "rampBaseOrder",
      "legendValues",
    ]);
    expect(drawingOnly("coverageDots")).toEqual(["referenceName"]);
    expect(drawingOnly("partitionBars")).toEqual(["pieceSuffix"]);
    expect(drawingOnly("hexTwinBars")).toEqual([
      "accentOver",
      "thresholdName",
      "legend",
    ]);
    expect(drawingOnly("hexCategorical")).toEqual([
      "colorScale",
      "ramp",
      "categoryColors",
      "legendCounts",
    ]);
  });
});
