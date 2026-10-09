import * as d3 from "d3";
import { describe, expect, it } from "vitest";
import { barGroupLayout } from "./barGroupLayout";

type Row = { region: string; a: number; b: number };
const data: Row[] = [
  { region: "N", a: 10, b: 30 },
  { region: "S", a: -20, b: 0 },
];
const xScale = d3.scaleBand<string>().domain(["N", "S"]).range([0, 200]);
const yScale = d3.scaleLinear().domain([-40, 40]).range([400, 0]);
const config = { keys: ["a", "b"] as const, getCategory: (d: Row) => d.region, xScale, yScale };

describe("barGroupLayout", () => {
  it("places each key side by side from the zero line", () => {
    const [north] = barGroupLayout(data, { ...config, groupPadding: 0 }).groups;
    expect(north.bars.map((b) => [b.x, b.width, b.y, b.height])).toEqual([
      [0, 50, 150, 50],
      [50, 50, 50, 150],
    ]);
  });

  it("grows a negative value below the zero line", () => {
    const [, south] = barGroupLayout(data, { ...config, groupPadding: 0 }).groups;
    expect(south.bars[0]).toMatchObject({ y: 200, height: 100, value: -20 });
  });

  it("returns layout items per category and per bar", () => {
    const layout = barGroupLayout(data, config);
    expect(layout).toMatchObject({ width: 200, height: 400 });
    expect(layout.groups[1]).toMatchObject({ key: "S", index: 1, data: data[1], category: "S" });
    expect(layout.groups[1].bars[1]).toMatchObject({ key: "S:b", series: "b", data: data[1] });
  });

  it("takes groupPadding from the theme when the config leaves it unset", () => {
    const tight = barGroupLayout(data, { ...config, theme: { barGroup: { groupPadding: 0 } } });
    expect(tight.groups[0].bars[0].width).toBe(50);
    const own = barGroupLayout(data, { ...config, groupPadding: 0, theme: { barGroup: { groupPadding: 0.5 } } });
    expect(own.groups[0].bars[0].width).toBe(50);
  });
});
