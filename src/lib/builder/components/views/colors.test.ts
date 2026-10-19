import chroma from "chroma-js";
import { describe, expect, it } from "vitest";
import { getPillarTheme } from "$lib/core/theme";
import { choroplethStepColors } from "$lib/core/layouts/hexMap";
import { pillarPalettes } from "$lib/core/theme/tokens";
import {
  groupColor,
  labelColorOn,
  pickedSeriesColors,
  rampColors,
  seriesColorChoices,
} from "./colors";

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

  it("never gets lighter when left to choose, on every palette", () => {
    for (const { id } of pillarPalettes) {
      for (const ramp of ["primary", "secondary"] as const) {
        const lightness = rampColors(
          ramp,
          "lightToDark",
          getPillarTheme(id),
        ).map((c) => chroma(c).luminance());
        expect(lightness[0]).toBeGreaterThan(lightness[1]);
        // A palette may repeat a colour as its own variant.
        expect(lightness[1]).toBeGreaterThanOrEqual(lightness[2]);
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

describe("seriesColorChoices", () => {
  const theme = getPillarTheme(6);
  const { palette } = theme;
  const hex = (c: string) => chroma(c).hex();

  it("offers the pillar colours, two ramps of one stop per series, then the neutrals", () => {
    const choices = seriesColorChoices(3, theme);
    expect(choices.map((c) => c.id)).toEqual([
      "primary",
      "primaryVariant",
      "secondary",
      "secondaryVariant",
      "accent",
      "gradient-0",
      "gradient-1",
      "gradient-2",
      "secondaryGradient-0",
      "secondaryGradient-1",
      "secondaryGradient-2",
      "neutral-100",
      "neutral-200",
      "neutral-300",
      "neutral-400",
    ]);
    expect(new Set(choices.map((c) => c.group))).toEqual(
      new Set(["base", "primarySteps", "secondarySteps", "neutral"]),
    );
  });

  it("runs each ramp from the colour to its variant", () => {
    const choices = seriesColorChoices(4, theme);
    const color = (id: string) => hex(choices.find((c) => c.id === id)!.color);
    expect(color("gradient-0")).toBe(hex(palette.primary));
    expect(color("gradient-3")).toBe(hex(palette.primaryVariant));
    expect(color("secondaryGradient-0")).toBe(hex(palette.secondary));
    expect(color("secondaryGradient-3")).toBe(hex(palette.secondaryVariant));
    expect(color("neutral-300")).toBe(hex(palette.neutral[300]));
  });

  it("keeps both ends of each ramp for a single series", () => {
    const choices = seriesColorChoices(1, theme);
    expect(choices.filter((c) => c.group === "primarySteps")).toHaveLength(2);
    expect(choices.filter((c) => c.group === "secondarySteps")).toHaveLength(2);
  });
});

describe("pickedSeriesColors", () => {
  const theme = getPillarTheme(6);

  it("uses the stored choice, and the group colour of the position otherwise", () => {
    const colors = pickedSeriesColors(
      ["A", "B", "C"],
      { A: "accent", B: "gone", Z: "secondary" },
      theme,
    );
    expect(colors.get("A")).toBe(theme.palette.accent);
    expect(colors.get("B")).toBe(groupColor(1, theme));
    expect(colors.get("C")).toBe(groupColor(2, theme));
  });
});
