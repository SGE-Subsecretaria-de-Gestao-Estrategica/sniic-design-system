import { describe, expect, it } from "vitest";
import { bendReach, clearShare, columnPositions, placeValue, spreadBlocks } from "./geometry";
import { RANKED_RIBBONS_DEFAULTS } from "./defaults";
import { rankedRibbonsLayout } from "./rankedRibbonsLayout";

type Row = { year: number; source: string; value: number };

const rows: Row[] = [
  { year: 2020, source: "A", value: 3 },
  { year: 2020, source: "B", value: 1 },
  { year: 2021, source: "A", value: 1 },
  { year: 2021, source: "B", value: 2 },
  { year: 2022, source: "A", value: 2 },
  { year: 2022, source: "B", value: 0 },
];
const config = {
  getX: (d: Row) => d.year,
  getY: (d: Row) => d.value,
  getSeries: (d: Row) => d.source,
  width: 300,
  height: 200,
  plateau: 0.25,
  totalsRoom: 20,
};

describe("columnPositions", () => {
  it("keeps half a plateau inside both ends", () => {
    const { xs, step } = columnPositions([3], 300, 0.25, 0);
    expect(step).toBe(120);
    expect(xs).toEqual([[30, 150, 270]]);
  });

  it("leaves the break width between segments, plateau edge to plateau edge", () => {
    const { xs, step } = columnPositions([2, 2], 300, 0.25, 60);
    // 240 px for 2 × (1 + 0.5) steps.
    expect(step).toBe(80);
    expect(xs[0]).toEqual([20, 100]);
    expect(xs[1][0] - 20 - (xs[0][1] + 20)).toBe(60);
    expect(xs[1][1] + 20).toBe(300);
  });
});

describe("spreadBlocks", () => {
  it("pushes overlapping blocks apart and keeps the last above the bottom", () => {
    expect(spreadBlocks([50, 52], [20, 20], 4, 200)).toEqual([40, 64]);
    expect(spreadBlocks([190], [20], 4, 200)).toEqual([180]);
  });

  it("pushes the next block by the real height of a taller one", () => {
    expect(spreadBlocks([50, 52], [40, 20], 4, 200)).toEqual([30, 74]);
  });
});

describe("clearShare", () => {
  const band = (y0: number, y1: number) => ({ y0, y1 });

  it("lets the text through half the bend when nothing moves", () => {
    expect(clearShare([band(0, 40), band(0, 40)], [], 15, 25)).toBe(0.5);
  });

  it("stops where its own edge reaches the text", () => {
    // The top moves down 30 px; the text starts 15 px below it.
    expect(clearShare([band(0, 40), band(30, 70)], [], 15, 25)).toBeCloseTo(0.5);
    expect(clearShare([band(0, 40), band(60, 100)], [], 15, 25)).toBeCloseTo(0.25);
  });

  it("stops where another band crosses into the text", () => {
    // A band below rises 40 px; its top meets the text's bottom 15 px up.
    const share = clearShare([band(0, 40), band(0, 40)], [[band(40, 80), band(0, 40)]], 15, 25);
    expect(share).toBeCloseTo(15 / 40);
  });

  it("is 0 when the text doesn't fit the band", () => {
    expect(clearShare([band(0, 8), band(0, 8)], [], 0, 10)).toBe(0);
  });
});

describe("placeValue", () => {
  const slot = {
    x0: 40,
    x1: 60,
    y0: 0,
    y1: 40,
    labelFits: true,
    labelReach: { left: { shared: 10, alone: 30 }, right: { shared: 14, alone: 30 } },
  };

  it("stays on its column, as wide as the narrower shared bend allows", () => {
    expect(placeValue(slot, { left: false, right: false }, 8)).toEqual({ x: 50, y: 20, room: 20 + 20 - 8 });
  });

  it("moves into a bend it has to itself", () => {
    const placed = placeValue(slot, { left: false, right: true }, 8);
    expect(placed.room).toBe(10 + 20 + 30 - 8);
    expect(placed.x).toBe((30 + 90) / 2);
  });

  it("uses the one bend at the end of a segment", () => {
    const end = { ...slot, labelReach: { left: null, right: { shared: 10, alone: 30 } } };
    expect(placeValue(end, { left: false, right: true }, 8)).toEqual({ x: 65, y: 20, room: 42 });
  });

  it("has no room in a band too thin for a line", () => {
    expect(placeValue({ ...slot, labelFits: false }, { left: true, right: true }, 8).room).toBe(0);
  });
});

describe("bendReach", () => {
  it("reaches half the bend at half the move", () => {
    expect(bendReach(0.5, 100)).toBeCloseTo(50);
    expect(bendReach(0, 100)).toBe(0);
    expect(bendReach(0.25, 100)).toBeLessThan(50);
    expect(bendReach(1, 100)).toBe(100);
  });
});

