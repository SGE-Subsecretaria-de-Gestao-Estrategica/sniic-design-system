import * as d3 from "d3";
import applyExplicitOrder from "$lib/core/utils/applyExplicitOrder";
import orderKeys from "$lib/core/utils/orderKeys";
import resolveDomain from "$lib/core/utils/resolveDomain";
import { bandRows } from "../bandRows";
import { placeLeft, placeRight } from "../labels";
import { resolveSpacing } from "./defaults";
import { columnWidth } from "./geometry";
import type {
  BarTableBar,
  BarTableColumn,
  BarTableLayout,
  BarTableLayoutConfig,
  BarTableRow,
} from "./types";

type Cell<D> = { data: D; category: string; value: number };

/**
 * A table of capsule bars: one row per category, one column per value of
 * `getColumn`, each cell a bar with its value. Every column has the same rows
 * in the same order; a category a column doesn't have gets a "not reported"
 * placement instead of a bar. One row per column and category: a repeated one
 * keeps the first value. The only function that reads the config.
 */
export function barTableLayout<D>(
  data: D[],
  config: BarTableLayoutConfig<D>,
): BarTableLayout<D> {
  const spacing = resolveSpacing(config);
  const thickness = spacing.barThickness;

  const byColumn = new Map<string, Map<string, Cell<D>>>();
  for (const d of data) {
    const value = config.getValue(d);
    if (!Number.isFinite(value)) continue;
    const column = config.getColumn(d);
    const category = config.getCategory(d);
    const cells = byColumn.get(column) ?? new Map<string, Cell<D>>();
    if (!cells.has(category)) cells.set(category, { data: d, category, value });
    byColumn.set(column, cells);
  }
  const cells = [...byColumn.values()].flatMap((c) => [...c.values()]);

  const totals = d3.rollup(
    cells,
    (group) => d3.sum(group, (c) => c.value),
    (c) => c.category,
  );
  const categories = orderKeys(
    [...totals.keys()],
    (c) => totals.get(c),
    config.sort ?? "descending",
    config.categoryOrder,
  );
  const columnKeys = config.columnOrder
    ? applyExplicitOrder([...byColumn.keys()], config.columnOrder)
    : [...byColumn.keys()];

  const width = columnWidth(columnKeys.length, config.width, spacing.columnGap);
  const domainOf = (values: number[]) =>
    resolveDomain(values, { includeZero: true, headroom: spacing.valueHeadroom });
  const sharedDomain = domainOf(cells.map((c) => c.value));

  const band = bandRows(categories.length, { thickness, gapRatio: spacing.barGapRatio });
  const top = spacing.headerHeight;
  const bottom = top + band.height;

  const rows = categories.map((category, index): BarTableRow => {
    const { y, cy } = band.rows[index];
    return {
      key: category,
      index,
      category,
      top: top + y - band.gap / 2,
      height: thickness + band.gap,
      cy: top + cy,
      label: placeLeft({ x: 0, y: top + cy }, spacing.categoryLabelGap),
    };
  });

  let missing = 0;
  const columns = columnKeys.map((key, index): BarTableColumn<D> => {
    const own = byColumn.get(key)!;
    const valueScale = d3
      .scaleLinear()
      .domain(
        config.scale === "independent"
          ? domainOf([...own.values()].map((c) => c.value))
          : sharedDomain,
      )
      .range([0, width]);

    const bars: BarTableBar<D>[] = [];
    const gaps: BarTableColumn<D>["missing"] = [];
    for (const row of rows) {
      const cell = own.get(row.category);
      if (!cell) {
        gaps.push({
          key: row.key,
          category: row.category,
          label: placeRight({ x: 0, y: row.cy }, spacing.missingLabelGap, 0, "middle"),
        });
        continue;
      }
      const length = Math.max(0, valueScale(cell.value));
      bars.push({
        ...cell,
        key: row.key,
        index: row.index,
        rect: { x: 0, y: row.cy - thickness / 2, width: length, height: thickness },
        valueLabel: placeRight({ x: length, y: row.cy }, spacing.valueLabelGap, 0, "middle"),
      });
    }
    missing += gaps.length;

    return {
      key,
      index,
      x: index * (width + spacing.columnGap),
      width,
      valueScale,
      header: placeRight({ x: 0, y: 0 }, 0, 0, "start"),
      baseline: { from: { x: 0, y: top }, to: { x: 0, y: bottom } },
      bars,
      missing: gaps,
    };
  });

  return {
    columns,
    rows,
    missing,
    width: config.width,
    height: categories.length ? bottom : 0,
  };
}
