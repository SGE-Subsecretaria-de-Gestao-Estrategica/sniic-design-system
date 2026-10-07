export const CHART_GROUPS = [
  { id: "categories", label: "Categorias" },
  { id: "lines", label: "Série temporal" },
  { id: "hexMaps", label: "Mapa hexagonal" },
] as const satisfies readonly { id: string; label: string }[];

export type ChartGroup = (typeof CHART_GROUPS)[number];
export type ChartGroupId = ChartGroup["id"];

export function groupCharts<T extends { chart: { group: ChartGroupId } }>(
  items: readonly T[],
): { group: ChartGroup; items: T[] }[] {
  return CHART_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.chart.group === group.id),
  })).filter(({ items }) => items.length > 0);
}
