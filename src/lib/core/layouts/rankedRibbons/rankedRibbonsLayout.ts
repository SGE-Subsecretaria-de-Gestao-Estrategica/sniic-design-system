import * as d3 from "d3";
import { placeCentered, placeOnSide, placeRight } from "../labels";
import {
  SEGMENTED_AXIS_DEFAULTS,
  findSegment,
  valuesBySegment,
  type AxisSegment,
  type SegmentedAxis,
} from "../segmentedAxis";
import type { AxisBreak, XValue } from "../types";
import { resolveSpacing } from "./defaults";
import {
  bendReach,
  clearShare,
  placeValue,
  columnPositions,
  columnScale,
  ribbonPath,
  spreadBlocks,
  type Band,
  type RibbonPoint,
} from "./geometry";
import { fixedStackOrder, rowsByColumn, seriesKeys, stackColumn } from "./ordering";
import type {
  RankedRibbon,
  RankedRibbonsColumn,
  RankedRibbonsLayout,
  RankedRibbonsLayoutConfig,
  RankedRibbonsSlot,
} from "./types";

/**
 * Ranked ribbons: one ribbon per series running across the columns (years),
 * stacked by value at each column, the largest on top or at the bottom
 * (`rankDirection`), or in one fixed order (`ranked: false`). A ribbon holds
 * its thickness flat for a plateau around each column and bends between
 * columns, so ribbons cross where the ranking changes. The x axis may break
 * (`breaksAfter`): each side gets its own segment and the ribbons cross the
 * gap as `bridges`. The only function that reads the config.
 */
