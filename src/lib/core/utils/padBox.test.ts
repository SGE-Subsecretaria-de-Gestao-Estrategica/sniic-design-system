import { describe, expect, it } from "vitest";
import { padBox } from "./padBox";

describe("padBox", () => {
  const box = { x: 10, y: 20, width: 30, height: 40 };

  it("pads every side by one number", () => {
    expect(padBox(box, 2)).toEqual({ x: 8, y: 18, width: 34, height: 44 });
  });

  it("pads horizontally and vertically apart", () => {
    expect(padBox(box, [6, 2])).toEqual({ x: 4, y: 18, width: 42, height: 44 });
  });
});
