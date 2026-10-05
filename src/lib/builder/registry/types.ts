import type { LayoutBox } from "$lib/core/layouts/types";
import type { ColumnType, Row } from "../data/types";
import type { ChannelReader } from "../encoding/accessors";
import type { JsonValue, NumberFormat } from "../spec/types";
import type { MarginPresetId } from "./margins";

export type ChannelDef = {
  id: string;
  label: string;
  accepts: readonly ColumnType[];
  required: boolean;
};

/**
 * Per axis: `free` = the user sets it; `derived` = the layout computes it;
 * `fitted` = computed by default, but the user may set a target the chart
 * fits to (e.g. row thickness from a height); `fixed` = neither.
 */
export type AxisSizing = "free" | "derived" | "fitted" | "fixed";

export type ChartSizing = { width: AxisSizing; height: AxisSizing };

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * The step an option is shown in: `mapping` when it changes which data is
 * drawn (what is compared with what), `style` when it changes how the chart
 * looks or reads (order, labels, colours, texts, the axis break).
 */
export type OptionStep = "mapping" | "style";

/**
 * A chart setting. Values live in `spec.style.options[id]`, whichever step shows it.
 * `drawingOnly`: only the chart's view reads it, so `build` doesn't get it
 * and changing it doesn't rebuild the layout.
 */
export type OptionDef<L> = {
  id: string;
  label: string;
  step: OptionStep;
  drawingOnly?: true;
} & (
  | {
      kind: "choice";
      choices: readonly { value: string; label: string }[];
      default: string;
    }
  /**
   * A manual order of category names; `current` reads the drawn order.
   * `when`: shown (and applied) only while that choice option has that value.
   */
  | {
      kind: "order";
      current: (layout: L) => string[];
      when?: { option: string; equals: string };
    }
  /** One of the values of the column mapped to `channel`; `none` labels the empty choice. */
  | { kind: "value"; channel: string; none?: string }
  /** Free text drawn on the chart (a caption, a name). */
  | { kind: "text"; placeholder?: string }
  /** On or off. Stored as `true`; off removes the value. */
  | { kind: "toggle" }
  /**
   * Any number of the values of the column mapped to `channel`, stored as a
   * list. While that channel has no column, one checkbox labelled `whole`
   * stands for the whole chart and stores `true`.
   */
  | { kind: "values"; channel: string; whole?: string }
);

/** The option definition of one `kind`, for components that draw that kind. */
export type OptionOf<K extends OptionDef<never>["kind"]> = Extract<
  OptionDef<any>,
  { kind: K }
>;

/** A number format besides the main one (`style.format`), e.g. for a second panel. Values live in `spec.style.formats[id]`. */
export type FormatDef = {
  id: string;
  label: string;
  default?: Partial<NumberFormat>;
};

/** A number the layout takes, shown in step 4. Values live in `spec.style.params[id]`. */
export type ParamDef = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** A `fitted` axis: while the user sets its size, the layout solves this value instead. */
  solvedBy?: "width" | "height";
};

export type BuildContext = {
  read: ChannelReader;
  box: LayoutBox;
  /** Plot sizes the user asked for on `fitted` axes; `null` = automatic. */
  fit: { width: number | null; height: number | null };
  /** The stored options the layout depends on (not the `drawingOnly` ones). */
  options: Record<string, JsonValue>;
  /** Every `params` entry of the chart, with defaults filled in. */
  params: Record<string, number>;
  /** Reports the value used in place of a param the layout solved (see `ParamDef.solvedBy`). */
  solved: (paramId: string, value: number) => void;
  /** Adds a pt-BR notice shown under the chart. */
  warn: (message: string) => void;
};

export type ChartDefinition<L extends LayoutBox = LayoutBox> = {
  id: string;
  label: string;
  description: string;
  channels: readonly ChannelDef[];
  /** Channels that identify a mark; rows sharing them are combined. */
  keys: readonly string[];
  /** Numeric channels combined when keys repeat. */
  measures: readonly string[];
  options?: readonly OptionDef<L>[];
  params?: readonly ParamDef[];
  formats?: readonly FormatDef[];
  sizing: ChartSizing;
  defaultSize: LayoutBox;
  /** The default entry of `MARGIN_PRESETS`. */
  margin: MarginPresetId;
  /** Added to the chosen margin, for parts the builder draws (e.g. a legend). */
  extraMargin?: Partial<Margin>;
  build: (rows: Row[], context: BuildContext) => L;
};

export type AnyChartDefinition = ChartDefinition<any>;

export interface ChartRegistry {
  list(): readonly AnyChartDefinition[];
  get(id: string): AnyChartDefinition | undefined;
  require(id: string): AnyChartDefinition;
}
