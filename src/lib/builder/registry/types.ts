import type { LayoutBox } from "$lib/core/layouts/types";
import type { ColumnType, Row } from "../data/types";
import type { ChannelReader } from "../encoding/accessors";
import type { JsonValue, NumberFormat } from "../spec/types";
import type { ChartGroupId } from "./groups";
import type { MarginPresetId } from "./margins";

export type ChannelDef = {
  id: string;
  label: string;
  accepts: readonly ColumnType[];
  required: boolean;
};


export type AxisSizing = "free" | "derived" | "fitted" | "fixed";

export type ChartSizing = { width: AxisSizing; height: AxisSizing };

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type OptionStep = "mapping" | "style";

type BaseOptionDef = {
  id: string;
  label: string;
  step: OptionStep;
  drawingOnly?: true;
}

type ChoiceOptionDef = BaseOptionDef & {
  kind: "choice";
  choices: readonly { value: string; label: string }[];
  default: string;
}

type OrderOptionDef<L> = BaseOptionDef & {
  kind: "order";
  current: (layout: L) => string[];
  when?: { option: string; equals: string };
}

type ValueOptionDef = BaseOptionDef & { 
  kind: "value"; 
  channel: string; 
  none?: string 
}

type ValuesOptionDef = BaseOptionDef & { 
  kind: "values"; 
  channel: string; 
  whole?: string 
}

type TextOptionDef = BaseOptionDef & { 
  kind: "text"; 
  placeholder?: string 
}

type NumberOptionDef = BaseOptionDef & {
  kind: "number";
  placeholder?: string;
  note?: string;
}

type ToggleOptionDef = BaseOptionDef & { 
  kind: "toggle" 
}

export type OptionDef<L> = 
  | ChoiceOptionDef
  | OrderOptionDef<L>
  | ValueOptionDef
  | TextOptionDef
  | NumberOptionDef
  | ToggleOptionDef
  | ValuesOptionDef;

  
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
  solvedBy?: "width" | "height";
};

export type BuildContext = {
  read: ChannelReader;
  box: LayoutBox;
  fit: { width: number | null; height: number | null };
  options: Record<string, JsonValue>;
  params: Record<string, number>;
  solved: (paramId: string, value: number) => void;
  warn: (message: string) => void;
};

export type ChartDefinition<L extends LayoutBox = LayoutBox> = {
  id: string;
  label: string;
  group: ChartGroupId;
  channels: readonly ChannelDef[];
  keys: readonly string[];
  measures: readonly string[];
  options?: readonly OptionDef<L>[];
  params?: readonly ParamDef[];
  formats?: readonly FormatDef[];
  sizing: ChartSizing;
  defaultSize: LayoutBox;
  margin: MarginPresetId;
  extraMargin?: Partial<Margin>;
  build: (rows: Row[], context: BuildContext) => L;
};

export type AnyChartDefinition = ChartDefinition<any>;

export interface ChartRegistry {
  list(): readonly AnyChartDefinition[];
  get(id: string): AnyChartDefinition | undefined;
  require(id: string): AnyChartDefinition;
}
