import { describe, expect, it } from "vitest";
import { segmentedAxisLayout } from "$lib/core/layouts/segmentedAxis";
import { segmentEndKeys, showsAllValues, tickLabeller } from "./lines";

const items = [2019, 2020, 2021, 2022, 2023].map((year) => ({
  key: String(year),
  xValue: year,
}));
const axisOf = (breaksAfter?: number[]) =>
  segmentedAxisLayout(items, {
    getX: (d) => d.xValue,
    width: 400,
    breaksAfter,
  });

describe("segmentEndKeys", () => {
  it("is the first and last item without a break", () => {
    expect([...segmentEndKeys(items, axisOf())]).toEqual(["2019", "2023"]);
  });

  it("is the first and last item of each side of a break, whatever the item order", () => {
    const shuffled = [items[3], items[0], items[4], items[2], items[1]];
    expect([...segmentEndKeys(shuffled, axisOf([2021]))].sort()).toEqual([
      "2019",
      "2021",
      "2022",
      "2023",
    ]);
  });

  it("is empty without items", () => {
    expect(segmentEndKeys([], axisOf()).size).toBe(0);
  });
});

describe("showsAllValues", () => {
  it("follows the option, or the chart's default", () => {
    expect(showsAllValues({}, "ends")).toBe(false);
    expect(showsAllValues({}, "all")).toBe(true);
    expect(showsAllValues({ valueLabels: "ends" }, "all")).toBe(false);
  });
});

describe("tickLabeller", () => {
  const label = (ticks: (Date | number)[]) => ticks.map(tickLabeller(ticks));

  it("writes yearly dates as years", () => {
    expect(label([new Date(2021, 0, 1), new Date(2022, 0, 1)])).toEqual([
      "2021",
      "2022",
    ]);
  });

  it("writes monthly and daily dates in numbers, never as English names", () => {
    expect(label([new Date(2021, 0, 1), new Date(2021, 1, 1)])).toEqual([
      "01/2021",
      "02/2021",
    ]);
    expect(label([new Date(2021, 1, 1), new Date(2021, 5, 15)])).toEqual([
      "01/02/2021",
      "15/06/2021",
    ]);
  });

  it("writes numbers as they are", () => {
    expect(label([2019, 2020])).toEqual(["2019", "2020"]);
  });
});
