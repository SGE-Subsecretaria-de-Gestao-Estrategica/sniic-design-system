import { describe, expect, it } from "vitest";
import { setChart, setEncoding, SIZE_LIMITS } from "../spec/spec";
import { BuilderState } from "./BuilderState.svelte";

const latin1File = (text: string, name = "dados.csv") =>
  new File([Uint8Array.from(text, (c) => c.charCodeAt(0))], name);

// Ten rows, one "n/d": 90% of `total` parses, enough to type it as a number.
const CSV = [
  "domínio;total;ano",
  "Música;1.234,5;2019",
  "Teatro;n/d;2020",
  ...Array.from({ length: 8 }, (_, i) => `Domínio ${i};${800 + i};${2021 + i}`),
].join("\n");

describe("BuilderState", () => {
  it("loads a file and detects separator, decimal and types", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));

    expect(state.error).toBeNull();
    expect(state.source?.encoding).toBe("windows-1252");
    expect(state.spec.data).toMatchObject({
      fileName: "dados.csv",
      delimiter: ";",
      decimal: ",",
    });
    expect(state.spec.data.columns.map((c) => c.type)).toEqual([
      "text",
      "number",
      "number",
    ]);
    expect(state.rows[0]).toEqual({
      domínio: "Música",
      total: 1234.5,
      ano: 2019,
    });
    expect(state.issues.total).toEqual({ failed: 1, examples: ["n/d"] });
  });

  it("reports files it can't load and keeps the previous data", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    await state.loadFile(new File(["só cabeçalho"], "vazio.csv"));
    expect(state.error).toMatch(/linhas de dados/);
    expect(state.spec.data.fileName).toBe("dados.csv");
  });

  it("re-reads the table when the separator changes", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setDelimiter(",");
    expect(state.table?.columns).toEqual(["domínio;total;ano"]);
    state.setDelimiter(";");
    expect(state.table?.columns).toEqual(["domínio", "total", "ano"]);
  });

  it("re-infers types when the decimal changes, except ones the user set", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File("v;w\n1,5;1,5\n2,5;2,5"));
    state.setColumnType("w", "number");
    state.setDecimal(".");
    expect(state.spec.data.columns).toEqual([
      { name: "v", type: "text" },
      { name: "w", type: "number" },
    ]);
    expect(state.issues.w.failed).toBe(2);
  });

  it("guesses the date pattern and reports mappings a type change clears", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.apply(setChart(state.spec, "horizontalBars", state.registry));
    state.apply(setEncoding(state.spec, "value", "total", state.registry));

    state.setColumnType("ano", "date");
    expect(state.spec.data.columns[2]).toEqual({
      name: "ano",
      type: "date",
      datePattern: "yyyy",
    });
    expect(state.rows[0].ano).toEqual(new Date(2019, 0, 1));

    state.setColumnType("total", "text");
    expect(state.reset).toEqual([
      { channel: "value", column: "total", reason: "type-mismatch" },
    ]);
  });

  it("applies only the latest of overlapping uploads", async () => {
    class SlowFile extends File {
      override async arrayBuffer() {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return super.arrayBuffer();
      }
    }
    const state = new BuilderState();
    const slow = state.loadFile(new SlowFile(["a;b\n1;2"], "antigo.csv"));
    const fast = state.loadFile(latin1File(CSV, "novo.csv"));
    await Promise.all([slow, fast]);
    expect(state.spec.data.fileName).toBe("novo.csv");
  });

  it("walks the steps: gated until each step is done", async () => {
    const state = new BuilderState();
    expect(state.canEnter("chart")).toBe(false);
    state.goTo("chart");
    expect(state.step).toBe("data");

    await state.loadFile(latin1File(CSV));
    state.next();
    expect(state.step).toBe("chart");
    state.next();
    expect(state.step).toBe("chart");

    state.setChart("horizontalBars");
    expect(state.spec.encoding).toEqual({
      category: "domínio",
      value: "total",
    });
    expect(state.resolution.status).toBe("ready");
    state.next();
    state.next();
    expect(state.step).toBe("style");
    state.back();
    expect(state.step).toBe("mapping");
  });

  it("clamps sizes and accepts null for the default", async () => {
    const state = new BuilderState();
    state.setSize("width", 10);
    expect(state.spec.style.width).toBe(SIZE_LIMITS.min);
    state.setSize("width", 99999);
    expect(state.spec.style.width).toBe(SIZE_LIMITS.max);
    state.setSize("width", 581.14);
    expect(state.spec.style.width).toBe(581.1);
    state.setSize("width", Number.NaN);
    expect(state.spec.style.width).toBeNull();
  });

  it("changes the pillar and remaps after a new file", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setChart("horizontalBars");
    state.setPillar(6);
    expect(state.spec.style.pillar).toBe(6);

    await state.loadFile(latin1File("uf;valor\nSP;10\nRJ;20"));
    expect(state.reset.map((r) => r.reason)).toEqual([
      "column-removed",
      "column-removed",
    ]);
    expect(state.spec.encoding).toEqual({ category: "uf", value: "valor" });
  });

  it("doesn't swap in another column when a type edit clears a mapping", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setChart("horizontalBars");
    expect(state.spec.encoding.value).toBe("total");

    state.setColumnType("total", "text");
    expect(state.spec.encoding.value).toBeUndefined();
    expect(state.reset).toEqual([
      { channel: "value", column: "total", reason: "type-mismatch" },
    ]);
  });

  it("clears the reset notice when the step changes and explains blocked steps", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setChart("horizontalBars");
    state.setColumnType("total", "text");
    expect(state.reset).toHaveLength(1);
    expect(state.blocker("style")).toBe("Escolha uma coluna para: Valor.");

    state.goTo("chart");
    expect(state.step).toBe("chart");
    expect(state.reset).toEqual([]);
  });

  it("combines repeated keys the chosen way and keeps chart options", async () => {
    const state = new BuilderState();
    await state.loadFile(
      latin1File("domínio;total\nMúsica;10\nMúsica;30\nTeatro;5"),
    );
    state.setChart("horizontalBars");
    const values = () => {
      const { resolution } = state;
      if (
        resolution.status !== "ready" ||
        resolution.view.chart !== "horizontalBars"
      )
        throw new Error();
      return resolution.view.layout.bars.map((bar) => [
        bar.category,
        bar.value,
      ]);
    };
    expect(state.resolution).toMatchObject({ status: "ready", combined: 1 });
    expect(values()).toEqual([
      ["Música", 40],
      ["Teatro", 5],
    ]);

    state.setAggregate("mean");
    expect(values()).toEqual([
      ["Música", 20],
      ["Teatro", 5],
    ]);

    state.setOption("categoryOrder", ["Teatro", "Música"]);
    state.setOption("sort", "manual");
    expect(values().map(([category]) => category)).toEqual([
      "Teatro",
      "Música",
    ]);
    expect(() => state.setOption("mainGroup", "x")).toThrow(/Unknown option/);
  });

  it("on a chart change, only notes the columns that ended up unused", async () => {
    const state = new BuilderState();
    await state.loadFile(
      latin1File("setor;ano;valor\nA;2020;1\nB;2020;2\nA;2021;3\nB;2021;4"),
    );
    state.setChart("lineSeries");
    state.setEncoding("series", "setor");
    expect(state.spec.encoding).toEqual({
      x: "ano",
      y: "valor",
      series: "setor",
    });

    // Bars take setor and valor again; ano is the one left out.
    state.setChart("horizontalBars");
    expect(state.spec.encoding).toEqual({ category: "setor", value: "valor" });
    expect(state.reset.map((r) => r.column)).toEqual(["ano"]);
  });

  it("changes the margin preset and layout params", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setChart("horizontalBars");
    const ready = () => {
      if (state.resolution.status !== "ready")
        throw new Error(state.resolution.status);
      return state.resolution;
    };
    const height = ready().figure.height;

    state.setMargin("even");
    expect(ready().margin.left).toBe(24);
    state.setMargin(null);
    expect(ready().margin.left).toBe(150);

    state.setParam("barThickness", 16);
    expect(state.spec.style.params).toEqual({ barThickness: 16 });
    expect(ready().figure.height).toBeLessThan(height);
    state.setParam("barThickness", null);
    expect(ready().figure.height).toBe(height);
  });

  it("patches the number format without touching the rest", () => {
    const state = new BuilderState();
    state.setFormat({ decimals: 1, prefix: "R$ " });
    state.setFormat({ compact: true });
    expect(state.spec.style.format).toEqual({
      decimals: 1,
      compact: true,
      percent: false,
      prefix: "R$ ",
      suffix: "",
    });
    expect(() => state.setFormat({ decimals: 9 })).toThrow();
  });

  it("keeps a chart's extra formats apart from the main one", async () => {
    const state = new BuilderState();
    await state.loadFile(
      latin1File("ano;a;b\n2020;1;0,1\n2021;2;0,2\n2022;3;0,3"),
    );
    state.setChart("lineBubbleRow");
    state.setFormat({ percent: true, suffix: "%" }, "bubbles");
    expect(state.spec.style.formats.bubbles).toMatchObject({
      percent: true,
      suffix: "%",
      decimals: null,
    });
    expect(state.spec.style.format.percent).toBe(false);
    expect(() => state.setFormat({ compact: true }, "nope")).toThrow(
      /Unknown format/,
    );

    state.setChart("lineSeries");
    expect(state.spec.style.formats).toEqual({});
  });
});
