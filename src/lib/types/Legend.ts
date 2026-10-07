import type { Snippet } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import type { TextProps } from './Text';

export type LegendShape = 'rect' | 'circle' | 'line';

export type LegendItem = {
  label: string;
  color?: string;
  /** Overrides the legend-wide shape for this item. */
  shape?: LegendShape;
};

/** One item after layout, as handed to the `item` snippet. */
export type ComputedLegendItem = LegendItem & {
  index: number;
  x: number;
  y: number;
  color: string;
  shape: LegendShape;
};

export type LegendProps = {
  items?: LegendItem[];
  top?: number;
  left?: number;
  /** `row` lays items out horizontally, `column` vertically. */
  direction?: 'row' | 'column';
  shape?: LegendShape;
  /** Swatch size — edge length for `rect`, diameter for `circle`/`line`. */
  shapeSize?: number;
  /** Gap between the swatch and its label. */
  labelGap?: number;
  /**
   * Gap between items. In `row` direction, omit to space items by measured
   * label width instead of a fixed step.
   */
  itemSpacing?: number;
  /** Colour per item when `LegendItem.color` is absent; defaults to the theme palette. */
  color?: (item: LegendItem, index: number) => string;
  labelProps?: Partial<TextProps>;
  className?: ClassValue;
  item?: Snippet<[ComputedLegendItem]>;
};

/** A stepped colour scale: one swatch per step, lowest first. */
export type LegendStepsProps = {
  colors: readonly string[];
  top?: number;
  left?: number;
  class?: ClassValue;
  stepWidth?: number;
  height?: number;
  /** A line behind the swatches that runs past both ends (theme role: `baseline`). */
  showLine?: boolean;
  lineOverhang?: number;
  lineStroke?: string;
  lineStrokeWidth?: number;
  /** Text at the two ends, e.g. the scale's lowest and highest value (theme role: `tickLabel`). */
  labels?: readonly [string, string];
  labelGap?: number;
  labelFill?: string;
  fontSize?: number;
  fontWeight?: number;
};
