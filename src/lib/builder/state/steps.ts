import type { Table } from "../data/types";
import type { ChartResolution } from "../resolve/types";
import type { ChartId } from "../registry/layouts";

export type StepId = "data" | "chart" | "mapping" | "style";

export const STEPS: readonly { id: StepId; label: string }[] = [
  { id: "data", label: "Dados" },
  { id: "chart", label: "Gráfico" },
  { id: "mapping", label: "Mapeamento" },
  { id: "style", label: "Estilo" },
];

export type StepStatus = {
  id: StepId;
  label: string;
  done: boolean;
  reason: string | null;
};

type StepInput = {
  table: Table | null;
  chart: ChartId | null;
  resolution: ChartResolution;
};

function mappingReason(resolution: ChartResolution): string | null {
  switch (resolution.status) {
    case "ready":
      return null;
    case "incomplete":
      return `Escolha uma coluna para: ${resolution.missing.map((c) => c.label).join(", ")}.`;
    case "error":
      return resolution.step === "style" ? null : resolution.message;
    case "empty":
      return resolution.reason === "no-data"
        ? "Carregue um arquivo CSV."
        : "Escolha um gráfico.";
  }
}

export function stepStatuses({
  table,
  chart,
  resolution,
}: StepInput): StepStatus[] {
  const reasons: Record<StepId, string | null> = {
    data: table?.rows.length ? null : "Carregue um arquivo CSV.",
    chart: chart ? null : "Escolha um gráfico.",
    mapping: mappingReason(resolution),
    style: mappingReason(resolution),
  };
  return STEPS.map(({ id, label }) => ({
    id,
    label,
    done: !reasons[id],
    reason: reasons[id],
  }));
}

export function canEnter(
  statuses: readonly StepStatus[],
  step: StepId,
): boolean {
  const index = statuses.findIndex((s) => s.id === step);
  return statuses.slice(0, index).every((s) => s.done);
}

export function blockingReason(
  statuses: readonly StepStatus[],
  step: StepId,
): string | null {
  const index = statuses.findIndex((s) => s.id === step);
  return statuses.slice(0, index).find((s) => !s.done)?.reason ?? null;
}
