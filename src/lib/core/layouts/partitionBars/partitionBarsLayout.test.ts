import { describe, expect, it } from "vitest";
import { PARTITION_BARS_DEFAULTS } from "./defaults";
import { fullLengthOf, shareOf } from "./geometry";
import { groupRows, toEntries } from "./ordering";
import { partitionBarsLayout } from "./partitionBarsLayout";

type Row = { row: string; part: string; sub: string; value: number };

// Escolas: sem biblioteca, e com biblioteca dividida por profissional.
const library: Row[] = [
  { row: "", part: "Sem biblioteca", sub: "Sem biblioteca", value: 114_018 },
  { row: "", part: "Com biblioteca", sub: "Com profissional", value: 28_937 },
  { row: "", part: "Com biblioteca", sub: "Sem profissional", value: 37_585 },
];
const config = {
  getCategory: (d: Row) => d.row,
  getPart: (d: Row) => d.part,
  getSubpart: (d: Row) => d.sub,
  getValue: (d: Row) => d.value,
  width: 596,
};
const { barThickness, pieceThickness, rowGap, pieceGap, headerHeight, blockGap, valueSpace } =
  PARTITION_BARS_DEFAULTS;

describe("geometry", () => {
  it("guards empty wholes and keeps the value column inside the width", () => {
    expect(shareOf(1, 4)).toBe(0.25);
    expect(shareOf(1, 0)).toBe(0);
    expect(fullLengthOf(596, 96)).toBe(500);
    expect(fullLengthOf(50, 96)).toBe(0);
  });
});

describe("toEntries and groupRows", () => {
  it("treats a piece equal to its part, or empty, as the part itself", () => {
    const entries = toEntries(
      [...library, { row: "", part: "Outro", sub: " ", value: 1 }],
      config.getPart,
      config.getValue,
      config.getCategory,
      config.getSubpart,
    );
    expect(entries.map((e) => e.subpart)).toEqual([null, "Com profissional", "Sem profissional", null]);
  });

  it("drops negative and non-finite values, and sums the pieces into their part", () => {
    const entries = toEntries(
      [...library, { row: "", part: "Sem biblioteca", sub: "", value: -5 }, { row: "", part: "X", sub: "", value: NaN }],
      config.getPart,
      config.getValue,
      config.getCategory,
      config.getSubpart,
    );
    const [{ parts }] = groupRows(entries);
    expect(parts.map((p) => [p.part, p.value])).toEqual([
      ["Sem biblioteca", 114_018],
      ["Com biblioteca", 66_522],
    ]);
  });
});

describe("partitionBarsLayout", () => {
  const layout = partitionBarsLayout(library, config);
  const [sem, com, comProf, semProf] = layout.rows;

  it("draws a row per part, each piece right under its part", () => {
    expect(layout.rows.map((r) => [r.kind, r.label])).toEqual([
      ["part", "Sem biblioteca"],
      ["part", "Com biblioteca"],
      ["piece", "Com profissional"],
      ["piece", "Sem profissional"],
    ]);
    expect(layout.rows.map((r) => r.index)).toEqual([0, 1, 2, 3]);
  });

  it("puts every part on a track as long as the whole, on one scale", () => {
    expect(layout.fullLength).toBe(500);
    expect(sem.trackLength).toBe(500);
    expect(sem.share).toBeCloseTo(0.632, 3);
    expect(sem.barLength).toBeCloseTo(0.632 * 500, 0);
    expect(com.barLength + sem.barLength).toBeCloseTo(500);
  });

  it("puts every piece on a track as long as its part, still on the whole's scale", () => {
    expect(comProf.trackLength).toBeCloseTo(com.barLength);
    expect(comProf.share).toBeCloseTo(0.435, 3);
    expect(comProf.shareOfTotal).toBeCloseTo(28_937 / 180_540);
    expect(comProf.barLength + semProf.barLength).toBeCloseTo(com.barLength);
    expect(comProf.part).toBe("Com biblioteca");
  });

  it("stacks parts and pieces with their own thickness and gaps", () => {
    expect(sem.y).toBe(0);
    expect(com.y).toBe(barThickness + rowGap);
    expect(comProf.y).toBe(com.y + barThickness + pieceGap);
    expect(comProf.thickness).toBe(pieceThickness);
    expect(layout.height).toBe(semProf.y + pieceThickness);
  });

  it("writes every value in one column past the 100% end", () => {
    expect(new Set(layout.rows.map((r) => r.valueLabel.x)).size).toBe(1);
    expect(sem.valueLabel.x).toBeGreaterThan(500);
    expect(sem.valueLabel.x).toBeLessThan(500 + valueSpace);
    expect(sem.categoryLabel).toMatchObject({ textAnchor: "end", y: sem.cy });
  });

  it("draws a single unnamed whole without a header", () => {
    expect(layout.blocks).toHaveLength(1);
    expect(layout.blocks[0].header).toBeNull();
    expect(layout.blocks[0].baseline).toEqual({
      from: { x: 0, y: 0 },
      to: { x: 0, y: layout.height },
    });
  });

  it("names a block per whole when there are several", () => {
    const quotas: Row[] = ["Arte e Cultura", "Todos os cursos"].flatMap((row, i) => [
      { row, part: "Cotistas", sub: "", value: 57 - 8 * i },
      { row, part: "Não cotistas", sub: "", value: 43 + 8 * i },
    ]);
    const two = partitionBarsLayout(quotas, config);
    expect(two.blocks.map((b) => b.label)).toEqual(["Arte e Cultura", "Todos os cursos"]);
    expect(two.blocks[0].header).not.toBeNull();
    expect(two.rows[0].y).toBe(headerHeight);
    const secondTop = headerHeight + 2 * barThickness + rowGap + blockGap + rowGap;
    expect(two.blocks[1].y).toBe(secondTop);
    expect(two.blocks[1].baseline.from.y).toBe(secondTop + headerHeight);
    expect(two.parts).toEqual(["Cotistas", "Não cotistas"]);
  });

  it("is empty without data", () => {
    const empty = partitionBarsLayout([], config);
    expect(empty.rows).toEqual([]);
    expect(empty.height).toBe(0);
  });
});
