import type { LayoutBox } from "../types";

export type StackPanelsSpacing = {
  /** Vertical gap between consecutive panels (room for a caption). */
  gap: number;
};

/** A panel: a fixed `height`, or a `share` of the height left (default share 1). */
export type PanelSpec = {
  key: string;
  height?: number;
  share?: number;
};

export type StackPanelsLayoutConfig = Partial<StackPanelsSpacing> & LayoutBox;

export type StackedPanel = {
  key: string;
  index: number;
  top: number;
  height: number;
  bottom: number;
};

/** The gap after panel `index` (between it and the next one). */
export type PanelGap = {
  index: number;
  top: number;
  height: number;
  /** Middle of the gap: where a caption between panels goes. */
  cy: number;
};

export type StackPanelsLayout = LayoutBox & {
  panels: StackedPanel[];
  gaps: PanelGap[];
  /** Panels by key. */
  byKey: Record<string, StackedPanel>;
};
