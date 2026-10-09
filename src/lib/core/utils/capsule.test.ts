import { describe, expect, it } from "vitest";
import { capsuleBar, capsuleFrame, capsuleStack, tipSide } from "./shapeFactory";

describe("capsuleFrame", () => {
  it.each([
    ["horizontal", false, 1, "right"],
    ["horizontal", true, -1, "left"],
    ["vertical", false, -1, "top"],
    ["vertical", true, 1, "bottom"],
  ] as const)("%s, reverse=%s grows %i toward the %s", (orientation, reverse, dir, side) => {
    const frame = capsuleFrame({ x: 0, y: 0, width: 40, height: 40, reverse }, orientation);
    expect(frame.dir).toBe(dir);
    expect(tipSide(frame)).toBe(side);
  });

  it("never reports a negative length or thickness", () => {
    const frame = capsuleFrame({ width: -5, height: -3 }, "horizontal");
    expect(frame.length).toBe(0);
    expect(frame.thickness).toBe(0);
  });
});

describe("capsuleBar", () => {
  const horizontal = { orientation: "horizontal", dotRatio: 0.55 } as const;

  it("clips a horizontal bar to its box and centres the dot in the tip", () => {
    const bar = capsuleBar({ ...horizontal, x: 10, y: 20, width: 100, height: 30 });
    expect(bar.clip).toEqual({ x: 10, y: 20, width: 100, height: 30 });
    expect(bar.gradient).toEqual({ from: { x: 10, y: 35 }, to: { x: 110, y: 35 } });
    expect(bar.dot).toEqual({ x: 95, y: 35, radius: 15 * 0.55 });
  });

  it("grows a reversed bar leftwards from its right edge", () => {
    const bar = capsuleBar({ ...horizontal, x: 10, y: 0, width: 100, height: 30, reverse: true });
    expect(bar.gradient.from.x).toBe(110);
    expect(bar.gradient.to.x).toBe(10);
    expect(bar.dot.x).toBe(25);
  });

  it("grows a vertical bar upwards from its bottom edge", () => {
    const bar = capsuleBar({ ...horizontal, orientation: "vertical", x: 0, y: 50, width: 20, height: 100 });
    expect(bar.gradient).toEqual({ from: { x: 10, y: 150 }, to: { x: 10, y: 50 } });
    expect(bar.dot).toMatchObject({ x: 10, y: 60 });
  });

  it("keeps the whole tip disc on a bar shorter than its thickness, for the clip to cut", () => {
    const bar = capsuleBar({ ...horizontal, x: 100, y: 0, width: 6, height: 30 });
    // The path starts a full diameter behind the tip, i.e. past the base.
    expect(bar.path.startsWith("M76,0")).toBe(true);
    expect(bar.clip).toEqual({ x: 100, y: 0, width: 6, height: 30 });
  });

  it("sizes the dot by the ratio it is given", () => {
    expect(capsuleBar({ ...horizontal, width: 100, height: 20, dotRatio: 0.5 }).dot.radius).toBe(5);
  });
});

describe("capsuleStack", () => {
  const segments = [
    { length: 30, fill: "a" },
    { length: 0, fill: "skipped" },
    { length: 20, fill: "b" },
  ];

  it("stacks pieces upward from the base and drops empty segments", () => {
    const stack = capsuleStack(segments, { orientation: "vertical", gap: 0, x: 0, y: 0, width: 10, height: 100 });
    expect(stack.total).toBe(50);
    expect(stack.pieces.map((p) => [p.fill, p.from, p.to])).toEqual([
      ["a", 0, 30],
      ["b", 30, 50],
    ]);
    expect(stack.pieces[0].rect).toEqual({ x: 0, y: 70, width: 10, height: 30 });
    expect(stack.clip).toEqual({ x: 0, y: 50, width: 10, height: 50 });
  });

  it("puts one gap between each pair of pieces, centred on the joint", () => {
    const stack = capsuleStack(segments, { orientation: "vertical", gap: 4, width: 10, height: 100 });
    expect(stack.gaps).toEqual([{ x: 0, y: 68, width: 10, height: 4 }]);
  });
});
