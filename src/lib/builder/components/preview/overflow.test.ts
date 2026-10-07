import { describe, expect, it } from "vitest";
import { describeOverflow } from "./overflow";

describe("describeOverflow", () => {
  it("says nothing when the drawing is inside", () => {
    expect(describeOverflow(null)).toBeNull();
    expect(
      describeOverflow({ top: 0, right: 0.4, bottom: 0, left: 0 }),
    ).toBeNull();
  });

  it("lists the sides that pass the frame, rounded up", () => {
    const note = describeOverflow({ top: 0, right: 24.3, bottom: 0, left: 12 });
    expect(note).toContain("12 px à esquerda, 25 px à direita");
    expect(note).not.toContain("em cima");
  });
});
