import * as d3 from "d3";
import { describe, expect, it } from "vitest";
import { barGroupLayout } from "../barGroup";
import { barStackLayout } from "./barStackLayout";

type Row = { region: string; a: number; b: number };
const data: Row[] = [
  { region: "N", a: 10, b: 30 },
  { region: "S", a: 20, b: 0 },
];
const xScale = d3.scaleBand<string>().domain(["N", "S"]).range([0, 200]);
const yScale = d3.scaleLinear().domain([0, 40]).range([400, 0]);

describe("barStackLayout", () => {
  it("stacks each key on the previous one", () => {
    const [a, b] = barStackLayout(data, { keys: ["a", "b"], category: (d) => d.region, xScale, yScale });
    expect(a.bars[0]).toMatchObject({ x: 0, y: 300, width: 100, height: 100, value: 10 });
    expect(b.bars[0]).toMatchObject({ x: 0, y: 0, width: 100, height: 300, value: 30 });
  });

  it("leaves colour unset unless a colour accessor is given", () => {
    const keys: ("a" | "b")[] = ["a", "b"];
    expect(barStackLayout(data, { keys, category: (d) => d.region, xScale, yScale })[0].color).toBeUndefined();
    const coloured = barStackLayout(data, { keys, category: (d) => d.region, xScale, yScale, color: (k) => `c-${k}` });
    expect(coloured[1].bars[0].color).toBe("c-b");
  });
});

describe("barGroupLayout", () => {
  it("places each key side by side from the zero line", () => {
    const [north] = barGroupLayout(data, {
      keys: ["a", "b"],
      category: (d) => d.region,
      xScale,
      yScale,
      groupPadding: 0,
    });
    expect(north.bars.map((b) => [b.x, b.width, b.y, b.height])).toEqual([
      [0, 50, 300, 100],
      [50, 50, 100, 300],
    ]);
  });
});