export function rankedRibbonsLayout<D>(
  data: D[],
  config: RankedRibbonsLayoutConfig<D>,
): RankedRibbonsLayout<D> {
  const spacing = resolveSpacing(config);
  const { width, height, getX, getY, getSeries } = config;
  const series = seriesKeys(data, getSeries, config.seriesOrder);
  const rows = rowsByColumn(data, getX, getSeries);
  const valueOf = (row: D | undefined) => (row ? Math.max(0, getY(row) || 0) : 0);
  const ranked = config.ranked ?? true;
  const direction = ranked ? (config.rankDirection ?? "largestOnTop") : null;
  const stackOrder = fixedStackOrder(series, config.stackOrder);

  // Columns, grouped into segments by the breaks.
  const segmentTicks = valuesBySegment(data, getX, config.breaksAfter ?? []);
  const breakWidth = width * (config.breakWidthRatio ?? SEGMENTED_AXIS_DEFAULTS.breakWidthRatio);
  const { xs, step } = columnPositions(
    segmentTicks.map((t) => t.length),
    width,
    spacing.plateau,
    breakWidth,
  );
  const half = step * spacing.plateau;

  // Thickness: the tallest stack, gaps included, fills the plot under the totals.
  const totals = segmentTicks.flat().map((x) => d3.sum(series, (s) => valueOf(rows.get(+x)?.get(s))));
  const counts = segmentTicks.flat().map((x) => series.filter((s) => valueOf(rows.get(+x)?.get(s)) > 0).length);
  const room = config.totals === false ? 0 : spacing.totalsRoom;
  const gaps = Math.max(0, (d3.max(counts) ?? 0) - 1) * spacing.ribbonGap;
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(totals) || 1])
    .range([0, Math.max(0, height - room - gaps)]);

  const flat = segmentTicks.flatMap((ticks, segment) => ticks.map((xValue, i) => ({ xValue, segment, x: xs[segment][i] })));
  const lastIndex = flat.length - 1;
  const endLabels = config.endLabels ?? true;

  const columns: RankedRibbonsColumn<D>[] = flat.map(({ xValue, segment, x }, index) => {
    const byKey = rows.get(+xValue);
    const total = totals[index];
    const isLast = index === lastIndex;
    // Built from the base up.
    const ordered = stackColumn(
      series.map((s, seriesIndex) => ({ series: s, seriesIndex, row: byKey?.get(s), value: valueOf(byKey?.get(s)) })),
      direction,
      stackOrder,
    ).reverse();
    let cursor = height;
    const slots = ordered.map((s, i): RankedRibbonsSlot<D> => {
      const y1 = cursor;
      const y0 = y1 - yScale(s.value);
      // A zero takes no height and no gap: the ribbon tapers between its neighbours.
      if (s.value > 0) cursor = y0 - spacing.ribbonGap;
      return {
        key: `${s.series}::${+xValue}`,
        series: s.series,
        seriesIndex: s.seriesIndex,
        column: index,
        xValue,
        value: s.value,
        share: total > 0 ? s.value / total : 0,
        rank: ordered.length - 1 - i,
        x,
        x0: x - half,
        x1: x + half,
        y0,
        y1,
        isEndLabel: isLast && endLabels,
        labelFits: false,
        labelReach: { left: null, right: null },
        label: placeCentered({ x, y: (y0 + y1) / 2 }),
        labelRoom: 0,
        data: s.row,
      };
    });
    const top = slots.length ? Math.min(...slots.map((s) => s.y0)) : height;
    const prev = flat[index - 1];
    const next = flat[index + 1];
    return {
      key: String(+xValue),
      index,
      xValue,
      segment,
      x,
      x0: x - half,
      x1: x + half,
      total,
      top,
      isFirst: index === 0,
      isLast,
      isSegmentStart: !prev || prev.segment !== segment,
      isSegmentEnd: !next || next.segment !== segment,
      slots,
      totalLabel: placeOnSide({ x, y: top }, "above", spacing.totalGap),
    };
  });

  const slotOf = (column: RankedRibbonsColumn<D>, s: string) => column.slots.find((slot) => slot.series === s)!;

  // Room for each value: its plateau, plus as far into the bends either side
  // as the text stays clear. Not across a break, where the ribbons are faded.
  const bandOf = (slot: RankedRibbonsSlot<D>): Band => ({ y0: slot.y0, y1: slot.y1 });
  const reach = (slot: RankedRibbonsSlot<D>, from: RankedRibbonsColumn<D>, to: RankedRibbonsColumn<D> | undefined) => {
    if (!to || to.segment !== from.segment) return null;
    const mid = (slot.y0 + slot.y1) / 2;
    const half = (spacing.valueLabelHeight + spacing.valueLabelPadding) / 2;
    const own = [bandOf(slot), bandOf(slotOf(to, slot.series))] as const;
    const others = from.slots
      .filter((o) => o !== slot)
      .map((o) => [bandOf(o), bandOf(slotOf(to, o.series))] as const);
    const length = Math.abs(to.x - from.x) - (from.x1 - from.x0);
    return {
      shared: bendReach(clearShare(own, others, mid - half, mid + half), length),
      alone: bendReach(clearShare(own, others, mid - half, mid + half, 1), length),
    };
  };
  for (const column of columns) {
    for (const slot of column.slots) {
      slot.labelFits = slot.y1 - slot.y0 >= spacing.valueLabelHeight + spacing.valueLabelPadding;
      if (!slot.labelFits) continue;
      slot.labelReach = {
        left: reach(slot, column, columns[column.index - 1]),
        right: reach(slot, column, columns[column.index + 1]),
      };
      const { x, y, room } = placeValue(slot, { left: false, right: false }, spacing.valueLabelPadding);
      slot.label = placeCentered({ x, y });
      slot.labelRoom = room;
    }
  }
  const plateauOf = (slot: RankedRibbonsSlot<D>): RibbonPoint[] => [
    { x: slot.x0, y0: slot.y0, y1: slot.y1 },
    { x: slot.x1, y0: slot.y0, y1: slot.y1 },
  ];
  const bySegment = [...d3.group(columns, (c) => c.segment).values()];

  const ribbons: RankedRibbon<D>[] = series
    .map((s, index) => {
      const slots = columns.map((c) => slotOf(c, s));
      const paths = bySegment.map((cols) => ribbonPath(cols.flatMap((c) => plateauOf(slotOf(c, s)))));
      const bridges = bySegment.slice(1).map((cols, i) =>
        ribbonPath([plateauOf(slotOf(bySegment[i].at(-1)!, s))[1], plateauOf(slotOf(cols[0], s))[0]]),
      );
      return { key: s, index, sum: d3.sum(slots, (slot) => slot.value), paths, bridges, last: slots[slots.length - 1] };
    })
    .filter((r) => r.sum > 0)
    .sort((a, b) => a.sum - b.sum);

  // The end labels, top to bottom, pushed apart in the right margin.
  if (endLabels && columns.length) {
    const closing = [...ribbons]
      .filter((r) => r.last.value > 0)
      .sort((a, b) => a.last.y0 - b.last.y0);
    const lines = config.endNameLines ?? (() => 1);
    const blocks = closing.map((r) => spacing.endValueHeight + spacing.endNameHeight * Math.max(1, lines(r.key)));
    const anchors = closing.map((r) => (r.last.y0 + r.last.y1) / 2);
    const tops = spreadBlocks(anchors, blocks, spacing.endLabelSpacing, height);
    const labelX = width + spacing.endLabelGap;
    closing.forEach((r, i) => {
      const top = tops[i];
      r.end = {
        value: placeRight({ x: labelX, y: top }, 0),
        name: placeRight({ x: labelX, y: top }, 0, spacing.endValueHeight),
        leader: {
          from: { x: width + 2, y: anchors[i] },
          to: { x: labelX - 4, y: top + spacing.endValueHeight / 2 },
        },
      };
    });
  }

  const segments: AxisSegment[] = segmentTicks.map((ticks, index) => {
    const range: [number, number] = [xs[index][0], xs[index][xs[index].length - 1]];
    return {
      index,
      domain: [ticks[0], ticks[ticks.length - 1]],
      range,
      scale: columnScale(ticks, xs[index]),
      ticks,
    };
  });
  const breaks: AxisBreak[] = bySegment.slice(1).map((cols, i) => ({
    index: i,
    x0: bySegment[i].at(-1)!.x1,
    x1: cols[0].x0,
  }));
  const segmentOf = (x: XValue) => findSegment(segments, x);
  const xAxis: SegmentedAxis = {
    segments,
    breaks,
    segmentOf,
    xScale: (x) => (segments.length ? segments[segmentOf(x)].scale(x as never) : 0),
    width,
  };

  return {
    width,
    height,
    columns,
    ribbons,
    series,
    ranked,
    stackOrder,
    xAxis,
    yScale,
    valueLabelPadding: spacing.valueLabelPadding,
  };
}
