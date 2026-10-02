import type { Row } from "../data/types";
import { createChannelReader, dropIncomplete } from "../encoding/accessors";
import type { ChartLayoutView } from "../registry/layouts";
import type { ChartRegistry } from "../registry/types";
import { missingChannels } from "../spec/spec";
import { plotSize } from "./sizing";
import type { ChartResolution, ResolveInput } from "./types";

export function resolveChart(
  spec: ResolveInput,
  rows: readonly Row[],
  registry: ChartRegistry,
): ChartResolution {
  if (!spec.chart) return { status: "empty", reason: "no-chart" };
  const definition = registry.get(spec.chart);
  if (!definition) {
    return { status: "error", definition: null, message: `Gráfico desconhecido: "${spec.chart}".` };
  }
  if (!rows.length) return { status: "empty", reason: "no-data" };

  const missing = missingChannels(definition.channels, spec.encoding);
  if (missing.length) return { status: "incomplete", definition, missing };

  const { margin, sizing, defaultSize } = definition;
  const box = {
    width: plotSize(sizing.width, spec.style.width, defaultSize.width, margin.left + margin.right),
    height: plotSize(sizing.height, spec.style.height, defaultSize.height, margin.top + margin.bottom),
  };
  if (box.width <= 0 || box.height <= 0) {
    return { status: "error", definition, message: "O gráfico é pequeno demais para as margens." };
  }

  try {
    const mapped = definition.channels.flatMap((c) => spec.encoding[c.id] ?? []);
    const complete = dropIncomplete(rows, mapped);
    const read = createChannelReader(spec.encoding, spec.data.columns);
    const layout = definition.build(complete.rows, { read, box, options: spec.style.options });

    return {
      status: "ready",
      definition,
      view: { chart: definition.id, layout } as ChartLayoutView,
      figure: {
        width: layout.width + margin.left + margin.right,
        height: layout.height + margin.top + margin.bottom,
      },
      margin,
      dropped: complete.dropped,
    };
  } catch (e) {
    return { status: "error", definition, message: (e as Error).message };
  }
}
