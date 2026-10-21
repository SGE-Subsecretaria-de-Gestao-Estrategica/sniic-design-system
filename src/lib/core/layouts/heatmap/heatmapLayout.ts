import * as d3 from "d3";
import { placeCentered, placeLeft, placeOnSide } from "../labels";
import { resolveSpacing } from "./defaults";
import { bandSize, createStepScale, normalise } from "./geometry";
import { indexEntries, orderedKeys, pairKey, toEntries } from "./ordering";
import type {
  HeatmapBand,
  HeatmapCell,
  HeatmapLayout,
  HeatmapLayoutConfig,
} from "./types";

/**
 * A grid of cells, one per row × column pair, pivoted from tidy data (one
 * datum per cell) and coloured by step: each cell carries its value's step
 * on a quantize scale. Holds no colour. The only function that reads the
 * config.
 */
export function heatmapLayout<D>(
  data: D[],
  config: HeatmapLayoutConfig<D>,
): HeatmapLayout<D> {
  const spacing = resolveSpacing(config);
  const { width, height } = config;
  const entries = toEntries(data, config.getRow, config.getColumn, config.getValue);

  const rowKeys = orderedKeys(entries.map((e) => e.row), config.rowOrder);
  const columnKeys = orderedKeys(entries.map((e) => e.column), config.columnOrder);

  const cellWidth = bandSize(width, columnKeys.length, spacing.cellGap);
  const cellHeight = bandSize(height, rowKeys.length, spacing.cellGap);
  const step = (size: number) => size + spacing.cellGap;

  const columns: HeatmapBand[] = columnKeys.map((key, index) => {
    const start = index * step(cellWidth);
    return {
      key,
      index,
      start,
      size: cellWidth,
      label: placeOnSide({ x: start + cellWidth / 2, y: 0 }, "above", spacing.columnLabelGap),
    };
  });
  const rows: HeatmapBand[] = rowKeys.map((key, index) => {
    const start = index * step(cellHeight);
    return {
      key,
      index,
      start,
      size: cellHeight,
      label: placeLeft({ x: 0, y: start + cellHeight / 2 }, spacing.rowLabelGap),
    };
  });

  const steps = Math.max(1, Math.round(spacing.steps));
  const [min = 0, max = 0] = config.domain ?? d3.extent(entries, (e) => e.value);
  const domain: [number, number] = [min, max];
  const stepScale = createStepScale(domain, steps);

  const byPair = indexEntries(entries);
  const cells: HeatmapCell<D>[] = rows.flatMap((row) =>
    columns.map((column) => {
      const entry = byPair.get(pairKey(row.key, column.key));
      const x = column.start;
      const y = row.start;
      return {
        key: pairKey(row.key, column.key),
        index: row.index * columns.length + column.index,
        data: entry?.data ?? null,
        row: row.key,
        column: column.key,
        rowIndex: row.index,
        columnIndex: column.index,
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        value: entry?.value ?? null,
        step: entry ? stepScale(entry.value) : null,
        t: entry ? normalise(entry.value, domain) : null,
        label: placeCentered({ x: x + cellWidth / 2, y: y + cellHeight / 2 }),
      };
    }),
  );

  return { rows, columns, cells, steps, domain, stepScale, width, height };
}
