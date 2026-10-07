import * as d3 from "d3";
import type {
  ChoroplethDatum,
  ChoroplethLayout,
  ChoroplethLayoutConfig,
} from "./types";
import { baseLayout } from "./baseLayout";
import { placeCentered, placeOnSide } from "../labels";
import {
  CHOROPLETH_COLOR_DEFAULTS,
  resolveChoroplethSpacing,
} from "./defaults";

function resolveStepScale<D>(
  raw: D[],
  { getValue, domain, steps }: ChoroplethLayoutConfig<D>,
) {
  const count = Math.max(
    1,
    Math.round(steps ?? CHOROPLETH_COLOR_DEFAULTS.steps),
  );
  const [min = 0, max = 0] =
    domain ?? (d3.extent(raw, getValue) as [number, number]);
  const resolvedDomain: [number, number] = [min, max];
  const stepScale = d3
    .scaleQuantize<number>()
    .domain(resolvedDomain)
    .range(d3.range(count));
  return { stepScale, steps: count, domain: resolvedDomain };
}

/** Per UF tile, the step of its value on a stepped scale, with its two labels. */
export function choroplethLayout<D>(
  raw: D[],
  config: ChoroplethLayoutConfig<D>,
): ChoroplethLayout<D> {
  const spacing = resolveChoroplethSpacing(config);
  const { radius, offsetK = 0, getUf, getValue } = config;

  const layout = baseLayout(raw, { getUf, radius, offsetK });
  const { stepScale, steps, domain } = resolveStepScale(raw, config);

  const centre = { x: 0, y: 0 };
  const labels = {
    name: placeOnSide(centre, "above", spacing.nameLabelGap),
    value: placeOnSide(centre, "below", spacing.valueLabelGap),
  };

  const data: ChoroplethDatum<D>[] = layout.data.map((d) => {
    const value = getValue(d.data);
    return { ...d, value, step: stepScale(value), labels };
  });

  return {
    tiles: layout.tiles,
    pathData: layout.pathData,
    steps,
    stepScale,
    domain,
    emptyLabel: placeCentered(centre),
    data,
    width: layout.width,
    height: layout.height,
  };
}
