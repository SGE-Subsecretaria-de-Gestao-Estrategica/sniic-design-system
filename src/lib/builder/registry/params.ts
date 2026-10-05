import { DEFAULT_FORMAT } from "../spec/format";
import type { NumberFormat } from "../spec/types";
import type { FormatDef, ParamDef } from "./types";

export function clampParam(def: ParamDef, value: number): number {
  return Math.min(def.max, Math.max(def.min, value));
}

/** Every param of a chart: the stored value (clamped) or its default. */
export function resolveParams(
  defs: readonly ParamDef[] = [],
  stored: Record<string, number> = {},
): Record<string, number> {
  return Object.fromEntries(
    defs.map((def) => {
      const value = stored[def.id];
      return [
        def.id,
        Number.isFinite(value) ? clampParam(def, value) : def.default,
      ];
    }),
  );
}

/** An extra format of a chart: the stored one, or the definition's default. */
export function resolveFormat(
  def: FormatDef,
  stored: NumberFormat | undefined,
): NumberFormat {
  return stored ?? { ...DEFAULT_FORMAT, ...def.default };
}
