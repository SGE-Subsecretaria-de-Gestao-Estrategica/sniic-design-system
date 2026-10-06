import chroma from "chroma-js";
import { describe, expect, it } from "vitest";
import { getPillarTheme } from "$lib/core/theme";
import { choroplethStepColors } from "$lib/core/layouts/hexMap";
import { pillarPalettes } from "$lib/core/theme/tokens";
import { labelColorOn, rampColors } from "./colors";

describe("rampColors", () => {
  it("matches the G6.10 ramps on pillar 6", () => {
    const theme = getPillarTheme(6);
    const { palette } = theme;
    expect(rampColors("secondary", "lightToDark", theme)).toEqual([
      palette.base[100],
      palette.secondaryVariant,
      palette.secondary,
    ]);
    expect(rampColors("primary", "lightToDark", theme)).toEqual([
      palette.base[100],
      palette.primary,
      palette.primaryVariant,
    ]);
  });

  it("always gets darker when left to choose, on every pillar", () => {
    for (const { id } of pillarPalettes) {
      for (const ramp of ["primary", "secondary"] as const) {
        const lightness = rampColors(
          ramp,
          "lightToDark",
          getPillarTheme(id),
        ).map((c) => chroma(c).luminance());
        expect(lightness[0]).toBeGreaterThan(lightness[1]);
        expect(lightness[1]).toBeGreaterThan(lightness[2]);
      }
    }
  });

  it("runs from the colour to its variant, or back, when asked", () => {
    const theme = getPillarTheme(6);
    const { palette } = theme;
    expect(rampColors("secondary", "toVariant", theme)).toEqual([
      palette.base[100],
      palette.secondary,
      palette.secondaryVariant,
    ]);
    expect(rampColors("secondary", "fromVariant", theme)).toEqual([
      palette.base[100],
      palette.secondaryVariant,
      palette.secondary,
    ]);
    expect(rampColors("primary", "fromVariant", theme)).toEqual([
      palette.base[100],
      palette.primaryVariant,
      palette.primary,
    ]);
  });
});

describe("labelColorOn", () => {
  const theme = getPillarTheme(6);
  const { palette } = theme;
  const lightFrom = (ramp: "primary" | "secondary") =>
    choroplethStepColors({
      colors: rampColors(ramp, "lightToDark", theme),
      steps: 10,
    }).map((color) => labelColorOn(color, theme) === palette.base[100]);

  it("switches to the light label where G6.10.1 does (above 3% of a 4,9% scale)", () => {
    expect(lightFrom("secondary").indexOf(true)).toBe(6);
  });

  it("keeps the dark label on the whole primary ramp, as in G6.10.2", () => {
    expect(lightFrom("primary")).not.toContain(true);
  });
});
