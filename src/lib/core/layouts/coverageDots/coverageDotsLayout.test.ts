import { describe, expect, it } from "vitest";
import { COVERAGE_DOTS_DEFAULTS } from "./defaults";
import { axisLine, coverageDomain, rowThicknessFor, startBreak } from "./geometry";
import { coverageDotsLayout } from "./coverageDotsLayout";
import { orderBlocks, toEntries } from "./ordering";

type Row = { cut: string; category: string; value: number };

const rows: Row[] = [
  { cut: "Rede", category: "Estadual", value: 99.4 },
  { cut: "Rede", category: "Privada", value: 96.6 },
  { cut: "Rede", category: "Municipal", value: 99.3 },
  { cut: "Etapa", category: "Fundamental", value: 99 },
  { cut: "Etapa", category: "Médio", value: 98.7 },
];
const config = {
  getCategory: (d: Row) => d.category,
  getValue: (d: Row) => d.value,
  getGroup: (d: Row) => d.cut,
  width: 448,
  insetEnd: 48,
};

describe("coverageDomain", () => {
  it("pads the extent and rounds it to the ticks, away from zero", () => {
    expect(coverageDomain([96.6, 99.4], undefined, 0.15, 5)).toEqual([96, 100]);
  });

  it("takes the reference into the extent", () => {
    const [lo] = coverageDomain([99, 99.4], 90, 0.15, 5);
    expect(lo).toBeLessThanOrEqual(90);
  });

  it("stops at zero for non-negative data", () => {
    expect(coverageDomain([1, 50], undefined, 0.5, 5)[0]).toBe(0);
  });

  it("lets a pinned end replace the derived one", () => {
    expect(coverageDomain([96.6, 99.4], undefined, 0.15, 5, [undefined, 100])).toEqual([96, 100]);
    expect(coverageDomain([96.6, 99.4], undefined, 0.15, 5, [90, undefined])).toEqual([90, 100]);
  });

  it("gives a usable domain for a single value and for no data", () => {
    const [lo, hi] = coverageDomain([50], undefined, 0.15, 5);
    expect(lo).toBeLessThan(50);
    expect(hi).toBeGreaterThan(50);
    expect(coverageDomain([], undefined, 0.15, 5)).toEqual([0, 1]);
  });
});

describe("startBreak and axisLine", () => {
  it("puts the chevron on the axis line, its left stub at zero", () => {
    const mark = startBreak(100, 10);
    expect(mark.segments[0].from).toEqual({ x: 0, y: 100 });
    expect(axisLine(100, 300, mark).from.x).toBeCloseTo(34);
    expect(axisLine(100, 300, null).from.x).toBe(0);
  });
});

describe("orderBlocks", () => {
  const entries = toEntries(rows, config.getCategory, config.getValue, config.getGroup);

  it("keeps the blocks in data order and sorts the rows in each", () => {
    const blocks = orderBlocks(entries, "descending");
    expect(blocks.map((b) => b.group)).toEqual(["Rede", "Etapa"]);
    expect(blocks[0].rows.map((r) => r.category)).toEqual(["Estadual", "Municipal", "Privada"]);
  });

  it("puts the listed blocks and categories first", () => {
    const blocks = orderBlocks(entries, "none", ["Privada"], ["Etapa"]);
    expect(blocks.map((b) => b.group)).toEqual(["Etapa", "Rede"]);
    expect(blocks[1].rows[0].category).toBe("Privada");
  });

  it("drops non-finite values and keeps one row per category", () => {
    const dirty = toEntries(
      [...rows, { cut: "Rede", category: "Federal", value: NaN }, { cut: "Rede", category: "Privada", value: 97 }],
      config.getCategory,
      config.getValue,
      config.getGroup,
    );
    const rede = orderBlocks(dirty, "none")[0].rows;
    expect(rede.map((r) => r.category)).toEqual(["Estadual", "Privada", "Municipal"]);
    expect(rede[1].value).toBe(97);
  });
});

