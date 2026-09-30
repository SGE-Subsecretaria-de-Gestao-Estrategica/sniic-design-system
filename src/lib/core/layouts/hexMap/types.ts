import type { ScaleLinear, ScaleQuantize } from "d3";
import type {
  LabelPlacement,
  LayoutBox,
  LayoutItem,
  LineSegment,
  Point,
  ValueAccessor,
} from "../types";

export type BrazilianRegion = "N" | "NE" | "CO" | "SE" | "S";

/** @deprecated use the shared `Point`. */
export type Point2D = Point;

export type GridCoordinate = {
  col: number;
  row: number;
};

export type UFTile = GridCoordinate & {
  ufCode: string;
  region: BrazilianRegion;
}

export type RegionLayoutOffset = {
  region: BrazilianRegion;
  dx: number;
  dy: number;
}

export type MapTile = {
  ufCode: string;
  region: BrazilianRegion;
  /** Centre of the hexagon, in plotting-area coordinates. */
  position: Point;
}

// -----------------------------------------------------------------------------
// Base Layout
// -----------------------------------------------------------------------------

export type BaseLayoutConfig<D> = {
  /** Hexagon radius (centre to vertex). */
  radius: number;
  /** How far regions are pulled apart, as a share of the radius. Default 0. */
  offsetK?: number;
  getUf: (d: D) => string;
};

/** A datum placed on its UF tile. `key` is the UF code. */
export type BaseLayoutDatum<T> = MapTile & LayoutItem<T>;

/** `width` / `height`: bounding box of every tile (independent of the data). */
export type BaseLayout<T> = LayoutBox & {
  tiles: Map<string, MapTile>;
  data: BaseLayoutDatum<T>[];
  pathData: string;
};

// -----------------------------------------------------------------------------
// Twin Bars Layout
// -----------------------------------------------------------------------------

export type TwinBarsSpacing = {
  barWidth: number;
  barGap: number;
  /** Bars' base, below the tile centre, as a share of the radius. */
  barBaseRatio: number;
  /** Tallest bar, as a share of the radius. */
  barHeightRatio: number;
  /** How far the threshold line runs past the bars on each side. */
  thresholdOverhang: number;
  /** Gap between the bars' base and their value labels. */
  valueLabelGap: number;
  /** Horizontal inset of the UF name from the tile's top-left corner. */
  nameLabelInset: number;
  /** Where that corner sits, as a share of the hex radius from the centre. */
  nameCornerRatio: number;
};

/** @deprecated use `TwinBarsSpacing`. */
export type TwinBarsLabelSpacing = Pick<
  TwinBarsSpacing,
  "valueLabelGap" | "nameLabelInset" | "nameCornerRatio"
>;

export type TwinBarsLayoutConfig<D> = BaseLayoutConfig<D> &
  Partial<TwinBarsSpacing> &
  ValueAccessor<D> & {
    getType: (d: D) => string;
    /** Values above it get a second (overflow) segment and a threshold line. */
    threshold?: number;
  };

export type TwinBarSegment = {
  y: number;
  height: number;
};

export type ThresholdLine = LineSegment;

/** Tile-local. `index`: position in its tile. */
export type TwinBarItem<T> = Point & LayoutItem<T> & {
  value: number;
  width: number;
  height: number;
  segments: TwinBarSegment[];
  isOverThreshold: boolean;
  /** Under the bar's base, tile-local. */
  label: LabelPlacement;
};

export type TwinBarDatum<T> = MapTile & {
  key: string;
  index: number;
  bars: TwinBarItem<T>[];
  totalWidth: number;
  origin: Point;
  threshold?: ThresholdLine;
  /** UF name in the tile's top-left corner, tile-local. */
  nameLabel: LabelPlacement;
  data: T[];
};

export type TwinBarsLayout<T> = LayoutBox & {
  tiles: Map<string, MapTile>;
  pathData: string;
  yScale: ScaleLinear<number, number>;
  thresholdHeight: number;
  data: TwinBarDatum<T>[];
};

// -----------------------------------------------------------------------------
// Choropleth Layout
// -----------------------------------------------------------------------------

export type ChoroplethColorConfig = {
  colors: [string, string, string];
  steps?: number;
  mode?: "lab" | "lch" | "rgb" | "hsl";
};

export type ChoroplethSpacing = {
  /** Gap between the tile centre and the UF name (above it). */
  nameLabelGap: number;
  /** Gap between the tile centre and the value (below it). */
  valueLabelGap: number;
};

/** @deprecated use `ChoroplethSpacing`. */
export type ChoroplethLabelSpacing = ChoroplethSpacing;

export type ChoroplethLayoutConfig<D> = BaseLayoutConfig<D> &
  Partial<ChoroplethSpacing> &
  ValueAccessor<D> & {
    color: ChoroplethColorConfig;
    domain?: [number, number];
  };

export type ChoroplethDatum<T> = BaseLayoutDatum<T> & {
  value: number;
  color: string;
  /** UF name above the centre and value below it, tile-local. */
  labels: { name: LabelPlacement; value: LabelPlacement };
};

export type ChoroplethLayout<T> = LayoutBox & {
  tiles: Map<string, MapTile>;
  pathData: string;
  colorScale: ScaleQuantize<string>;
  stepColors: string[];
  domain: [number, number];
  data: ChoroplethDatum<T>[];
};
