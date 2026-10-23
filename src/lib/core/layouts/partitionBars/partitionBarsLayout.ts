import { placeLeft, placeRight } from "../labels";
import { resolveSpacing } from "./defaults";
import { fullLengthOf, shareOf } from "./geometry";
import { groupRows, toEntries, uniqueParts } from "./ordering";
import type {
  PartitionBarsLayout,
  PartitionBarsLayoutConfig,
  PartitionBlock,
  PartitionRow,
} from "./types";

/**
 * Partition bars: the parts of a whole as rows of bars from a shared zero,
 * each on a light track that stands for the whole (100%). A part with pieces
 * is followed by a thinner row per piece, on a track as long as the part —
 * so a piece reads as a share of the part it comes from ("of the schools with
 * a library, 56.5% have no librarian") while staying on the same scale as
 * everything else. Several wholes become named blocks. Values sit in a column
 * past the 100% end. The only function that reads the config.
 */
export function partitionBarsLayout<D>(
  data: D[],
  config: PartitionBarsLayoutConfig<D>,
): PartitionBarsLayout<D> {
  const spacing = resolveSpacing(config);
  const entries = toEntries(data, config.getPart, config.getValue, config.getCategory, config.getSubpart);
  const width = Math.max(0, config.width);
  const full = fullLengthOf(width, spacing.valueSpace);
  const wholes = groupRows(entries);
  const named = wholes.length > 1 || wholes.some((w) => w.category !== "");

  const rows: PartitionRow[] = [];
  let cursor = 0;

  const addRow = (row: Omit<PartitionRow, "index" | "y" | "cy" | "valueLabel" | "categoryLabel">, gapBefore: number) => {
    cursor += gapBefore;
    const y = cursor;
    const cy = y + row.thickness / 2;
    const placed: PartitionRow = {
      ...row,
      index: rows.length,
      y,
      cy,
      valueLabel: placeRight({ x: full, y: cy }, spacing.valueGap, 0, "middle"),
      categoryLabel: placeLeft({ x: 0, y: cy }, spacing.categoryLabelGap),
    };
    rows.push(placed);
    cursor = y + row.thickness;
    return placed;
  };

  const blocks = wholes.map(({ category, parts }, b): PartitionBlock => {
    if (b > 0) cursor += spacing.blockGap + spacing.rowGap;
    const top = cursor;
    const header = named
      ? placeRight({ x: 0, y: top + spacing.headerHeight / 2 }, 0, 0, "middle")
      : null;
    if (named) cursor += spacing.headerHeight;

    const total = parts.reduce((sum, p) => sum + p.value, 0);
    const blockRows: PartitionRow[] = [];

    parts.forEach((part, p) => {
      const partShare = shareOf(part.value, total);
      const partLength = partShare * full;
      blockRows.push(
        addRow(
          {
            key: `${category}::${part.part}`,
            kind: "part",
            label: part.part,
            part: part.part,
            whole: category,
            thickness: spacing.barThickness,
            value: part.value,
            share: partShare,
            shareOfTotal: partShare,
            trackLength: full,
            barLength: partLength,
          },
          p === 0 ? 0 : spacing.rowGap,
        ),
      );
      for (const piece of part.subparts) {
        blockRows.push(
          addRow(
            {
              key: `${category}::${part.part}::${piece.label}`,
              kind: "piece",
              label: piece.label,
              part: part.part,
              whole: category,
              thickness: spacing.pieceThickness,
              value: piece.value,
              share: shareOf(piece.value, part.value),
              shareOfTotal: shareOf(piece.value, total),
              trackLength: partLength,
              barLength: shareOf(piece.value, total) * full,
            },
            spacing.pieceGap,
          ),
        );
      }
    });

    const first = blockRows[0];
    const last = blockRows.at(-1)!;
    return {
      key: category,
      label: category,
      index: b,
      y: top,
      header,
      total,
      rows: blockRows,
      baseline: { from: { x: 0, y: first.y }, to: { x: 0, y: last.y + last.thickness } },
    };
  });

  return {
    blocks,
    rows,
    parts: uniqueParts(entries),
    fullLength: full,
    entries,
    width,
    height: rows.length ? cursor : 0,
  };
}
