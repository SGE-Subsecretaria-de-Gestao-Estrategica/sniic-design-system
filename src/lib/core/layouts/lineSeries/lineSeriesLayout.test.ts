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

describe("lineSeriesLayout panels", () => {
  type PanelRow = Row & { region: string; sector: string };
  const panelRows: PanelRow[] = ["Norte", "Sul"].flatMap((region, r) =>
    ["Cultura", "Turismo"].flatMap((sector, s) =>
      rows.map((d) => ({ ...d, value: d.value * (r + 1) + s, region, sector })),
    ),
  );
  const panelConfig = {
    getX: (d: PanelRow) => d.year,
    getY: (d: PanelRow) => d.value,
    getSeries: (d: PanelRow) => d.sector,
    getPanel: (d: PanelRow) => d.region,
    width: 300,
    height: 400,
  };
  const { panelGap, panelTitleHeight } = LINE_SERIES_DEFAULTS;

  it("keeps one panel covering the plot without getPanel", () => {
    const layout = lineSeriesLayout(rows, config);
    expect(layout.isPaneled).toBe(false);
    expect(layout.panels).toHaveLength(1);
    expect(layout.panels[0]).toMatchObject({ top: 0, height: 200 });
    expect(layout.panels[0].title).toBeUndefined();
    expect(layout.series[0].key).toBe(layout.series[0].name);
  });

  it("stacks one panel per value, with a title band and a gap", () => {
    const layout = lineSeriesLayout(panelRows, panelConfig);
    const [north, south] = layout.panels;
    expect(layout.panels.map((p) => p.key)).toEqual(["Norte", "Sul"]);
    const slot = (400 - panelGap) / 2;
    expect(north.slotTop).toBe(0);
    expect(north.top).toBe(panelTitleHeight);
    expect(north.height).toBeCloseTo(slot - panelTitleHeight);
    expect(south.slotTop).toBeCloseTo(slot + panelGap);
    expect(north.title).toMatchObject({ x: 0, y: 0, textAnchor: "start" });
  });

  it("draws each panel's series inside its plot, keyed by panel", () => {
    const layout = lineSeriesLayout(panelRows, panelConfig);
    expect(layout.series.map((s) => s.key)).toEqual([
      "Norte::Cultura",
      "Norte::Turismo",
      "Sul::Cultura",
      "Sul::Turismo",
    ]);
    for (const series of layout.series) {
      const panel = layout.panels.find((p) => p.key === series.panel)!;
      for (const point of series.points) {
        expect(point.y).toBeGreaterThanOrEqual(panel.top - 1e-9);
        expect(point.y).toBeLessThanOrEqual(panel.bottom + 1e-9);
      }
    }
  });

  it("shares the y domain by default, or not when asked", () => {
    const shared = lineSeriesLayout(panelRows, panelConfig);
    const [a, b] = shared.panels.map((p) => p.yScale.domain());
    expect(a).toEqual(b);
    const free = lineSeriesLayout(panelRows, {
      ...panelConfig,
      shareY: false,
    });
    const [c, d] = free.panels.map((p) => p.yScale.domain());
    expect(c).not.toEqual(d);
  });

  it("puts the listed panels first", () => {
    const layout = lineSeriesLayout(panelRows, {
      ...panelConfig,
      panelOrder: ["Sul"],
    });
    expect(layout.panels.map((p) => p.key)).toEqual(["Sul", "Norte"]);
  });

  it("returns no panels for empty data", () => {
    const layout = lineSeriesLayout([] as PanelRow[], panelConfig);
    expect(layout.panels).toEqual([]);
    expect(layout.series).toEqual([]);
  });
});
