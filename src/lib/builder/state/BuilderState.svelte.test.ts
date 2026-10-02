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
    expect(state.spec.data).toMatchObject({ fileName: "dados.csv", delimiter: ";", decimal: "," });
    expect(state.spec.data.columns.map((c) => c.type)).toEqual(["text", "number", "number"]);
    expect(state.rows[0]).toEqual({ domínio: "Música", total: 1234.5, ano: 2019 });
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
    state.apply(setEncoding(state.spec, "value", ["total"], state.registry));

    state.setColumnType("ano", "date");
    expect(state.spec.data.columns[2]).toEqual({ name: "ano", type: "date", datePattern: "yyyy" });
    expect(state.rows[0].ano).toEqual(new Date(2019, 0, 1));

    state.setColumnType("total", "text");
    expect(state.reset).toEqual([{ channel: "value", column: "total", reason: "type-mismatch" }]);
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
    expect(state.spec.encoding).toEqual({ category: ["domínio"], value: ["total"] });
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
    state.setSize("width", 800.4);
    expect(state.spec.style.width).toBe(800);
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
    expect(state.reset.map((r) => r.reason)).toEqual(["column-removed", "column-removed"]);
    expect(state.spec.encoding).toEqual({ category: ["uf"], value: ["valor"] });
  });

  it("doesn't swap in another column when a type edit clears a mapping", async () => {
    const state = new BuilderState();
    await state.loadFile(latin1File(CSV));
    state.setChart("horizontalBars");
    expect(state.spec.encoding.value).toEqual(["total"]);

    state.setColumnType("total", "text");
    expect(state.spec.encoding.value).toBeUndefined();
    expect(state.reset).toEqual([{ channel: "value", column: "total", reason: "type-mismatch" }]);
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
});
