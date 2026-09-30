import type {
  CategoryAccessor,
  GroupAccessor,
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  ValueAccessor,
} from "../types";

export type BubbleColumnsSpacing = {
  maxRadius: number;
  rowGap: number;
  columnHalfWidth: number;
  columnGap: number;
  axisOverhang: number;
  labelGap: number;
  smallRadiusThreshold: number;
  groupLabelGap: number;
  categoryLabelGap: number;
};

export type BubbleColumnsLayoutConfig<D> = Partial<BubbleColumnsSpacing> &
  Partial<GroupAccessor<D>> &
  CategoryAccessor<D> &
  ValueAccessor<D> & {
  /** Omit `getGroup` for a single column. Default: the first group in the data. */
  mainGroup?: string;
  categoryOrder?: readonly string[];
  groupOrder?: readonly string[];
  radius?: (value: number) => number;
  columnHalfWidth?: number;
};

export type BubbleColumnsEntry<D> = {
  data: D;
  group: string;
  category: string;
  value: number;
  radius: number;
};

export type CellLookup<D> = (
  group: string,
  category: string,
) => BubbleColumnsEntry<D> | undefined;

export type ValueLabelPlacement = LabelPlacement & { isOutside: boolean };

export type BubbleColumnsItem<D> = BubbleColumnsEntry<D> & LayoutItem<D> & {
  row: number;
  y: number;
  label: ValueLabelPlacement;
};

export type BubbleColumnsRow = {
  category: string;
  index: number;
  y: number;
  label: LabelPlacement;
};

export type BubbleColumn<D> = {
  group: string;
  index: number;
  x: number;
  halfWidth: number;
  isMain: boolean;
  items: BubbleColumnsItem<D>[];
  label: LabelPlacement;
};

export type AxisExtent = { top: number; bottom: number };

export type BubbleColumnsLayout<D> = LayoutBox & {
  rows: BubbleColumnsRow[];
  columns: BubbleColumn<D>[];
  rowGap: number;
  axis: AxisExtent;
  originY: number;
  /** False when built without `getGroup` (one implicit column). */
  isGrouped: boolean;
};
