import { describe, expect, it } from "vitest";
import { breakGlyph } from "./breakGlyph";
import { placeBelowLine } from "./labels";

describe("breakGlyph", () => {
  it("sits the chevron above the axis and the label above the chevron", () => {
    const glyph = breakGlyph(100, 200, 10);
    expect(glyph.segments).toHaveLength(4);
    expect(glyph.segments[0].from.y).toBe(193);
    expect(glyph.label).toEqual({ x: 100, y: 179 });
    expect(glyph.strokeWidth).toBeCloseTo(2.3);
  });
});

describe("placeBelowLine", () => {
  it("adds one line box and a gap of 0.55em by default", () => {
    expect(placeBelowLine(10, 20)).toBeCloseTo(10 + 23 + 11);
    expect(placeBelowLine(10, 20, 4)).toBeCloseTo(37);
  });
});
