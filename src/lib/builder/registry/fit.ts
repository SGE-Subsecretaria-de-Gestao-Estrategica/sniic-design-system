import type { BuildContext } from "./types";

/** Below this a band's labels stop being readable. */
export const MIN_BAND_THICKNESS = 12;

/**
 * Band thickness that makes `count` rows (with `gapRatio` gaps around them)
 * fill the height the user asked for: the inverse of `bandRows`. Reports it
 * as the value of `paramId`, which it replaces. `undefined` when no height
 * was asked for, so the caller keeps the param.
 */
export function fitBandThickness(
  count: number,
  gapRatio: number,
  paramId: string,
  { fit, warn, solved }: Pick<BuildContext, "fit" | "warn" | "solved">,
): number | undefined {
  if (fit.height === null || count === 0) return undefined;
  const thickness = fit.height / (count + (count + 1) * gapRatio);
  if (thickness < MIN_BAND_THICKNESS) {
    warn(
      `Com esta altura cada linha fica com ${Math.round(thickness)} px. Aumente a altura ou reduza as categorias.`,
    );
  }
  solved(paramId, thickness);
  return thickness;
}
