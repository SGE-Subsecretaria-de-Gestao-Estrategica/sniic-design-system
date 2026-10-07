import { generateHexagon } from "$lib/core/utils/shapeFactory";
import { getHexTilePositions, hexMapBox } from "./utils";
import type { BaseLayout, BaseLayoutConfig, BaseLayoutDatum, MapTile } from "./types";

function enrichTileData<D>(
  d: D,
  index: number,
  tiles: Map<string, MapTile>,
  { getUf }: BaseLayoutConfig<D>,
): BaseLayoutDatum<D> {
  const tile = tiles.get(getUf(d));
  if (!tile) throw new Error(`UF not found: ${getUf(d)}`);
  return { key: tile.ufCode, index, data: d, ...tile };
}

/** Places each datum on its UF tile of the hex map. */
export function baseLayout<D>(raw: D[], config: BaseLayoutConfig<D>): BaseLayout<D> {
  const { radius, offsetK = 0 } = config;
  const tiles = getHexTilePositions(radius, offsetK);
  const data = raw.map((d, i) => enrichTileData(d, i, tiles, config));
  const pathData = generateHexagon(radius);
  return { tiles, data, pathData, ...hexMapBox(tiles.values(), radius) };
}
