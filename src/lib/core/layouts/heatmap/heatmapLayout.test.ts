import { describe, expect, it } from "vitest";
import { HEATMAP_DEFAULTS } from "./defaults";
import { heatmapLayout } from "./heatmapLayout";

type Row = { region: string; year: string; value: number };

// Tidy: one row per region × year; Sul has no 2021.
const rows: Row[] = [
  { region: "Norte", year: "2020", value: 0 },
  { region: "Norte", year: "2021", value: 50 },
  { region: "Sul", year: "2020", value: 100 },
];
const config = {
  getRow: (d: Row) => d.region,
  getColumn: (d: Row) => d.year,
  getValue: (d: Row) => d.value,
  width: 200,
  height: 100,
  cellGap: 0,
};

describe("heatmapLayout", () => {
  it("pivots tidy data into a full grid, in data order", () => {
    const layout = heatmapLayout(rows, config);
    expect(layout.rows.map((r) => r.key)).toEqual(["Norte", "Sul"]);
    expect(layout.columns.map((c) => c.key)).toEqual(["2020", "2021"]);
    expect(layout.cells).toHaveLength(4);
    const empty = layout.cells.find((c) => c.row === "Sul" && c.column === "2021")!;
    expect(empty).toMatchObject({ data: null, value: null, step: null });
  });

  it("fills the box with equal cells and gaps between them", () => {
    const gap = 4;
    const layout = heatmapLayout(rows, { ...config, cellGap: gap });
    const [a, b] = layout.columns;
    expect(a.size).toBeCloseTo((200 - gap) / 2);
    expect(b.start).toBeCloseTo(a.size + gap);
    expect(b.start + b.size).toBeCloseTo(200);
    expect(layout.rows[1].start + layout.rows[1].size).toBeCloseTo(100);
  });

  it("gives each cell its step, lowest first, and t over the domain", () => {
    const layout = heatmapLayout(rows, { ...config, steps: 3 });
    const value = (row: string, column: string) =>
      layout.cells.find((c) => c.row === row && c.column === column)!;
    expect(value("Norte", "2020")).toMatchObject({ step: 0, t: 0 });
    expect(value("Norte", "2021")).toMatchObject({ step: 1, t: 0.5 });
    expect(value("Sul", "2020")).toMatchObject({ step: 2, t: 1 });
    expect(layout.steps).toBe(3);
    expect(layout.domain).toEqual([0, 100]);
  });

  it("puts the listed rows and columns first", () => {
    const layout = heatmapLayout(rows, {
      ...config,
      rowOrder: ["Sul"],
      columnOrder: ["2021"],
    });
    expect(layout.rows.map((r) => r.key)).toEqual(["Sul", "Norte"]);
    expect(layout.columns.map((c) => c.key)).toEqual(["2021", "2020"]);
  });

  it("places row labels left of the grid and column labels above it", () => {
    const layout = heatmapLayout(rows, config);
    expect(layout.rows[0].label).toMatchObject({
      x: -HEATMAP_DEFAULTS.rowLabelGap,
      textAnchor: "end",
    });
    expect(layout.columns[0].label).toMatchObject({
      y: -HEATMAP_DEFAULTS.columnLabelGap,
      verticalAnchor: "end",
    });
    const cell = layout.cells[0];
    expect(cell.label).toMatchObject({
      x: cell.x + cell.width / 2,
      y: cell.y + cell.height / 2,
    });
  });

  it("keeps the first datum of a repeated pair", () => {
    const layout = heatmapLayout(
      [...rows, { region: "Norte", year: "2020", value: 99 }],
      config,
    );
    expect(layout.cells[0].value).toBe(0);
  });

  it("returns an empty grid for empty data", () => {
    const layout = heatmapLayout([] as Row[], config);
    expect(layout.cells).toEqual([]);
    expect(layout).toMatchObject({ width: 200, height: 100 });
  });
});
