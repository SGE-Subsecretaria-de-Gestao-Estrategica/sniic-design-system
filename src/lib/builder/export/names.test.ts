import { describe, expect, it } from "vitest";
import { exportName, fileBaseName } from "./names";

describe("exportName", () => {
  it("names the file after the CSV", () => {
    expect(exportName("vínculos 2024.csv", "svg")).toBe("vínculos 2024.svg");
    expect(exportName("vinculos.csv", "png")).toBe("vinculos.png");
    expect(exportName("vinculos.csv", "png", 2)).toBe("vinculos@2x.png");
    expect(exportName("vinculos.csv", "svg", 2)).toBe("vinculos.svg");
  });

  it("falls back when there is no file name", () => {
    expect(exportName(null, "svg")).toBe("grafico.svg");
    expect(fileBaseName("  .csv")).toBe("grafico");
    expect(fileBaseName("a.b.txt")).toBe("a.b");
  });
});
