import type { LayoutBox } from "$lib/core/layouts/types";
import type { AnyChartDefinition, ChartDefinition, ChartRegistry } from "./types";

export function defineChart<const K extends string, L extends LayoutBox>(
  definition: ChartDefinition<L> & { id: K },
) {
  return definition;
}

export function createRegistry(definitions: readonly AnyChartDefinition[]): ChartRegistry {
  const byId = new Map<string, AnyChartDefinition>();
  for (const def of definitions) {
    if (byId.has(def.id)) throw new Error(`Duplicate chart id "${def.id}".`);
    const channelIds = def.channels.map((c) => c.id);
    if (new Set(channelIds).size !== channelIds.length) {
      throw new Error(`Chart "${def.id}" has duplicate channel ids.`);
    }
    byId.set(def.id, def);
  }
  const list = [...byId.values()];

  return {
    list: () => list,
    get: (id) => byId.get(id),
    require: (id) => {
      const def = byId.get(id);
      if (!def) throw new Error(`Unknown chart "${id}".`);
      return def;
    },
  };
}
