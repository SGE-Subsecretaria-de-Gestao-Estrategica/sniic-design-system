import type { CHARTS } from "./charts";

type Chart = (typeof CHARTS)[number];

export type ChartLayouts = { [C in Chart as C["id"]]: ReturnType<C["build"]> };

export type ChartId = keyof ChartLayouts;

export type ChartLayoutView = {
  [K in ChartId]: { chart: K; layout: ChartLayouts[K] };
}[ChartId];
