import type { LayoutBox } from "$lib/core/layouts/types";
import type { ChartLayoutView } from "../registry/layouts";
import type { AnyChartDefinition, ChannelDef, Margin } from "../registry/types";
import type { ChartSpec, StyleSpec } from "../spec/types";

/** What `resolveChart` reads from a spec. The pillar isn't part of it: colours don't change the layout. */
export type ResolveInput = Pick<ChartSpec, "chart" | "encoding" | "data"> & {
  style: Pick<StyleSpec, "width" | "height" | "options">;
};

export type EmptyChart = { 
  status: "empty"; 
  reason: "no-chart" | "no-data" 
};

export type IncompleteChart = { 
  status: "incomplete"; 
  definition: AnyChartDefinition;
  missing: ChannelDef[] 
};

export type ErrorChart = { 
  status: "error"; 
  /** `null` when the spec names a chart the registry doesn't have. */
  definition: AnyChartDefinition | null; 
  message: string 
};

export type ReadyChart = {
  status: "ready";
  definition: AnyChartDefinition;
  view: ChartLayoutView;
  figure: LayoutBox;
  margin: Margin;
  dropped: number;
};

export type ChartResolution =
  | EmptyChart
  | IncompleteChart
  | ErrorChart
  | ReadyChart;
