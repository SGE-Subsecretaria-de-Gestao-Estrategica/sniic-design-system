import type { LayoutBox } from "$lib/core/layouts/types";
import type { ColumnType, Row } from "../data/types";
import type { ChannelReader } from "../encoding/accessors";
import type { JsonValue } from "../spec/types";

export type ChannelDef = {
  id: string;
  label: string;
  accepts: readonly ColumnType[];
  required: boolean;
  multiple?: boolean;
};

export type AxisSizing = "free" | "derived" | "fixed";

export type ChartSizing = { width: AxisSizing; height: AxisSizing };

export type Margin = { top: number; right: number; bottom: number; left: number };

export type BuildContext = {
  read: ChannelReader;
  box: LayoutBox;
  options: Record<string, JsonValue>;
};

export type ChartDefinition<L extends LayoutBox = LayoutBox> = {
  id: string;
  label: string;
  description: string;
  channels: readonly ChannelDef[];
  sizing: ChartSizing;
  defaultSize: LayoutBox;
  margin: Margin;
  build: (rows: Row[], context: BuildContext) => L;
};

export type AnyChartDefinition = ChartDefinition<any>;

export interface ChartRegistry {
  list(): readonly AnyChartDefinition[];
  get(id: string): AnyChartDefinition | undefined;
  require(id: string): AnyChartDefinition;
};
