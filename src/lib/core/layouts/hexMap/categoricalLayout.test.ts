import { describe, expect, it } from "vitest";
import { categoricalLayout } from "./categoricalLayout";
import { getHexTilePositions } from "./utils";

type Row = { uf: string; stage: string };

const rows: Row[] = [
  { uf: "SP", stage: "Parcial" },
  { uf: "BA", stage: "Plena" },
  { uf: "AM", stage: "Parcial" },
];
const config = {
  radius: 20,
  getUf: (d: Row) => d.uf,
  getCategory: (d: Row) => d.stage,
};

describe("categoricalLayout", () => {
  it("lists categories as they first appear in the data", () => {
    expect(categoricalLayout(rows, config).categories).toEqual(["Parcial", "Plena"]);
  });

  it("puts the given order first and keeps categories no UF has", () => {
    const layout = categoricalLayout(rows, {
      ...config,
      categoryOrder: ["Nenhuma", "Plena"],
    });
    expect(layout.categories).toEqual(["Nenhuma", "Plena", "Parcial"]);
    expect(layout.counts).toEqual([0, 1, 2]);
  });

  it("gives each datum its category's index and its tile", () => {
    const layout = categoricalLayout(rows, config);
    const tiles = getHexTilePositions(20);
    const sp = layout.data.find((d) => d.ufCode === "SP")!;
    expect(sp).toMatchObject({ category: "Parcial", categoryIndex: 0, data: rows[0] });
    expect(sp.position).toEqual(tiles.get("SP")!.position);
  });

  it("centres the UF name on the tile", () => {
    const layout = categoricalLayout(rows, config);
    expect(layout.data[0].labels.name).toEqual({
      x: 0,
      y: 0,
      textAnchor: "middle",
      verticalAnchor: "middle",
    });
    expect(layout.emptyLabel).toEqual(layout.data[0].labels.name);
  });

  it("throws on an unknown UF", () => {
    expect(() => categoricalLayout([{ uf: "XX", stage: "A" }], config)).toThrow("UF not found");
  });
});
