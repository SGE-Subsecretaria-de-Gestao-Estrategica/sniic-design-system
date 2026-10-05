import { describe, expect, it } from "vitest";
import { defaultRegistry } from "../registry";
import { resolveChart } from "../resolve/resolveChart";
import { createSpec, setChart } from "../spec/spec";
import { blockingReason, canEnter, stepStatuses } from "./steps";

const table = { columns: ["a"], rows: [{ a: "1" }] };

describe("stepStatuses", () => {
  it("explains what each step is missing", () => {
    const spec = createSpec();
    const statuses = stepStatuses({
      table: null,
      chart: spec.chart,
      resolution: resolveChart(spec, [], defaultRegistry),
    });
    expect(statuses.map((s) => [s.id, s.done, s.reason])).toEqual([
      ["data", false, "Carregue um arquivo CSV."],
      ["chart", false, "Escolha um gráfico."],
      ["mapping", false, "Escolha um gráfico."],
      ["style", false, "Escolha um gráfico."],
    ]);
  });

  it("names the channels still to map", () => {
    const spec = setChart(createSpec(), "horizontalBars", defaultRegistry).spec;
    const resolution = resolveChart(spec, [{ a: 1 }], defaultRegistry);
    const mapping = stepStatuses({ table, chart: spec.chart, resolution })[2];
    expect(mapping.reason).toBe("Escolha uma coluna para: Categoria, Valor.");
  });

  it("blocks on a mapping error, but not on a size the style step can fix", () => {
    const failed = {
      status: "error",
      definition: null,
      message: "Duas séries.",
    } as const;
    const statusOf = (step: "mapping" | "style") =>
      stepStatuses({
        table,
        chart: "horizontalBars",
        resolution: { ...failed, step },
      })[2];
    expect(statusOf("mapping")).toMatchObject({
      done: false,
      reason: "Duas séries.",
    });
    expect(statusOf("style")).toMatchObject({ done: true, reason: null });
  });
});

describe("canEnter", () => {
  it("needs every earlier step done", () => {
    const spec = createSpec();
    const statuses = stepStatuses({
      table,
      chart: spec.chart,
      resolution: resolveChart(spec, [], defaultRegistry),
    });
    expect(canEnter(statuses, "data")).toBe(true);
    expect(canEnter(statuses, "chart")).toBe(true);
    expect(canEnter(statuses, "mapping")).toBe(false);
  });
});

describe("blockingReason", () => {
  it("gives the reason of the first earlier step that isn't done", () => {
    const spec = createSpec();
    const resolution = resolveChart(spec, [], defaultRegistry);
    const statuses = stepStatuses({
      table: null,
      chart: spec.chart,
      resolution,
    });
    expect(blockingReason(statuses, "data")).toBeNull();
    expect(blockingReason(statuses, "chart")).toBe("Carregue um arquivo CSV.");
    expect(blockingReason(statuses, "style")).toBe("Carregue um arquivo CSV.");
  });
});
