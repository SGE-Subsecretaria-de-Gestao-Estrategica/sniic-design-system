import * as d3 from "d3";
import { placeLeft, placeOnSide, placeRight } from "../labels";
import { resolveSpacing } from "./defaults";
import { axisLine, coverageDomain, startBreak } from "./geometry";
import { orderBlocks, toEntries } from "./ordering";
import type {
  CoverageBlock,
  CoverageDot,
  CoverageDotsLayout,
  CoverageDotsLayoutConfig,
  CoverageReference,
} from "./types";

/**
 * Coverage dots: one row per category, a dot at its value on a shared axis
 * that need not start at zero, rows split into named blocks (one per cut of
 * the data — rede, etapa, localização) and an optional reference line across
 * them all. When the axis starts above zero it carries a torn-axis mark, so
 * the dots are read as positions, never as lengths. The only function that
 * reads the config.
 */
export function coverageDotsLayout<D>(
  data: D[],
  config: CoverageDotsLayoutConfig<D>,
): CoverageDotsLayout<D> {
  const spacing = resolveSpacing(config);
  const entries = toEntries(data, config.getCategory, config.getValue, config.getGroup);
  const grouped = orderBlocks(
    entries,
    config.sort ?? "descending",
    config.categoryOrder,
    config.groupOrder,
  );
  const named = config.getGroup !== undefined;

  const domain = coverageDomain(
    entries.map((e) => e.value),
    config.reference,
    spacing.domainPaddingRatio,
    spacing.tickCount,
    config.valueDomain,
  );
  const end = Math.max(0, config.width - spacing.insetEnd);
  const valueScale = d3.scaleLinear().domain(domain).range([0, end]);
  const truncated = domain[0] > 0;

  const thickness = spacing.rowThickness;
  const rowGap = thickness * spacing.rowGapRatio;
  const r = spacing.markerRadius;
  const plotTop = config.reference !== undefined ? spacing.referenceLabelHeight : 0;

  const rows: CoverageDot<D>[] = [];
  let cursor = plotTop;
  const blocks = grouped.map(({ group, rows: entries }, b): CoverageBlock<D> => {
    if (b > 0) cursor += spacing.blockGap + rowGap;
    const top = cursor;
    const header = named
      ? placeRight({ x: 0, y: top + spacing.headerHeight / 2 }, 0, 0, "middle")
      : null;
    if (named) cursor += spacing.headerHeight;

    const blockRows = entries.map((entry, i): CoverageDot<D> => {
      const y = cursor + i * (thickness + rowGap);
      const cy = y + thickness / 2;
      const x = valueScale(entry.value);
      const row: CoverageDot<D> = {
        ...entry,
        key: `${entry.group}::${entry.category}`,
        index: rows.length,
        indexInBlock: i,
        y,
        cy,
        marker: { x, y: cy, radius: r },
        track: { from: { x: 0, y: cy }, to: { x: end, y: cy } },
        valueLabel: placeRight({ x, y: cy }, r + spacing.valueLabelGap, 0, "middle"),
        categoryLabel: placeLeft({ x: 0, y: cy }, spacing.categoryLabelGap),
        delta: config.reference === undefined ? undefined : entry.value - config.reference,
      };
      rows.push(row);
      return row;
    });
    cursor += entries.length * thickness + Math.max(0, entries.length - 1) * rowGap;

    return { key: group, label: group, index: b, y: top, header, rows: blockRows };
  });

  const axisY = rows.length ? cursor + rowGap : plotTop;
  const mark = truncated ? startBreak(axisY, spacing.breakSize) : null;

  let reference: CoverageReference | null = null;
  if (config.reference !== undefined) {
    const x = valueScale(config.reference);
    reference = {
      value: config.reference,
      x,
      line: { from: { x, y: plotTop }, to: { x, y: axisY } },
      label: placeOnSide({ x, y: plotTop }, "above", spacing.valueLabelGap),
    };
  }

  return {
    blocks,
    rows,
    reference,
    axis: {
      y: axisY,
      line: axisLine(axisY, end, mark),
      ticks: valueScale.ticks(spacing.tickCount).map((value) => {
        const x = valueScale(value);
        return { value, x, label: placeOnSide({ x, y: axisY }, "below", spacing.valueLabelGap) };
      }),
      break: mark,
    },
    valueScale,
    truncated,
    width: config.width,
    height: axisY + spacing.axisHeight,
  };
}
