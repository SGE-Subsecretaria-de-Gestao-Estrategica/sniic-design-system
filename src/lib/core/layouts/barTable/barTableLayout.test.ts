import { describe, expect, it } from "vitest";
import { bandHeightFor, columnWidth } from "./geometry";
import { barTableLayout } from "./barTableLayout";

type Row = { source: string; category: string; value: number };

const rows: Row[] = [
  { source: "A", category: "X", value: 10 },
  { source: "A", category: "Y", value: 30 },
  { source: "A", category: "Z", value: 5 },
  { source: "B", category: "X", value: 40 },
  { source: "B", category: "Y", value: 20 },
  { source: "C", category: "Z", value: 50 },
];
const config = {
  getColumn: (d: Row) => d.source,
  getCategory: (d: Row) => d.category,
  getValue: (d: Row) => d.value,
  width: 640,
  columnGap: 20,
  headerHeight: 30,
  barThickness: 20,
  barGapRatio: 0.5,
  valueHeadroom: 1,
};

describe("columnWidth / bandHeightFor", () => {
  it("splits the width minus the gaps", () => {
    expect(columnWidth(3, 640, 20)).toBe(200);
    expect(columnWidth(0, 640, 20)).toBe(0);
  });

  it("leaves the headers out of the rows' height", () => {
    expect(bandHeightFor(200, 30)).toBe(170);
  });
});

describe("barTableLayout", () => {
  const layout = barTableLayout(rows, config);
  const bar = (column: number, category: string) =>
    layout.columns[column].bars.find((b) => b.category === category);

  it("makes one column per source, in data order", () => {
    expect(layout.columns.map((c) => c.key)).toEqual(["A", "B", "C"]);
    expect(layout.columns.map((c) => c.x)).toEqual([0, 220, 440]);
  });

  it("orders the rows by their total over every column", () => {
    // X 50, Y 50, Z 55.
    expect(layout.rows.map((r) => r.category)).toEqual(["Z", "X", "Y"]);
  });

  it("puts the rows under the headers, on the same height in every column", () => {
    expect(layout.rows[0].cy).toBe(30 + 10 + 10);
    expect(bar(0, "X")!.rect.y).toBe(bar(1, "X")!.rect.y);
    expect(layout.height).toBe(30 + 3 * 20 + 4 * 10);
    expect(layout.columns[0].baseline).toEqual({
      from: { x: 0, y: 30 },
      to: { x: 0, y: layout.height },
    });
  });

  it("writes a missing cell instead of drawing it", () => {
    expect(bar(1, "Z")).toBeUndefined();
    expect(layout.columns[1].missing.map((m) => m.category)).toEqual(["Z"]);
    expect(layout.columns[2].missing.map((m) => m.category)).toEqual(["X", "Y"]);
    expect(layout.missing).toBe(3);
    expect(layout.columns[1].missing[0].label.y).toBe(layout.rows[0].cy);
  });

  it("shares the value scale by default", () => {
    expect(bar(2, "Z")!.rect.width).toBe(200);
    expect(bar(1, "X")!.rect.width).toBe(160);
    expect(bar(0, "Y")!.rect.width).toBe(120);
  });

  it("gives each column its own scale when asked", () => {
    const own = barTableLayout(rows, { ...config, scale: "independent" });
    const longest = own.columns.map((c) => Math.max(...c.bars.map((b) => b.rect.width)));
    expect(longest).toEqual([200, 200, 200]);
  });

  it("follows a manual column and row order", () => {
    const manual = barTableLayout(rows, {
      ...config,
      sort: "none",
      categoryOrder: ["Y"],
      columnOrder: ["C", "A"],
    });
    expect(manual.columns.map((c) => c.key)).toEqual(["C", "A", "B"]);
    expect(manual.rows.map((r) => r.category)).toEqual(["Y", "X", "Z"]);
  });

  it("keeps the first value of a repeated column and category", () => {
    const repeated = barTableLayout(
      [...rows, { source: "A", category: "X", value: 999 }],
      config,
    );
    expect(repeated.columns[0].bars.find((b) => b.category === "X")!.value).toBe(10);
  });

  it("is empty without data", () => {
    const empty = barTableLayout([], config);
    expect(empty.columns).toEqual([]);
    expect(empty.height).toBe(0);
  });
});
