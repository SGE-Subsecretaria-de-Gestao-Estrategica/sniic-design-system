import { describe, expect, it } from "vitest";
import { choroplethLayout } from "./choroplethLayout";
import { choroplethStepColors } from "./colors";
import { UF_TILES } from "./data";
import { twinBarsLayout } from "./twinBarsLayout";
import { getHexTilePositions, hexMapBox, hexRadiusForWidth } from "./utils";

const HALF_HEIGHT = Math.sqrt(3) / 2;

type Row = { uf: string; type: string; value: number };

const row = (uf: string, type: string, value: number): Row => ({
  uf,
  type,
  value,
});

describe("tile positions", () => {
  it.each([0, 0.6, 1])(
    "keeps every tile inside the box (regions apart by %s)",
    (offsetK) => {
      const radius = 40;
      const tiles = getHexTilePositions(radius, offsetK);
      const box = hexMapBox(tiles.values(), radius);
      const lefts = [...tiles.values()].map((t) => t.position.x - radius);
      const tops = [...tiles.values()].map(
        (t) => t.position.y - HALF_HEIGHT * radius,
      );

      expect(tiles.size).toBe(UF_TILES.length);
      expect(Math.min(...lefts)).toBeCloseTo(0);
      expect(Math.min(...tops)).toBeCloseTo(0);
      for (const tile of tiles.values()) {
        expect(tile.position.x + radius).toBeLessThanOrEqual(box.width + 1e-9);
        expect(tile.position.y + HALF_HEIGHT * radius).toBeLessThanOrEqual(
          box.height + 1e-9,
        );
      }
    },
  );

  it("finds the radius that gives a width", () => {
    for (const offsetK of [0, 0.6]) {
      const radius = hexRadiusForWidth(500, offsetK);
      const tiles = getHexTilePositions(radius, offsetK);
      expect(hexMapBox(tiles.values(), radius).width).toBeCloseTo(500);
    }
  });
});

describe("choroplethLayout", () => {
  const rows = [row("AC", "a", 0), row("SP", "a", 5), row("RJ", "a", 10)];
  const config = {
    radius: 20,
    getUf: (d: Row) => d.uf,
    getValue: (d: Row) => d.value,
  };

  it("gives each tile the step of its value", () => {
    const layout = choroplethLayout(rows, { ...config, steps: 5 });
    expect(layout.steps).toBe(5);
    expect(layout.domain).toEqual([0, 10]);
    expect(layout.data.map((d) => [d.key, d.step])).toEqual([
      ["AC", 0],
      ["SP", 2],
      ["RJ", 4],
    ]);
  });

  it("uses a given domain", () => {
    const layout = choroplethLayout(rows, {
      ...config,
      steps: 4,
      domain: [0, 20],
    });
    expect(layout.data.map((d) => d.step)).toEqual([0, 1, 2]);
  });

  it("keeps every tile, with or without data", () => {
    const layout = choroplethLayout(rows, config);
    expect(layout.tiles.size).toBe(27);
    expect(layout.data).toHaveLength(3);
  });

  it("rejects a UF that is not on the map", () => {
    expect(() => choroplethLayout([row("XX", "a", 1)], config)).toThrow();
  });
});

describe("choroplethStepColors", () => {
  it("cuts the ramp into steps, ends included", () => {
    const colors = choroplethStepColors({
      colors: ["#ffffff", "#888888", "#000000"],
      steps: 5,
    });
    expect(colors).toHaveLength(5);
    expect(colors[0]).toBe("#ffffff");
    expect(colors[4]).toBe("#000000");
  });
});

describe("twinBarsLayout", () => {
  const config = {
    radius: 45,
    getUf: (d: Row) => d.uf,
    getType: (d: Row) => d.type,
    getValue: (d: Row) => d.value,
  };

  it("ties each bar to its type, whatever the order of the rows", () => {
    const layout = twinBarsLayout(
      [
        row("AC", "Estadual", 0.5),
        row("AC", "Municipal", 0.4),
        row("SP", "Municipal", 0.3),
        row("SP", "Estadual", 0.2),
        row("DF", "Municipal", 0.4),
      ],
      config,
    );
    expect(layout.types).toEqual(["Estadual", "Municipal"]);

    const tile = (uf: string) => layout.data.find((d) => d.key === uf)!;
    expect(tile("SP").bars.map((b) => b.type)).toEqual([
      "Estadual",
      "Municipal",
    ]);
    expect(tile("SP").bars[0].x).toBeLessThan(tile("SP").bars[1].x);
    // A tile with one bar keeps it centred and still knows its type.
    expect(tile("DF").bars).toHaveLength(1);
    expect(tile("DF").bars[0].typeIndex).toBe(1);
    expect(tile("DF").bars[0].x).toBeCloseTo(-tile("DF").bars[0].width / 2);
  });

  it("puts the listed types first", () => {
    const layout = twinBarsLayout(
      [row("AC", "Estadual", 0.5), row("AC", "Municipal", 0.4)],
      { ...config, typeOrder: ["Municipal"] },
    );
    expect(layout.types).toEqual(["Municipal", "Estadual"]);
    expect(layout.data[0].bars.map((b) => b.type)).toEqual([
      "Municipal",
      "Estadual",
    ]);
  });

  it("splits a bar above the threshold", () => {
    const layout = twinBarsLayout(
      [row("AC", "Estadual", 0.8), row("AC", "Municipal", 0.2)],
      { ...config, threshold: 0.4 },
    );
    const [over, under] = layout.data[0].bars;
    expect(over.isOverThreshold).toBe(true);
    expect(over.segments).toHaveLength(2);
    expect(under.isOverThreshold).toBe(false);
    expect(under.segments).toHaveLength(1);
    expect(layout.data[0].threshold).toBeDefined();
  });

  it("has no threshold line without a threshold", () => {
    const layout = twinBarsLayout([row("AC", "Estadual", 0.8)], config);
    expect(layout.data[0].threshold).toBeUndefined();
  });
});
