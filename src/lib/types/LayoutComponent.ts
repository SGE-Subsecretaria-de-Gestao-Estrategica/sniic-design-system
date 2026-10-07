import type { ClassValue } from "svelte/elements";

/** Props every layout component takes. */
export type LayoutComponentProps<L> = {
  /** Output of the matching layout function. */
  layout: L;
  /** Top-left corner of the plotting area. */
  top?: number;
  left?: number;
  class?: ClassValue;
};

/**
 * Style overrides shared by all of a component's labels. Undefined → each
 * label's theme role (`valueLabel`, `categoryLabel`, …).
 */
export type LabelStyleProps = {
  labelFill?: string;
  fontSize?: number;
  fontWeight?: number;
};
