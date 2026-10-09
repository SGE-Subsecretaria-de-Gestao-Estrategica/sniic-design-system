import { describe, expect, it } from "vitest";
import { liveTheme } from "./context";
import type { ChartTheme } from "./types";

describe("liveTheme", () => {
  it("reads every property through the getter, so later changes show", () => {
    let current: ChartTheme = { bar: { fill: "red" } };
    const theme = liveTheme(() => current);
    expect(theme.bar?.fill).toBe("red");
    current = { bar: { fill: "blue" } };
    expect(theme.bar?.fill).toBe("blue");
  });

  it("spreads and answers `in` like the theme it points to", () => {
    const theme = liveTheme(() => ({ bar: { fill: "red" }, axis: { tickLength: 1 } }));
    expect({ ...theme }).toEqual({ bar: { fill: "red" }, axis: { tickLength: 1 } });
    expect("bar" in theme).toBe(true);
    expect("arc" in theme).toBe(false);
  });
});
