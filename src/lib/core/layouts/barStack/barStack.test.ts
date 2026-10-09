import * as d3 from "d3";
import { describe, expect, it } from "vitest";
import { barStackLayout } from "./barStackLayout";

type Row = { region: string; a: number; b: number };
const data: Row[] = [
  { region: "N", a: 10, b: 30 },
  { region: "S", a: 20, b: 0 },
];
const xScale = d3.scaleBand<string>().domain(["N", "S"]).range([0, 200]);
const yScale = d3.scaleLinear().domain([0, 40]).range([400, 0]);
const config = { keys: ["a", "b"] as const, getCategory: (d: Row) => d.region, xScale, yScale };

describe("barStackLayout", () => {
  it("stacks each key on the previous one", () => {
    const { series } = barStackLayout(data, config);
    const [a, b] = series;
    expect(a.bars[0]).toMatchObject({ x: 0, y: 300, width: 100, height: 100, value: 10 });
    expect(b.bars[0]).toMatchObject({ x: 0, y: 0, width: 100, height: 300, value: 30 });
  });

  it("returns a box spanning both scales' ranges", () => {
    expect(barStackLayout(data, config)).toMatchObject({ width: 200, height: 400 });
  });

  it("makes every bar a layout item carrying its datum", () => {
    const bar = barStackLayout(data, config).series[1].bars[1];
    expect(bar).toMatchObject({ key: "b:S", index: 1, data: data[1], series: "b", category: "S" });
  });
});
