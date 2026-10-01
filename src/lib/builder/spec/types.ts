import type {
  ColumnSchema,
  DecimalSeparator,
  FieldSeparator,
} from "../data/types";
import type { ChartId } from "../registry/layouts";

/** 
 * WizardState: ChartSpec
 * 
 * The whole wizard state, one slice per step. Plain JSON: it can be
 * stringified, saved and parsed back. Parsed rows live beside it, not in it.
 * 
 * Step 1: DataSpec - how the file was read. 
 * Step 2: string | null - a registry id.
 * Step 3: Encoding - channel id → column names. Single channels hold one name.
 * Step 4: StyleSpec - `null` sizes fall back to the chart's `defaultSize`.
 * */

export const CHART_SPEC_VERSION = 1;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ChartSpec = {
  version: typeof CHART_SPEC_VERSION;
  data: DataSpec;
  chart: ChartId | null;
  encoding: Encoding;
  style: StyleSpec;
};

export type DataSpec = {
  fileName: string | null;
  delimiter: FieldSeparator;
  decimal: DecimalSeparator;
  columns: ColumnSchema[];
};

export type Encoding = Record<string, string[]>;

export type StyleSpec = {
  pillar: number;
  width: number | null;
  height: number | null;
  options: Record<string, JsonValue>;
};

export type ResetReason = "channel-removed" | "column-removed" | "type-mismatch";

export type ResetNotice = {
  channel: string;
  column: string;
  reason: ResetReason;
};

export type SpecChange = {
  spec: ChartSpec;
  reset: ResetNotice[];
};
