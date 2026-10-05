import type { getPillarTheme } from "$lib/core/theme";
import type { Margin } from "../../registry/types";
import type { JsonValue, NumberFormat } from "../../spec/types";

export type PillarTheme = ReturnType<typeof getPillarTheme>;

/** What `ChartView` hands to each chart's view. */
export type ViewProps<L> = {
  layout: L;
  /** Unique prefix for the ids (clip paths, gradients) the view defines. */
  id: string;
  margin: Margin;
  theme: PillarTheme;
  /** The main number format (`style.format`). */
  formatValue: (value: number) => string;
  /** The chart's extra formats, by id, with defaults filled in. */
  formats: Record<string, NumberFormat>;
  options: Record<string, JsonValue>;
};
