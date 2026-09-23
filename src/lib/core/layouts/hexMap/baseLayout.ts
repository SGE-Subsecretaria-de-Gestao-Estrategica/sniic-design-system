import { generateHexagon } from "$lib/core/utils/shapeFactory";
import { getHexTilePositions } from "./utils";
import type { BaseLayoutConfig, MapTile } from "./types";

function enrichTileData<D>(d: D, tiles: Map<string, MapTile>, { getUf }: BaseLayoutConfig<D>) {
  const tile = tiles.get(getUf(d));
  if (!tile) throw new Error(`UF not found: ${getUf(d)}`);
  return { data: d, ...tile }
}

export function baseLayout<D>(raw: D[], config: BaseLayoutConfig<D>) {
  const { radius, offsetK = 0 } = config;
  const tiles = getHexTilePositions(radius, offsetK);
  const data = raw.map((d) => enrichTileData(d, tiles, config));
  const pathData = generateHexagon(radius);
  return { tiles, data, pathData };
}