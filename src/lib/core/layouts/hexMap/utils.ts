import { REGION_OFFSETS, UF_TILES } from "./data";
import type { LayoutBox, Point } from "../types";
import type { MapTile, RegionLayoutOffset, UFTile } from "./types";

const HALF_HEIGHT_RATIO = Math.sqrt(3) / 2;

export function makeHexTileScale(config: { radius: number; offsetK?: number }) {
  const { radius, offsetK = 0 } = config;
  const sqrt3 = Math.sqrt(3);

  return function project(tile: UFTile): Point {
    const region = REGION_OFFSETS.find(
      (r) => r.region === tile.region,
    ) as RegionLayoutOffset;
    const px =
      tile.col * (1.5 * radius) + radius + (region.dx ?? 0) * offsetK * radius;
    const py =
      tile.row * ((sqrt3 / 2) * radius) +
      (sqrt3 * radius) / 2 +
      (region.dy ?? 0) * offsetK * radius;
    return { x: px, y: py };
  };
}

/**
 * Centre of every UF tile. Regions pulled apart (`offsetK`) move tiles up and
 * to the left too, so the map is shifted back: its bounding box always starts
 * at the origin.
 */
export function getHexTilePositions(radius: number, offsetK = 0) {
  const scale = makeHexTileScale({ radius, offsetK });
  const projected = UF_TILES.map((tile) => ({ tile, position: scale(tile) }));
  const minX = Math.min(...projected.map((p) => p.position.x - radius));
  const minY = Math.min(
    ...projected.map((p) => p.position.y - HALF_HEIGHT_RATIO * radius),
  );

  const tiles = new Map<string, MapTile>();
  for (const { tile, position } of projected) {
    tiles.set(tile.ufCode, {
      ufCode: tile.ufCode,
      region: tile.region,
      position: { x: position.x - minX, y: position.y - minY },
    });
  }
  return tiles;
}

/** Bounding box (from the origin) of every tile: flat-top hexagons of `radius`. */
export function hexMapBox(tiles: Iterable<MapTile>, radius: number): LayoutBox {
  let width = 0;
  let height = 0;
  for (const { position } of tiles) {
    width = Math.max(width, position.x + radius);
    height = Math.max(height, position.y + HALF_HEIGHT_RATIO * radius);
  }
  return { width, height };
}

/** The hexagon radius that makes the whole map `width` wide (the map scales with the radius). */
export function hexRadiusForWidth(width: number, offsetK = 0): number {
  const unit = hexMapBox(getHexTilePositions(1, offsetK).values(), 1);
  return width / unit.width;
}
