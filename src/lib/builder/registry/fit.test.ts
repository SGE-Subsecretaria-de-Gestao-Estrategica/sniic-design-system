import { describe, expect, it } from "vitest";
import { bandRows } from "$lib/core/layouts/bandRows";
import { fitBandThickness, MIN_BAND_THICKNESS } from "./fit";

const context = (height: number | null) => {
  const warnings: string[] = [];
  const solved: Record<string, number> = {};
  return {
    fit: { width: null, height },
    warn: (m: string) => warnings.push(m),
    solved: (id: string, value: number) => (solved[id] = value),
    warnings,
    values: solved,
  };
};

describe("fitBandThickness", () => {
  it("is the inverse of bandRows", () => {
    const thickness = fitBandThickness(7, 1 / 3, "thickness", context(500))!;
    expect(bandRows(7, { thickness, gapRatio: 1 / 3 }).height).toBeCloseTo(
      500,
      8,
    );
  });

  it("keeps the layout default when no height is asked for", () => {
    expect(
      fitBandThickness(7, 1 / 3, "thickness", context(null)),
    ).toBeUndefined();
    expect(
      fitBandThickness(0, 1 / 3, "thickness", context(500)),
    ).toBeUndefined();
  });

  it("warns when bands get too thin to read", () => {
    const c = context(100);
    expect(fitBandThickness(20, 1 / 3, "thickness", c)!).toBeLessThan(
      MIN_BAND_THICKNESS,
    );
    expect(c.warnings).toHaveLength(1);
  });

  it("reports the thickness it solved, under the param it replaces", () => {
    const c = context(500);
    const thickness = fitBandThickness(7, 1 / 3, "barThickness", c);
    expect(c.values).toEqual({ barThickness: thickness });
    const none = context(null);
    fitBandThickness(7, 1 / 3, "barThickness", none);
    expect(none.values).toEqual({});
  });
});
