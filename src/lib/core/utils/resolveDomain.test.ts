import { describe, expect, it } from "vitest";
import resolveDomain from "./resolveDomain";

describe("resolveDomain", () => {
  const values = [10, 20, 30];

  it("derives the domain from the data, padded", () => {
    expect(resolveDomain(values, { padding: 0.1 })).toEqual([8, 32]);
  });

  it("uses a fully pinned domain as is", () => {
    expect(resolveDomain(values, { pinned: [0, 100], padding: 0.1 })).toEqual([0, 100]);
  });

  it("pins one end and derives the other", () => {
    expect(resolveDomain(values, { pinned: [0, undefined], padding: 0.1 })).toEqual([0, 32]);
    expect(resolveDomain(values, { pinned: [undefined, 50], padding: 0.1 })).toEqual([8, 50]);
  });
});
