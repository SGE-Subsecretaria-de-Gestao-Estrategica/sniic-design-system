import { REGION_OFFSETS, UF_TILES } from "./data";
import type { MapTile, Point2D, RegionLayoutOffset, UFTile } from "./types";

export function makeHexTileScale(config: { radius: number; offsetK?: number; }) {
  const { radius, offsetK = 0 } = config;
  const sqrt3 = Math.sqrt(3);

  return function project(tile: UFTile): Point2D {
    const region = REGION_OFFSETS.find((r) => r.region === tile.region) as RegionLayoutOffset;
    const px = tile.col * (1.5 * radius) + radius + (region.dx ?? 0) * offsetK * radius;
    const py = tile.row * ((sqrt3 / 2) * radius) + (sqrt3 * radius) / 2 + (region.dy ?? 0) * offsetK * radius;
    return { x: px, y: py };
  };
}

export function getHexTilePositions(radius: number, offsetK = 0) {
  const scale = makeHexTileScale({ radius, offsetK });
  const tiles = new Map<string, MapTile>()
  for (const tile of UF_TILES) {
    tiles.set(tile.ufCode, { ufCode: tile.ufCode, region: tile.region, position: scale(tile)})
  }
  return tiles;
}