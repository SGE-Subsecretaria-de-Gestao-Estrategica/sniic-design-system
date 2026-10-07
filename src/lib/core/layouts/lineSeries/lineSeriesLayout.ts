import * as d3 from "d3";
import resolveDomain from "$lib/core/utils/resolveDomain";
import { placeOnSide, placeRight } from "../labels";
import { segmentedAxisLayout } from "../segmentedAxis";
import { resolveSpacing } from "./defaults";
import { createYScale } from "./geometry";
import { groupSeries, toEntries } from "./ordering";
import type {
  LabelSide,
  LineSeriesItem,
  LineSeriesLayout,
  LineSeriesLayoutConfig,
  LineSeriesPoint,
} from "./types";

/**
 * Multi-series line chart, optionally with breaks in the x axis. Returns the
 * per-segment scales, the points with label positions, one path per segment,
 * bridges across the breaks and the end labels. The only function that reads
 * the config.
 */
export function lineSeriesLayout<D>(
  data: D[],
  config: LineSeriesLayoutConfig<D>,
): LineSeriesLayout<D> {
  const spacing = resolveSpacing(config);
  const entries = toEntries(data, config.getX, config.getY, config.getSeries);

  const xAxis =
    config.xAxis ??
    segmentedAxisLayout(entries, {
      getX: (e) => e.xValue,
      width: config.width,
      breaksAfter: config.breaksAfter,
      breakWidthRatio: config.breakWidthRatio,
    });
  const { xScale } = xAxis;
  const segmentAt = (e: { xValue: LineSeriesPoint<D>["xValue"] }) => xAxis.segmentOf(e.xValue);

  const yScale = createYScale(
    resolveDomain(
      entries.map((e) => e.yValue),
      { pinned: config.yDomain, padding: spacing.yPaddingRatio },
    ),
    config.height,
  );

  const sideOf = (series: string): LabelSide => {
    const side = config.labelSide ?? "above";
    return typeof side === "function" ? side(series) : side;
  };
  const endLabels = config.endLabels ?? true;

  const series = groupSeries(entries, config.seriesOrder).map(
    ([key, seriesEntries], index): LineSeriesItem<D> => {
      const side = sideOf(key);
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
        side,
        points,
        paths,
        bridges,
        last,
        // Above: hangs from the line, under the end value. Below: stacks under it.
        nameLabel: placeRight(
          last,
          spacing.endLabelGap,
          side === "above" ? 0 : spacing.endValueGap + spacing.endValueHeight,
        ),
      };
    },
  );

  return {
    series,
    xAxis,
    segments: xAxis.segments,
    breaks: xAxis.breaks,
    xScale,
    yScale,
    width: config.width,
    height: config.height,
  };
}
