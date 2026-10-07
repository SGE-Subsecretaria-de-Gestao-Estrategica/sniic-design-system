import type { LabelPlacement } from "$lib/core/layouts/types";
import type { TextVariant } from "$lib/core/theme/types";

export type PlacedLabelProps = {
  /** A layout's ready-to-draw position and anchors. */
  placement: LabelPlacement;
  text: string;
  /** Theme text role. Default "text". */
  variant?: TextVariant;
  /** Offset added to the placement (e.g. a hexMap tile's position). */
  left?: number;
  top?: number;
  // Style overrides (undefined → the role)
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  /** Wrapping width. */
  width?: number;
};
