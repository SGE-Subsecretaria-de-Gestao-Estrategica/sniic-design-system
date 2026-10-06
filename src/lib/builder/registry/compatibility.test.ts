import { describe, expect, it } from "vitest";
import type { ColumnSchema } from "../data/types";
import { CHARTS } from "./charts";
import { channelAccepts, chartCompatibility } from "./compatibility";
import type { ChannelDef } from "./types";

const text = (name: string): ColumnSchema => ({ name, type: "text" });
const number = (name: string): ColumnSchema => ({ name, type: "number" });
const uf = (name: string): ColumnSchema => ({ name, type: "uf" });

const channelsOf = (id: string) => CHARTS.find((c) => c.id === id)!.channels;

describe("chartCompatibility", () => {
  it("accepts data that can feed every required channel", () => {
    expect(
      chartCompatibility(channelsOf("horizontalBars"), [
        text("uf"),
        number("v"),
      ]),
    ).toEqual({
      compatible: true,
      missing: [],
      reason: null,
    });
  });

  it("says which channels have no column", () => {
    const result = chartCompatibility(channelsOf("rangeRows"), [
      text("uf"),
      number("v"),
    ]);
    expect(result.compatible).toBe(false);
    expect(result.reason).toBe("Faltam colunas para: Grupo (texto).");
  });

  it("needs a distinct column per channel", () => {
    // x takes a number too, but the only number is needed by y
    const result = chartCompatibility(channelsOf("lineSeries"), [
      number("v"),
      text("uf"),
    ]);
    expect(result.missing.map((c) => c.id)).toEqual(["y"]);
  });

  it("doesn't waste a column two channels could take", () => {
    const channels: ChannelDef[] = [
      { id: "a", label: "A", accepts: ["text", "number"], required: true },
      { id: "b", label: "B", accepts: ["number"], required: true },
    ];
    expect(
      chartCompatibility(channels, [number("n"), text("t")]).compatible,
    ).toBe(true);
  });
});

describe("UF columns", () => {
  it("are text too, but text is not a UF", () => {
    expect(channelAccepts({ accepts: ["text"] }, "uf")).toBe(true);
    expect(channelAccepts({ accepts: ["uf"] }, "text")).toBe(false);
    expect(channelAccepts({ accepts: ["number"] }, "uf")).toBe(false);
  });

  it("feed charts that ask for text", () => {
    expect(
      chartCompatibility(channelsOf("horizontalBars"), [uf("UF"), number("v")])
        .compatible,
    ).toBe(true);
  });

  it("are what a hex map needs", () => {
    const withText = chartCompatibility(channelsOf("hexChoropleth"), [
      text("estado"),
      number("v"),
    ]);
    expect(withText.compatible).toBe(false);
    expect(withText.reason).toBe("Faltam colunas para: UF (UF).");
    expect(
      chartCompatibility(channelsOf("hexChoropleth"), [uf("UF"), number("v")])
        .compatible,
    ).toBe(true);
    // The type of the bars can't be the UF column itself.
    expect(
      chartCompatibility(channelsOf("hexTwinBars"), [uf("UF"), number("v")])
        .compatible,
    ).toBe(false);
  });
});
