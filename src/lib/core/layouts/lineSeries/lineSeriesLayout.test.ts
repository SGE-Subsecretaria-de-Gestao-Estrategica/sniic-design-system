import { describe, expect, it } from "vitest";
import { LINE_SERIES_DEFAULTS } from "./defaults";
import { lineSeriesLayout } from "./lineSeriesLayout";

type Row = { year: number; value: number };

const rows: Row[] = [
  { year: 2020, value: 1 },
  { year: 2021, value: 3 },
  { year: 2022, value: 2 },
];
const config = {
  getX: (d: Row) => d.year,
  getY: (d: Row) => d.value,
  width: 300,
  height: 200,
};

describe("lineSeriesLayout end labels", () => {
  it("puts the last value right of the last point by default", () => {
    const [series] = lineSeriesLayout(rows, config).series;
    expect(series.last.isEndLabel).toBe(true);
    expect(series.last.label.textAnchor).toBe("start");
    expect(series.last.label.x).toBe(
      series.last.x + LINE_SERIES_DEFAULTS.endLabelGap,
    );
  });

  it("places the last value like the others when endLabels is off", () => {
    const layout = lineSeriesLayout(rows, { ...config, endLabels: false });
    const [series] = layout.series;
    const { last } = series;
    expect(last.isEndLabel).toBe(false);
    expect(last.label).toEqual({
      x: last.x,
      y: last.y - LINE_SERIES_DEFAULTS.valueLabelGap,
      textAnchor: "middle",
      verticalAnchor: "end",
    });
    // The name is centred on the last point.
    expect(series.nameLabel.y).toBe(last.y);
    expect(series.nameLabel.verticalAnchor).toBe("middle");
  });
});
