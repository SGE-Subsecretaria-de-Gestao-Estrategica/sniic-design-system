export type BrazilianRegion = "N" | "NE" | "CO" | "SE" | "S";

export type Point2D = {
  x: number;
  y: number;
}

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
  position: Point2D;
}

// -----------------------------------------------------------------------------
// Base Layout
// -----------------------------------------------------------------------------

export type BaseLayoutConfig<D> = {
  radius: number;
  offsetK?: number;
  getUf: (d: D) => string;
};

export type BaseLayoutDatum<T> = MapTile & { data: T; };

export type BaseLayout<T> = {
  tiles: Map<string, MapTile>;
  data: BaseLayoutDatum<T>[];
  pathData: string;
};

// -----------------------------------------------------------------------------
// Twin Bars Layout
// -----------------------------------------------------------------------------

export type TwinBarsLayoutConfig<D> = BaseLayoutConfig<D> & {
  getValue: (d: D) => number;
  getType: (d: D) => string;
  threshold?: number;
  width?: number;
  gap?: number;
};

export type TwinBarSegment = {
  y: number;
  height: number;
};

export type ThresholdLine = {
  from: Point2D;
  to: Point2D;
};

export type TwinBarItem<T> = Point2D &{
  key: string;
  value: number;
  data: T;
  width: number;
  height: number;
  segments: TwinBarSegment[];
  isOverThreshold: boolean;
};

export type TwinBarDatum<T> = MapTile & {
  bars: TwinBarItem<T>[];
  totalWidth: number;
  origin: Point2D;
  threshold?: ThresholdLine;
  data: T[];
};