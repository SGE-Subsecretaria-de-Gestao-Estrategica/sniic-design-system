import type { Row } from "../data/types";
import { createChannelReader, dropIncomplete } from "../encoding/accessors";
import type { ChartLayoutView } from "../registry/layouts";
import { addMargins, marginOf } from "../registry/margins";
import { layoutOptions } from "../registry/options";
import { resolveParams } from "../registry/params";
import type { ChartRegistry } from "../registry/types";
import { missingChannels, roundSize } from "../spec/spec";
import { aggregateRows } from "./aggregate";
import type { ChartResolution, ResolveInput } from "./types";

export function resolveChart(
  spec: ResolveInput,
  rows: readonly Row[],
  registry: ChartRegistry,
): ChartResolution {
  if (!spec.chart) return { status: "empty", reason: "no-chart" };
  const definition = registry.get(spec.chart);
  if (!definition) {
    return {
      status: "error",
      definition: null,
      step: "mapping",
      message: `Gráfico desconhecido: "${spec.chart}".`,
    };
  }
  if (!rows.length) return { status: "empty", reason: "no-data" };

  const missing = missingChannels(definition.channels, spec.encoding);
  if (missing.length) return { status: "incomplete", definition, missing };

  const { sizing, defaultSize } = definition;
  const margin = addMargins(
    marginOf(spec.style.margin ?? definition.margin),
    definition.extraMargin,
  );
  // Only a free axis takes the user's size as it is; the others start from the default.
  const plot = (axis: "width" | "height", margins: number) =>
    (sizing[axis] === "free"
      ? (spec.style[axis] ?? defaultSize[axis])
      : defaultSize[axis]) - margins;
  const box = {
    width: plot("width", margin.left + margin.right),
    height: plot("height", margin.top + margin.bottom),
  };
  if (box.width <= 0 || box.height <= 0) {
    return {
      status: "error",
      definition,
      step: "style",
      message: "O gráfico é pequeno demais para as margens.",
    };
  }

  const fitted = (axis: "width" | "height", margins: number) => {
    const size = spec.style[axis];
    return sizing[axis] === "fitted" && size !== null ? size - margins : null;
  };
  const fit = {
    width: fitted("width", margin.left + margin.right),
    height: fitted("height", margin.top + margin.bottom),
  };

  try {
    const columnsOf = (channelIds: readonly string[]) =>
      channelIds.flatMap((id) => spec.encoding[id] ?? []);
    const mapped = columnsOf(definition.channels.map((c) => c.id));
    const complete = dropIncomplete(rows, mapped);
    const aggregated = aggregateRows(
      complete.rows,
      columnsOf(definition.keys),
      columnsOf(definition.measures),
      spec.aggregate,
    );
    const warnings: string[] = [];
    const solved: Record<string, number> = {};
    const layout = definition.build(aggregated.rows, {
      read: createChannelReader(spec.encoding, spec.data.columns),
      box,
      fit,
      options: layoutOptions(definition.options, spec.style.options),
      params: resolveParams(definition.params, spec.style.params),
      warn: (message) => warnings.push(message),
      solved: (paramId, value) => (solved[paramId] = value),
    });

    return {
      status: "ready",
      definition,
      view: { chart: definition.id, layout } as ChartLayoutView,
      // Fitted sizes come out of a division.
      figure: {
        width: roundSize(layout.width + margin.left + margin.right),
        height: roundSize(layout.height + margin.top + margin.bottom),
      },
      margin,
      dropped: complete.dropped,
      combined: aggregated.combined,
      warnings,
      solved,
    };
  } catch (e) {
    return {
      status: "error",
      definition,
      step: "mapping",
      message: (e as Error).message,
    };
  }
}
