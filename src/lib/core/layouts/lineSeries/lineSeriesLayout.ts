import * as d3 from "d3";
import type { ScaleLinear } from "d3";
import resolveDomain from "$lib/core/utils/resolveDomain";
import { placeOnSide, placeRight } from "../labels";
import { segmentedAxisLayout } from "../segmentedAxis";
import { stackPanelsLayout } from "../stackPanels";
import { resolveSpacing } from "./defaults";
import { createYScale } from "./geometry";
import { groupPanels, groupSeries, toEntries } from "./ordering";
import type {
  LabelSide,
  LineSeriesEntry,
  LineSeriesItem,
  LineSeriesLayout,
  LineSeriesLayoutConfig,
  LineSeriesPanel,
  LineSeriesPoint,
} from "./types";

/**
 * Multi-series line chart, optionally with breaks in the x axis and split
 * into stacked panels (`getPanel`) that share it. Returns the per-segment
 * scales, the panels, the points with label positions, one path per segment,
 * bridges across the breaks and the end labels. The only function that reads
 * the config.
 */
export function lineSeriesLayout<D>(
  data: D[],
  config: LineSeriesLayoutConfig<D>,
): LineSeriesLayout<D> {
  const spacing = resolveSpacing(config);
  const paneled = config.getPanel !== undefined;
  const entries = toEntries(
    data,
    config.getX,
    config.getY,
    config.getSeries,
    config.getPanel,
  );

  const xAxis =
    config.xAxis ??
    segmentedAxisLayout(entries, {
      getX: (e) => e.xValue,
      width: config.width,
      breaksAfter: config.breaksAfter,
      breakWidthRatio: config.breakWidthRatio,
    });
  const { xScale } = xAxis;
  const segmentAt = (e: { xValue: LineSeriesPoint<D>["xValue"] }) =>
    xAxis.segmentOf(e.xValue);

  const domainOf = (some: LineSeriesEntry<D>[]) =>
    resolveDomain(
      some.map((e) => e.yValue),
      { pinned: config.yDomain, padding: spacing.yPaddingRatio },
    );
  const sharedDomain = domainOf(entries);
  const shareY = config.shareY ?? true;

  const sideOf = (series: string): LabelSide => {
    const side = config.labelSide ?? "above";
    return typeof side === "function" ? side(series) : side;
  };
  const endLabels = config.endLabels ?? true;

  const buildSeries = (
    name: string,
    seriesEntries: LineSeriesEntry<D>[],
    panel: string,
    yScale: ScaleLinear<number, number>,
    index: number,
  ): LineSeriesItem<D> => {
    const key = paneled ? `${panel}::${name}` : name;
    const side = sideOf(name);
    const points = seriesEntries.map((entry, i): LineSeriesPoint<D> => {
      const segment = segmentAt(entry);
      const prev = seriesEntries[i - 1];
      const next = seriesEntries[i + 1];
      const x = xScale(entry.xValue);
      const y = yScale(entry.yValue);
      const isLast = i === seriesEntries.length - 1;
      const isEndLabel = isLast && endLabels;
      return {
        ...entry,
        key: `${key}::${+entry.xValue}`,
        index: i,
        segment,
        x,
        y,
        isFirst: i === 0,
        isLast,
        isSegmentStart: !prev || segmentAt(prev) !== segment,
        isSegmentEnd: !next || segmentAt(next) !== segment,
        isEndLabel,
        label: isEndLabel
          ? placeOnSide({ x, y }, side, spacing.endValueGap, "start", spacing.endLabelGap)
          : placeOnSide({ x, y }, side, spacing.valueLabelGap),
      };
    });

    const paths = [...d3.group(points, (p) => p.segment).values()];
    const bridges = paths.slice(1).map((path, i) => ({
      from: { x: paths[i].at(-1)!.x, y: paths[i].at(-1)!.y },
      to: { x: path[0].x, y: path[0].y },
    }));
    const last = points[points.length - 1];

    return {
      key,
      index,
      name,
      panel,
      side,
      points,
      paths,
      bridges,
      last,
      // Above: hangs from the line, under the end value. Below: stacks under
      // it. Without an end value: centred on the last point.
      nameLabel: !endLabels
        ? placeRight(last, spacing.endLabelGap, 0, "middle")
        : placeRight(
            last,
            spacing.endLabelGap,
            side === "above" ? 0 : spacing.endValueGap + spacing.endValueHeight,
          ),
    };
  };

  const groups = groupPanels(entries, paneled, config.panelOrder);
  const slots = stackPanelsLayout(
    groups.map(([key]) => ({ key })),
    {
      width: config.width,
      height: config.height,
      gap: paneled ? spacing.panelGap : 0,
    },
  );
  const titleHeight = paneled ? spacing.panelTitleHeight : 0;

  const panels: LineSeriesPanel[] = [];
  const series: LineSeriesItem<D>[] = [];
  groups.forEach(([panelKey, panelEntries], index) => {
    const slot = slots.panels[index];
    const top = slot.top + titleHeight;
    const height = Math.max(0, slot.height - titleHeight);
    const yScale = createYScale(
      shareY ? sharedDomain : domainOf(panelEntries),
      height,
      top,
    );
    panels.push({
      key: panelKey,
      index,
      slotTop: slot.top,
      top,
      height,
      bottom: top + height,
      yScale,
      title: paneled ? placeRight({ x: 0, y: slot.top }, 0) : undefined,
    });
    for (const [name, seriesEntries] of groupSeries(
      panelEntries,
      config.seriesOrder,
    )) {
      series.push(
        buildSeries(name, seriesEntries, panelKey, yScale, series.length),
      );
    }
  });

  return {
    series,
    panels,
    isPaneled: paneled,
    xAxis,
    segments: xAxis.segments,
    breaks: xAxis.breaks,
    xScale,
    yScale: panels[0]?.yScale ?? createYScale(sharedDomain, config.height),
    width: config.width,
    height: config.height,
  };
}
