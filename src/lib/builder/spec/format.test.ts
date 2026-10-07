import { describe, expect, it } from "vitest";
import { createFormatter, DEFAULT_FORMAT, togglePercent } from "./format";

describe("createFormatter", () => {
  it("formats in pt-BR, keeping the value's own decimals by default", () => {
    const format = createFormatter(DEFAULT_FORMAT);
    expect(format(1234.5)).toBe("1.234,5");
    expect(format(1234)).toBe("1.234");
  });

  it("fixes decimals, compacts and adds a prefix and suffix", () => {
    expect(createFormatter({ ...DEFAULT_FORMAT, decimals: 2 })(1234.5)).toBe(
      "1.234,50",
    );
    expect(
      createFormatter({ ...DEFAULT_FORMAT, compact: true, decimals: 1 })(
        1234567,
      ),
    ).toBe("1,2 mi");
    expect(
      createFormatter({ ...DEFAULT_FORMAT, prefix: "R$ ", suffix: "%" })(10),
    ).toBe("R$ 10%");
  });

  it("shows shares as percentages", () => {
    const percent = {
      ...DEFAULT_FORMAT,
      ...togglePercent(DEFAULT_FORMAT, true),
    };
    expect(createFormatter(percent)(0.25)).toBe("25%");
    // 0.07 × 100 isn't exactly 7 in floating point.
    expect(createFormatter(percent)(0.07)).toBe("7%");
    expect(createFormatter({ ...percent, decimals: 1 })(0.1234)).toBe("12,3%");
  });
});

describe("togglePercent", () => {
  it("fills an empty suffix with % and takes it back out", () => {
    const on = { ...DEFAULT_FORMAT, ...togglePercent(DEFAULT_FORMAT, true) };
    expect(on).toMatchObject({ percent: true, suffix: "%" });
    expect(togglePercent(on, false)).toEqual({ percent: false, suffix: "" });
  });

  it("keeps a suffix the user wrote", () => {
    const points = { ...DEFAULT_FORMAT, suffix: "pp" };
    expect(togglePercent(points, true)).toEqual({
      percent: true,
      suffix: "pp",
    });
    expect(togglePercent({ ...points, percent: true }, false)).toEqual({
      percent: false,
      suffix: "pp",
    });
  });
});