describe("coverageDotsLayout", () => {
  const layout = coverageDotsLayout(rows, { ...config, reference: 98.8 });
  const { rowThickness, headerHeight, referenceLabelHeight, axisHeight } = COVERAGE_DOTS_DEFAULTS;

  it("numbers the rows across blocks, top to bottom", () => {
    expect(layout.rows.map((r) => r.index)).toEqual([0, 1, 2, 3, 4]);
    expect(layout.blocks[1].rows[0]).toBe(layout.rows[3]);
    expect(layout.rows.every((r, i) => i === 0 || r.y > layout.rows[i - 1].y)).toBe(true);
  });

  it("starts the first header under the reference's label", () => {
    expect(layout.blocks[0].y).toBe(referenceLabelHeight);
    expect(layout.blocks[0].header).toMatchObject({ x: 0, textAnchor: "start" });
    expect(layout.rows[0].y).toBe(referenceLabelHeight + headerHeight);
    expect(layout.rows[0].cy).toBe(layout.rows[0].y + rowThickness / 2);
  });

  it("marks a truncated axis and keeps the value range clear of the end inset", () => {
    expect(layout.truncated).toBe(true);
    expect(layout.axis.break).not.toBeNull();
    expect(layout.valueScale.range()).toEqual([0, 400]);
    expect(layout.rows[0].track.to.x).toBe(400);
  });

  it("runs the reference from under its label down to the axis", () => {
    expect(layout.reference?.x).toBeCloseTo(layout.valueScale(98.8));
    expect(layout.reference?.line.from.y).toBe(referenceLabelHeight);
    expect(layout.reference?.line.to.y).toBe(layout.axis.y);
    expect(layout.rows.find((r) => r.category === "Privada")?.delta).toBeCloseTo(-2.2);
  });

  it("ends with the axis room and places each tick on the scale", () => {
    expect(layout.height).toBe(layout.axis.y + axisHeight);
    for (const tick of layout.axis.ticks) expect(tick.x).toBeCloseTo(layout.valueScale(tick.value));
  });

  it("draws a single unnamed block, no reference room, and no break from zero", () => {
    const plain = coverageDotsLayout(
      [
        { cut: "", category: "A", value: 10 },
        { cut: "", category: "B", value: 80 },
      ],
      { getCategory: config.getCategory, getValue: config.getValue, width: 300 },
    );
    expect(plain.blocks).toHaveLength(1);
    expect(plain.blocks[0].header).toBeNull();
    expect(plain.rows[0].y).toBe(0);
    expect(plain.reference).toBeNull();
    expect(plain.truncated).toBe(false);
    expect(plain.axis.break).toBeNull();
    expect(plain.rows[0].delta).toBeUndefined();
  });

  it("is empty without data", () => {
    const empty = coverageDotsLayout([], config);
    expect(empty.rows).toEqual([]);
    expect(empty.height).toBe(axisHeight);
  });
});

describe("rowThicknessFor", () => {
  it("inverts the layout: the solved thickness gives back the asked height", () => {
    const counts = { rows: 5, blocks: 2, named: true, reference: true };
    const rowThickness = rowThicknessFor(420, counts, COVERAGE_DOTS_DEFAULTS)!;
    const layout = coverageDotsLayout(rows, { ...config, reference: 98.8, rowThickness });
    expect(layout.height).toBeCloseTo(420);
  });

  it("works for a single unnamed block and has no answer without rows", () => {
    const counts = { rows: 2, blocks: 1, named: false, reference: false };
    const rowThickness = rowThicknessFor(200, counts, COVERAGE_DOTS_DEFAULTS)!;
    const plain = coverageDotsLayout(rows.slice(0, 2), {
      getCategory: config.getCategory,
      getValue: config.getValue,
      width: 300,
      rowThickness,
    });
    expect(plain.height).toBeCloseTo(200);
    expect(rowThicknessFor(200, { ...counts, rows: 0 }, COVERAGE_DOTS_DEFAULTS)).toBeUndefined();
  });
});