describe("rankedRibbonsLayout", () => {
  it("stacks each column by value, the largest on top", () => {
    const layout = rankedRibbonsLayout(rows, config);
    const [first, second] = layout.columns;
    expect(first.slots.map((s) => s.series)).toEqual(["B", "A"]);
    expect(second.slots.map((s) => s.series)).toEqual(["A", "B"]);
    expect(first.slots.at(-1)!.rank).toBe(0);
  });

  it("fills the height under the totals with the tallest stack", () => {
    const layout = rankedRibbonsLayout(rows, config);
    expect(layout.columns[0].top).toBe(20);
    expect(layout.columns[0].slots[0].y1).toBe(200);
  });

  it("gives the whole height to the stacks without totals", () => {
    const layout = rankedRibbonsLayout(rows, { ...config, totals: false });
    expect(layout.columns[0].top).toBe(0);
  });

  it("leaves the ribbon gap between bands, but not under a zero", () => {
    const layout = rankedRibbonsLayout(rows, { ...config, ribbonGap: 10 });
    const [b, a] = layout.columns[0].slots;
    expect(b.y0 - a.y1).toBe(10);
    const last = layout.columns[2];
    expect(last.slots[0]).toMatchObject({ series: "B", y0: 200, y1: 200 });
    expect(last.slots[1].y1).toBe(200);
  });

  it("keeps series order for colours and draws the smallest ribbon first", () => {
    const layout = rankedRibbonsLayout(rows, { ...config, seriesOrder: ["B"] });
    expect(layout.series).toEqual(["B", "A"]);
    expect(layout.ribbons.map((r) => [r.key, r.index])).toEqual([
      ["B", 0],
      ["A", 1],
    ]);
  });

  it("closes only the ribbons that end above zero, values taken out of the last column", () => {
    const layout = rankedRibbonsLayout(rows, config);
    const a = layout.ribbons.find((r) => r.key === "A")!;
    const b = layout.ribbons.find((r) => r.key === "B")!;
    expect(a.end?.value.x).toBeGreaterThan(300);
    expect(b.end).toBeUndefined();
    expect(layout.columns[2].slots.every((s) => s.isEndLabel)).toBe(true);
    expect(layout.columns[1].slots.some((s) => s.isEndLabel)).toBe(false);
  });

  it("splits the axis at a break and bridges the ribbons across it", () => {
    const layout = rankedRibbonsLayout(rows, { ...config, breaksAfter: [2021] });
    expect(layout.xAxis.segments.map((s) => s.ticks)).toEqual([[2020, 2021], [2022]]);
    expect(layout.xAxis.breaks).toHaveLength(1);
    expect(layout.ribbons[0].paths).toHaveLength(2);
    expect(layout.ribbons[0].bridges).toHaveLength(1);
    const [c0, c1, c2] = layout.columns;
    expect([c0.isSegmentStart, c1.isSegmentEnd, c2.isSegmentStart]).toEqual([true, true, true]);
    expect(layout.xAxis.xScale(2021)).toBeCloseTo(c1.x);
    expect(layout.xAxis.xScale(2022)).toBeCloseTo(c2.x);
  });

  it("gives a value room into flat bends, beyond its plateau", () => {
    const flat: Row[] = [2020, 2021, 2022].flatMap((year) => [
      { year, source: "A", value: 2 },
      { year, source: "B", value: 1 },
    ]);
    const layout = rankedRibbonsLayout(flat, { ...config, plateau: 0.1 });
    const middle = layout.columns[1].slots[1];
    const step = layout.columns[1].x - layout.columns[0].x;
    // The plateau and half of each bend either side make one whole step, less the padding.
    expect(middle.x1 - middle.x0).toBeLessThan(step / 4);
    expect(middle.labelRoom).toBeCloseTo(step - 8);
    expect(middle.label.x).toBeCloseTo(middle.x);
  });

  it("shifts an end column's value inwards, onto its one bend", () => {
    const flat: Row[] = [2020, 2021].flatMap((year) => [{ year, source: "A", value: 2 }]);
    const layout = rankedRibbonsLayout(flat, { ...config, plateau: 0.1 });
    const first = layout.columns[0].slots[0];
    expect(first.label.x).toBeGreaterThan(first.x);
    expect(first.label.x - first.labelRoom / 2).toBeGreaterThanOrEqual(0);
    // With the next column silent, the whole bend is its own.
    const alone = placeValue(first, { left: false, right: true }, layout.valueLabelPadding);
    expect(alone.room).toBeGreaterThan(first.labelRoom);
  });

  it("has no room for a value in a band thinner than a line", () => {
    const layout = rankedRibbonsLayout(rows, config);
    const zero = layout.columns[2].slots[0];
    expect(zero.labelRoom).toBe(0);
  });

  it("spaces end labels by the lines their names take", () => {
    const close: Row[] = [
      { year: 2020, source: "A", value: 1 },
      { year: 2020, source: "B", value: 1 },
    ];
    const one = rankedRibbonsLayout(close, config);
    const lines = (s: string) => (s === "A" ? 2 : 1);
    const two = rankedRibbonsLayout(close, { ...config, endNameLines: lines });
    const blockOf = (s: string, n: (s: string) => number) =>
      RANKED_RIBBONS_DEFAULTS.endValueHeight + RANKED_RIBBONS_DEFAULTS.endNameHeight * n(s);
    for (const [layout, n] of [[one, () => 1], [two, lines]] as const) {
      const [upper, lower] = [...layout.ribbons].sort((a, b) => a.end!.value.y - b.end!.value.y);
      expect(lower.end!.value.y - upper.end!.value.y).toBeGreaterThanOrEqual(
        blockOf(upper.key, n) + RANKED_RIBBONS_DEFAULTS.endLabelSpacing - 1e-9,
      );
    }
  });
});
