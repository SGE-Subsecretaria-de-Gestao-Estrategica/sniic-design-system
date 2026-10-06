import { hexRadiusForWidth } from "$lib/core/layouts/hexMap";
import { UFS } from "../data/uf";
import type { BuildContext, ParamDef } from "./types";

export const MIN_HEX_RADIUS = 18;

export function regionGapParam(fallback: number): ParamDef {
  return {
    id: "regionGap",
    label: "Afastamento entre as regiões (0 a 1)",
    min: 0,
    max: 1,
    step: 0.1,
    default: fallback,
  };
}

export function hexRadiusParam(fallback: number): ParamDef {
  return {
    id: "radius",
    label: "Raio dos hexágonos (px)",
    min: 10,
    max: 80,
    step: 1,
    default: fallback,
    solvedBy: "width",
  };
}


export function hexRadiusFor(
  regionGap: number,
  {
    fit,
    params,
    warn,
    solved,
  }: Pick<BuildContext, "fit" | "params" | "warn" | "solved">,
): number {
  if (fit.width === null) return params.radius;
  const radius = hexRadiusForWidth(fit.width, regionGap);
  if (radius < MIN_HEX_RADIUS) {
    warn(
      `Com esta largura cada hexágono fica com ${Math.round(radius)} px de raio e os rótulos podem não caber. Aumente a largura.`,
    );
  }
  solved("radius", radius);
  return radius;
}

export function warnMissingUfs(
  present: Iterable<string>,
  warn: BuildContext["warn"],
) {
  const seen = new Set(present);
  const missing = UFS.map((uf) => uf.code)
    .filter((code) => !seen.has(code))
    .sort();
  if (missing.length && missing.length < UFS.length) {
    warn(`Sem dados para: ${missing.join(", ")}.`);
  }
}


export function assertOnePerTile<R>(
  rows: readonly R[],
  keyOf: (row: R) => string,
  ufOf: (row: R) => string,
) {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = keyOf(row);
    if (seen.has(key)) {
      throw new Error(
        `A UF ${ufOf(row)} aparece mais de uma vez, escrita de formas diferentes (sigla e nome, por exemplo). Use uma só forma em toda a coluna.`,
      );
    }
    seen.add(key);
  }
}
