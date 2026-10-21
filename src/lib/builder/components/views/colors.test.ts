import chroma from "chroma-js";
import { describe, expect, it } from "vitest";
import { getPillarTheme } from "$lib/core/theme";
import { choroplethStepColors } from "$lib/core/layouts/hexMap";
import { pillarPalettes } from "$lib/core/theme/tokens";
import {
  groupColor,
  labelColorOn,
  baseStepColors,
  chosenSeriesPairs,
  partnerChoiceId,
  fillSwatch,
  pickedItemFills,
  pickedSeriesColors,
  rampColors,
  rampStepColors,
  SERIES_COLOR_STEPS,
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
  const steps = (prefix: string) =>
    Array.from({ length: SERIES_COLOR_STEPS }, (_, i) => `${prefix}-${i}`);

  it("offers the pillar colours, two ramps of eight stops, then the neutrals", () => {
    const choices = seriesColorChoices(theme);
    expect(SERIES_COLOR_STEPS).toBe(8);
    expect(choices.map((c) => c.id)).toEqual([
      "primary",
      "primaryVariant",
      "secondary",
      "secondaryVariant",
      "accent",
      ...steps("gradient"),
      ...steps("secondaryGradient"),
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
    const choices = seriesColorChoices(theme);
    const color = (id: string) => hex(choices.find((c) => c.id === id)!.color);
    const last = SERIES_COLOR_STEPS - 1;
    expect(color("gradient-0")).toBe(hex(palette.primary));
    expect(color(`gradient-${last}`)).toBe(hex(palette.primaryVariant));
    expect(color("secondaryGradient-0")).toBe(hex(palette.secondary));
    expect(color(`secondaryGradient-${last}`)).toBe(
      hex(palette.secondaryVariant),
    );
    expect(color("neutral-300")).toBe(hex(palette.neutral[300]));
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

  it("falls back to the line colours, the highlight in secondary", () => {
    const colors = pickedSeriesColors(
      ["A", "B", "C"],
      { A: "gradient-7" },
      theme,
      "lines",
      "C",
    );
    expect(colors.get("B")).toBe(theme.palette.primary);
    expect(colors.get("C")).toBe(theme.palette.secondary);
    expect(chroma(colors.get("A")!).hex()).toBe(
      chroma(theme.palette.primaryVariant).hex(),
    );
  });
});

describe("pickedItemFills", () => {
  const theme = getPillarTheme(6);
  const { palette } = theme;

  it("runs the first item along primary → variant and fills the others in secondary", () => {
    const fills = pickedItemFills(["A", "B", "C"], undefined, theme, "mainRamp");
    expect(fills.get("A")).toEqual({
      kind: "ramp",
      colors: [palette.primary, palette.primaryVariant],
    });
    expect(fills.get("B")).toEqual({ kind: "solid", color: palette.secondary });
    expect(fills.get("C")).toEqual({ kind: "solid", color: palette.secondary });
  });

  it("uses a stored ramp or colour, a step colour included", () => {
    const fills = pickedItemFills(
      ["A", "B", "C"],
      { A: "accent", B: "ramp-secondary", C: "gradient-7" },
      theme,
      "mainRamp",
    );
    expect(fills.get("A")).toEqual({ kind: "solid", color: palette.accent });
    expect(fills.get("B")).toEqual({
      kind: "ramp",
      colors: [palette.secondary, palette.secondaryVariant],
    });
    const c = fills.get("C");
    if (c?.kind !== "solid") throw new Error();
    expect(chroma(c.color).hex()).toBe(chroma(palette.primaryVariant).hex());
  });

  it("ignores a choice no longer offered", () => {
    const fills = pickedItemFills(["A"], { A: "ramp-gone" }, theme, "mainRamp");
    expect(fills.get("A")?.kind).toBe("ramp");
  });

  it("draws a ramp's swatch as a gradient", () => {
    expect(fillSwatch({ kind: "solid", color: "#fff" })).toBe("#fff");
    expect(fillSwatch({ kind: "ramp", colors: ["#fff", "#000"] })).toBe(
      "linear-gradient(90deg, #fff, #000)",
    );
  });
});

describe("partnerChoiceId", () => {
  it("pairs a step with the far end of its ramp", () => {
    expect(partnerChoiceId("gradient-6")).toBe("gradient-0");
    expect(partnerChoiceId("gradient-4")).toBe("gradient-0");
    expect(partnerChoiceId("gradient-3")).toBe("gradient-7");
    expect(partnerChoiceId("gradient-0")).toBe("gradient-7");
    expect(partnerChoiceId("secondaryGradient-7")).toBe("secondaryGradient-0");
  });

  it("pairs a pillar colour with its variant, and keeps the rest", () => {
    expect(partnerChoiceId("primary")).toBe("primaryVariant");
    expect(partnerChoiceId("secondaryVariant")).toBe("secondary");
    expect(partnerChoiceId("accent")).toBe("accent");
    expect(partnerChoiceId("neutral-300")).toBe("neutral-300");
  });
});

describe("chosenSeriesPairs", () => {
  const theme = getPillarTheme(6);
  const hex = (c: string) => chroma(c).hex();

  it("gives each chosen series its colour and its partner", () => {
    const pairs = chosenSeriesPairs(
      { A: "gradient-6", B: "primary", C: "gone" },
      theme,
    );
    expect(hex(pairs.get("A")!.variant)).toBe(hex(theme.palette.primary));
    expect(pairs.get("B")).toEqual({
      main: theme.palette.primary,
      variant: theme.palette.primaryVariant,
    });
    expect(pairs.has("C")).toBe(false);
  });
});

describe("baseStepColors / rampStepColors", () => {
  const theme = getPillarTheme(6);
  const { palette } = theme;
  const hex = (c: string) => chroma(c).hex();

  it("runs from a base colour to a pillar colour, or back", () => {
    const up = baseStepColors("200", "secondaryVariant", "fromBase", 5, theme);
    expect(up).toHaveLength(5);
    expect(hex(up[0])).toBe(hex(palette.base[200]));
    expect(hex(up[4])).toBe(hex(palette.secondaryVariant));
    const down = baseStepColors("300", "primary", "toBase", 4, theme);
    expect(hex(down[0])).toBe(hex(palette.primary));
    expect(hex(down[3])).toBe(hex(palette.base[300]));
  });

  it("uses the chart's pair ramp unless the base kind is picked", () => {
    const pair = () => ["#000000"];
    expect(rampStepColors({}, 3, theme, pair)).toEqual(["#000000"]);
    const base = rampStepColors(
      { rampKind: "base", rampBase: "100", rampTarget: "secondary" },
      3,
      theme,
      pair,
    );
    expect(hex(base[0])).toBe(hex(palette.base[100]));
    expect(hex(base[2])).toBe(hex(palette.secondary));
  });
});
