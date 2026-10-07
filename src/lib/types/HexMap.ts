import type {
  ChoroplethDatum,
  ChoroplethLayout,
  MapTile,
  TwinBarDatum,
  TwinBarItem,
  TwinBarsLayout,
} from "$lib/core/layouts/hexMap";
import type { ClassValue } from "svelte/elements";
import type { LayoutComponentProps } from "./LayoutComponent";
import type { ValueOrAccessor } from "./ValueOrAccessor";

export type HexTileStyle<T> = ValueOrAccessor<[tile: MapTile], T>;

export type HexTilesProps = {
  tiles: Iterable<MapTile>;
  /** One flat-top hexagon centred on the origin (`layout.pathData`). */
  pathData: string;
  class?: ClassValue;
  fill?: HexTileStyle<string | undefined>;
  stroke?: HexTileStyle<string | undefined>;
  strokeWidth?: number;
};

/** `datum` is undefined on a tile without data. */
export type ChoroplethTileStyle<D, T> = ValueOrAccessor<
  [datum: ChoroplethDatum<D> | undefined, tile: MapTile],
  T
>;

export type HexChoroplethProps<D> = LayoutComponentProps<
  ChoroplethLayout<D>
> & {
  // Tiles
  /** One colour per step of the layout's scale, lowest first (`choroplethStepColors`). */
  stepColors: readonly string[];
  /** Tiles without data. */
  emptyFill?: string;
  tileStroke?: string;
  tileStrokeWidth?: number;

  // Labels (theme roles: `categoryLabel` for the UF, `valueLabel`)
  showNames?: boolean;
  showValues?: boolean;
  formatName?: (ufCode: string) => string;
  formatValue?: (datum: ChoroplethDatum<D>) => string;
  /** Both labels of a tile, e.g. a light colour on the dark steps. */
  labelFill?: ChoroplethTileStyle<D, string | undefined>;
  nameFontSize?: number;
  nameFontWeight?: number;
  valueFontSize?: number;
  valueFontWeight?: number;
};

export type TwinBarStyle<D, T> = ValueOrAccessor<
  [bar: TwinBarItem<D>, tile: TwinBarDatum<D>],
  T
>;

export type HexTwinBarsProps<D> = LayoutComponentProps<TwinBarsLayout<D>> & {
  /** Unique prefix for the clip-path ids this component defines. */
  id: string;

  // Tiles
  tileFill?: string;
  tileStroke?: string;
  tileStrokeWidth?: number;

  // Bars: one per type (`bar.typeIndex`), rounded as a whole
  barFill?: TwinBarStyle<D, string | undefined>;
  /** The part of a bar above the threshold. Undefined → the bar's own fill. */
  overflowFill?: TwinBarStyle<D, string | undefined>;
  barRadius?: number;

  // Threshold line (theme role: `baseline`)
  showThreshold?: boolean;
  thresholdStroke?: string;
  thresholdStrokeWidth?: number;

  // Labels (theme roles: `valueLabel`, and `categoryLabel` for the UF)
  showValues?: boolean;
  showNames?: boolean;
  formatValue?: (bar: TwinBarItem<D>, tile: TwinBarDatum<D>) => string;
  formatName?: (ufCode: string) => string;
  valueFill?: TwinBarStyle<D, string | undefined>;
  valueFontSize?: number;
  valueFontWeight?: number;
  nameFill?: string;
  nameFontSize?: number;
  nameFontWeight?: number;
};
