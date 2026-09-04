import type { RegionLayoutOffset, UFTile } from "./types"

export const UF_TILES = [
  { ufCode: "AC", col: 0, row: 3, region: "N" },
  { ufCode: "RR", col: 1, row: 0, region: "N" },
  { ufCode: "AM", col: 1, row: 2, region: "N" },
  { ufCode: "RO", col: 1, row: 4, region: "N" },
  { ufCode: "PA", col: 2, row: 1, region: "N" },
  { ufCode: "TO", col: 2, row: 3, region: "N" },
  { ufCode: "AP", col: 3, row: 0, region: "N" },
  { ufCode: "MA", col: 3, row: 2, region: "NE" },
  { ufCode: "CE", col: 4, row: 3, region: "NE" },
  { ufCode: "PI", col: 4, row: 5, region: "NE" },
  { ufCode: "RN", col: 5, row: 2, region: "NE" },
  { ufCode: "PE", col: 5, row: 4, region: "NE" },
  { ufCode: "BA", col: 5, row: 6, region: "NE" },
  { ufCode: "PB", col: 6, row: 3, region: "NE" },
  { ufCode: "SE", col: 6, row: 5, region: "NE" },
  { ufCode: "AL", col: 7, row: 4, region: "NE" },
  { ufCode: "MT", col: 2, row: 5, region: "CO" },
  { ufCode: "DF", col: 3, row: 4, region: "CO" },
  { ufCode: "GO", col: 3, row: 6, region: "CO" },
  { ufCode: "MS", col: 3, row: 8, region: "CO" },
  { ufCode: "MG", col: 4, row: 7, region: "SE" },
  { ufCode: "SP", col: 4, row: 9, region: "SE" },
  { ufCode: "RJ", col: 5, row: 8, region: "SE" },
  { ufCode: "ES", col: 6, row: 7, region: "SE" },
  { ufCode: "RS", col: 3, row: 12, region: "S" },
  { ufCode: "SC", col: 4, row: 11, region: "S" },
  { ufCode: "PR", col: 5, row: 10, region: "S" }
] satisfies UFTile[]

export const REGION_OFFSETS = [
  { region: "N", dx: -0.35, dy: -0.75 },
  { region: "NE", dx: 0.5, dy: -0.5 },
  { region: "CO", dx: -0.15, dy: 0 },
  { region: "SE", dx: 0.5, dy: 0.25 },
  { region: "S", dx: 0.75, dy: 0.75 }
] satisfies RegionLayoutOffset[]