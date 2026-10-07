import type {
  ColumnSchema,
  DecimalSeparator,
  FieldSeparator,
} from "../data/types";
import type { ChartId } from "../registry/layouts";
import type { MarginPresetId } from "../registry/margins";

/**
 * WizardState: ChartSpec
 *
 * The whole wizard state, one slice per step. Plain JSON: it can be
 * stringified, saved and parsed back. Parsed rows live beside it, not in it.
 *
 * Step 1: DataSpec - how the file was read.
 * Step 2: string | null - a registry id.
 * Step 3: Encoding - channel id → column name; Aggregation - how repeated keys are combined.
 * Step 4: StyleSpec - `null` sizes fall back to the chart's `defaultSize`.
 * */

export const CHART_SPEC_VERSION = 1;

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ChartSpec = {
  version: typeof CHART_SPEC_VERSION;
  data: DataSpec;
  chart: ChartId | null;
  encoding: Encoding;
  aggregate: Aggregation;
  style: StyleSpec;
};

export type DataSpec = {
  fileName: string | null;
  delimiter: FieldSeparator;
  decimal: DecimalSeparator;
  columns: ColumnSchema[];
};

/** Channel id → column name. Data is tidy: one column per channel. */
export type Encoding = Record<string, string>;

/** How rows sharing the same key channels are combined. */
export type Aggregation = "sum" | "mean" | "count" | "first";

export type NumberFormat = {
  /** `null` = as many as the value has. */
  decimals: number | null;
  /** 1.234.567 → 1,2 mi */
  compact: boolean;
  /** Values are shares: 0,25 → 25. The "%" itself is the `suffix`. */
  percent: boolean;
  prefix: string;
  suffix: string;
};

export type StyleSpec = {
  pillar: number;
  width: number | null;
  height: number | null;
  format: NumberFormat;
  /** The chart's extra formats (e.g. a second panel's values), by id; missing = its default. */
  formats: Record<string, NumberFormat>;
  /** A `MARGIN_PRESETS` id; `null` = the chart's default. */
  margin: MarginPresetId | null;
  /** Chart settings of step 3 (sort, manual order, main group). */
  options: Record<string, JsonValue>;
  /** Layout numbers of step 4 (thickness, gaps, radius); missing = the layout's default. */
  params: Record<string, number>;
};

export type ResetReason =
  "channel-removed" | "column-removed" | "type-mismatch";

export type ResetNotice = {
  channel: string;
  column: string;
  reason: ResetReason;
};

export type SpecChange = {
  spec: ChartSpec;
  reset: ResetNotice[];
};
