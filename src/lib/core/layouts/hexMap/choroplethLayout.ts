import * as d3 from "d3";
import chroma from "chroma-js";
import type { ChoroplethColorConfig, ChoroplethDatum, ChoroplethLayout, ChoroplethLayoutConfig } from "./types";
import { baseLayout } from "./baseLayout";
import { placeOnSide } from "../labels";
import { CHOROPLETH_COLOR_DEFAULTS, resolveChoroplethSpacing } from "./defaults";

function buildStepColors({
  colors,
  steps = CHOROPLETH_COLOR_DEFAULTS.steps,
  mode = CHOROPLETH_COLOR_DEFAULTS.mode,
}: ChoroplethColorConfig): string[] {
  return chroma.scale(colors).mode(mode).colors(steps);
}

function resolveColorScale<D>(
  raw: D[],
  config: Pick<ChoroplethLayoutConfig<D>, "getValue" | "color" | "domain">
): { colorScale: d3.ScaleQuantize<string>; stepColors: string[]; domain: [number, number] } {
  const { getValue, color, domain } = config;

  const [min = 0, max = 0] = domain ?? (d3.extent(raw, getValue) as [number, number]);
  const resolvedDomain: [number, number] = [min, max];

  const stepColors = buildStepColors(color);
  const colorScale = d3.scaleQuantize<string>().domain(resolvedDomain).range(stepColors);

  return { colorScale, stepColors, domain: resolvedDomain };
}

export function choroplethLayout<D>(
  raw: D[],
  config: ChoroplethLayoutConfig<D>
): ChoroplethLayout<D> {
  const spacing = resolveChoroplethSpacing(config);
  const { radius, offsetK = 0, getUf, getValue } = config;

  const layout = baseLayout(raw, { getUf, radius, offsetK });
  const { colorScale, stepColors, domain } = resolveColorScale(raw, config);

  const centre = { x: 0, y: 0 };
  const labels = {
    name: placeOnSide(centre, "above", spacing.nameLabelGap),
    value: placeOnSide(centre, "below", spacing.valueLabelGap),
  };

  const data: ChoroplethDatum<D>[] = layout.data.map((d) => {
    const value = getValue(d.data);
    return { ...d, value, color: colorScale(value), labels };
  });

  return {
    tiles: layout.tiles,
    pathData: layout.pathData,
    colorScale,
    stepColors,
    domain,
    data,
    width: layout.width,
    height: layout.height,
  };
}