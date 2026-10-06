import { describe, expect, it } from "vitest";
import { CHARTS } from "./charts";
import { CHART_GROUPS, groupCharts } from "./groups";

describe("groupCharts", () => {
  const groups = groupCharts(CHARTS.map((chart) => ({ chart })));

  it("lists the groups in order, each with its charts in registry order", () => {
    expect(
      groups.map(({ group, items }) => [
        group.id,
        items.map((item) => item.chart.id),
      ]),
    ).toEqual([
      ["categories", ["horizontalBars", "rangeRows", "bubbleColumns"]],
      ["lines", ["lineSeries", "lineBubbleRow", "lineDifference"]],
      ["hexMaps", ["hexChoropleth", "hexTwinBars"]],
    ]);
  });

  it("leaves out a group without charts", () => {
    const lines = CHARTS.filter((chart) => chart.group === "lines");
    expect(groupCharts(lines.map((chart) => ({ chart })))).toHaveLength(1);
    expect(CHART_GROUPS).toHaveLength(3);
  });
});
