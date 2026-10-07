import { placeCentered, placeLeft, placeOnSide } from "../labels";
import { resolveSpacing } from "./defaults";
import {
  computeAxisExtent,
  computeColumnPositions,
  computeRowPositions,
  createCellLookup,
  createRadiusScale,
  isLabelOutside,
  maxRadiusInRow,
} from "./geometry";
import { orderCategories, orderGroups } from "./ordering";
import type {
  BubbleColumnsEntry,
  BubbleColumnsItem,
  BubbleColumnsLayout,
  BubbleColumnsLayoutConfig,
  BubbleColumnsSpacing,
  CellLookup,
} from "./types";

/** Group key of every entry when the config has no `getGroup`. */
export const SINGLE_GROUP = "all";

function emptyLayout(isGrouped: boolean): BubbleColumnsLayout<never> {
  return {
    rows: [],
    columns: [],
    rowGap: 0,
    axis: { top: 0, bottom: 0 },
    width: 0,
    height: 0,
    originY: 0,
    isGrouped,
  };
}

function toEntries<D>(
  data: D[],
  { getGroup, getCategory, getValue }: BubbleColumnsLayoutConfig<D>,
  radius: (value: number) => number,
): BubbleColumnsEntry<D>[] {
  return data.flatMap((d) => {
    const value = getValue(d);
    if (!Number.isFinite(value)) return [];
    const group = getGroup?.(d) ?? SINGLE_GROUP;
    return [{ data: d, group, category: getCategory(d), value, radius: radius(value) }];
  });
}

function placeColumnItems<D>(
  group: string,
  x: number,
  categories: string[],
  rowY: number[],
  cell: CellLookup<D>,
  spacing: Pick<BubbleColumnsSpacing, "smallRadiusThreshold" | "labelGap">,
): BubbleColumnsItem<D>[] {
  return categories.flatMap((category, row) => {
    const entry = cell(group, category);
    if (!entry) return [];
    const y = rowY[row];
    const isOutside = isLabelOutside(entry.radius, spacing.smallRadiusThreshold);
    const label = isOutside
      ? placeOnSide({ x, y: y + entry.radius }, "below", spacing.labelGap)
      : placeCentered({ x, y });
    return [{
      ...entry,
      key: `${group}::${category}`,
      index: row,
      row,
      y,
      label: { ...label, isOutside },
    }];
  });
}


export function bubbleColumnsLayout<D>(
  data: D[],
  config: BubbleColumnsLayoutConfig<D>,
): BubbleColumnsLayout<D> {
  const spacing = resolveSpacing(config);
  const radius = config.radius ?? createRadiusScale(spacing.maxRadius);

  const isGrouped = config.getGroup !== undefined;
  const entries = toEntries(data, config, radius);
  if (!entries.length) return emptyLayout(isGrouped);

  // Without groups there is one column, which is the main one.
  const mainGroup = (isGrouped && config.mainGroup) || entries[0].group;
  const categories = orderCategories(entries, mainGroup, config.categoryOrder);
  const groups = orderGroups(entries, mainGroup, config.groupOrder);
  const cell = createCellLookup(entries);

  const rowY = computeRowPositions(categories.length, spacing.rowGap);

  const halfWidth =
    config.columnHalfWidth ?? spacing.columnHalfWidth;
  const { xs, width } = computeColumnPositions(groups.length, halfWidth, spacing.columnGap);

  const axis = computeAxisExtent(
    maxRadiusInRow(groups, categories[0], cell),
    maxRadiusInRow(groups, categories.at(-1), cell),
    rowY.at(-1) ?? 0,
    spacing.axisOverhang,
  );

  return {
    rows: categories.map((category, index) => ({
      category,
      index,
      y: rowY[index],
      label: placeLeft({ x: 0, y: rowY[index] }, spacing.categoryLabelGap),
    })),
    columns: groups.map((group, index) => ({
      group,
      index,
      x: xs[index],
      halfWidth,
      isMain: group === mainGroup,
      items: placeColumnItems(group, xs[index], categories, rowY, cell, spacing),
      label: placeOnSide({ x: xs[index], y: axis.top }, "above", spacing.groupLabelGap),
    })),
    rowGap: spacing.rowGap,
    axis,
    width,
    height: axis.bottom - axis.top,
    originY: -axis.top,
    isGrouped,
  };
}
