import { describe, expect, it } from "vitest";
import {
  addMargins,
  isMarginPresetId,
  MARGIN_PRESETS,
  marginOf,
} from "./margins";
import {
  choiceValue,
  isPicked,
  layoutOptions,
  MANUAL,
  moveItem,
  ordersOpenedBy,
  pickedValues,
  readNumber,
  readOrdering,
  readText,
  readToggle,
  SORT_OPTION,
  togglePicked,
  valueLabelsOption,
} from "./options";
import { resolveParams } from "./params";
import type { OptionDef, ParamDef } from "./types";
import { FULL_PAGE_WIDTH, WIDTH_PRESETS, widthPresetOf } from "./widths";

const defs: ParamDef[] = [
  { id: "thickness", label: "", min: 8, max: 80, step: 1, default: 32 },
  { id: "gap", label: "", min: 0, max: 2, step: 0.05, default: 1 / 3 },
];

describe("resolveParams", () => {
  it("fills defaults and clamps stored values", () => {
    expect(resolveParams(defs, {})).toEqual({ thickness: 32, gap: 1 / 3 });
    expect(resolveParams(defs, { thickness: 500, gap: 0.5 })).toEqual({
      thickness: 80,
      gap: 0.5,
    });
  });

  it("ignores stored values the chart doesn't declare or that aren't numbers", () => {
    expect(resolveParams(defs, { other: 1, thickness: Number.NaN })).toEqual({
      thickness: 32,
      gap: 1 / 3,
    });
    expect(resolveParams()).toEqual({});
  });
});

describe("margin presets", () => {
  it("have unique ids and can be looked up", () => {
    const ids = MARGIN_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(isMarginPresetId("right")).toBe(true);
    expect(isMarginPresetId("nope")).toBe(false);
    expect(marginOf("even")).toEqual({
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    });
  });

  it("adds extra room side by side", () => {
    expect(addMargins(marginOf("even"), { top: 24 })).toEqual({
      top: 48,
      right: 24,
      bottom: 24,
      left: 24,
    });
    expect(addMargins(marginOf("even"))).toEqual(marginOf("even"));
  });
});

describe("readOrdering", () => {
  it("sorts by the stored choice and ignores a stored manual order", () => {
    expect(readOrdering({})).toEqual({ sort: "descending" });
    expect(
      readOrdering({ sort: "ascending", categoryOrder: ["b", "a"] }),
    ).toEqual({ sort: "ascending" });
  });

  it("on manual, keeps file order under the listed categories", () => {
    expect(readOrdering({ sort: MANUAL, categoryOrder: ["b", "a"] })).toEqual({
      sort: "none",
      categoryOrder: ["b", "a"],
    });
    expect(readOrdering({ sort: MANUAL })).toEqual({
      sort: "none",
      categoryOrder: undefined,
    });
  });
});

describe("width presets", () => {
  it("grow with the column count and include the full page", () => {
    const widths = WIDTH_PRESETS.map((p) => p.width);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
    expect(new Set(WIDTH_PRESETS.map((p) => p.id)).size).toBe(
      WIDTH_PRESETS.length,
    );
    expect(widthPresetOf(FULL_PAGE_WIDTH)?.columns).toBe(12);
    expect(widthPresetOf(600)).toBeUndefined();
    expect(widthPresetOf(null)).toBeUndefined();
  });
});

describe("toggle and values options", () => {
  it("reads a toggle as on only when true is stored", () => {
    expect(readToggle({ raisBreak: true }, "raisBreak")).toBe(true);
    expect(readToggle({ raisBreak: "yes" }, "raisBreak")).toBe(false);
    expect(readToggle({}, "raisBreak")).toBe(false);
  });

  it("ticks the listed values, or every value for a stored true", () => {
    expect(isPicked({ accentEnd: ["Cultura"] }, "accentEnd", "Cultura")).toBe(
      true,
    );
    expect(
      isPicked({ accentEnd: ["Cultura"] }, "accentEnd", "Agricultura"),
    ).toBe(false);
    expect(isPicked({ accentEnd: true }, "accentEnd", "Agricultura")).toBe(
      true,
    );
    expect(isPicked({}, "accentEnd", "Cultura")).toBe(false);
  });
});

describe("option helpers", () => {
  const order: OptionDef<never> = {
    id: "categoryOrder",
    label: "",
    step: "style",
    kind: "order",
    current: () => [],
    when: { option: "sort", equals: MANUAL },
  };
  const defs: OptionDef<never>[] = [
    SORT_OPTION,
    order,
    valueLabelsOption("ends"),
  ];

  it("keeps drawing-only options away from the layout", () => {
    const options = { sort: "ascending", valueLabels: "all", stale: 1 };
    expect(layoutOptions(defs, options)).toEqual({
      sort: "ascending",
      stale: 1,
    });
    expect(layoutOptions(undefined, options)).toEqual(options);
  });

  it("reads a choice as its stored value, or its default", () => {
    expect(choiceValue(defs, {}, "sort")).toBe("descending");
    expect(choiceValue(defs, { sort: MANUAL }, "sort")).toBe(MANUAL);
    expect(choiceValue(defs, {}, "categoryOrder")).toBeUndefined();
  });

  it("finds the order list a choice opens", () => {
    expect(ordersOpenedBy(defs, "sort", MANUAL).map((d) => d.id)).toEqual([
      "categoryOrder",
    ]);
    expect(ordersOpenedBy(defs, "sort", "ascending")).toEqual([]);
  });

  it("ticks and unticks values, keeping the column's order", () => {
    const values = ["A", "B", "C"];
    expect(pickedValues(["C", "A", "gone"], values)).toEqual(["A", "C"]);
    expect(pickedValues(true, values)).toEqual(values);
    expect(pickedValues(undefined, values)).toEqual([]);
    expect(togglePicked(["C"], values, "A", true)).toEqual(["A", "C"]);
    expect(togglePicked(true, values, "B", false)).toEqual(["A", "C"]);
    expect(togglePicked(["A"], values, "A", false)).toBeUndefined();
  });

  it("moves an item one place, and not past the ends", () => {
    expect(moveItem(["A", "B", "C"], 0, 1)).toEqual(["B", "A", "C"]);
    expect(moveItem(["A", "B", "C"], 2, -1)).toEqual(["A", "C", "B"]);
    expect(moveItem(["A", "B", "C"], 0, -1)).toEqual(["A", "B", "C"]);
    expect(moveItem(["A", "B", "C"], 2, 1)).toEqual(["A", "B", "C"]);
  });

  it("reads a number, and anything else as nothing", () => {
    expect(readNumber({ threshold: 0.4 }, "threshold")).toBe(0.4);
    expect(readNumber({ threshold: 0 }, "threshold")).toBe(0);
    expect(readNumber({ threshold: "0.4" }, "threshold")).toBeUndefined();
    expect(readNumber({}, "threshold")).toBeUndefined();
  });

  it("reads a text trimmed, and empty as nothing", () => {
    expect(readText({ caption: "  Nota " }, "caption")).toBe("Nota");
    expect(readText({ caption: "   " }, "caption")).toBeUndefined();
    expect(readText({ caption: 3 }, "caption")).toBeUndefined();
  });
});
