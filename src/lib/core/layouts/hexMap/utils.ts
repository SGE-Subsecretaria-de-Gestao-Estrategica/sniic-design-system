import { REGION_OFFSETS, UF_TILES } from "./data";
import type { LayoutBox, Point } from "../types";
import type { MapTile, RegionLayoutOffset, UFTile } from "./types";

export function makeHexTileScale(config: { radius: number; offsetK?: number; }) {
  const { radius, offsetK = 0 } = config;
  const sqrt3 = Math.sqrt(3);

  return function project(tile: UFTile): Point {
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
/** Bounding box (from the origin) of every tile: flat-top hexagons of `radius`. */
export function hexMapBox(tiles: Iterable<MapTile>, radius: number): LayoutBox {
  let width = 0;
  let height = 0;
  for (const { position } of tiles) {
    width = Math.max(width, position.x + radius);
    height = Math.max(height, position.y + (Math.sqrt(3) / 2) * radius);
  }
  return { width, height };
}
