import type { AreaPathProps } from "$lib/types/Area";
import type { ArcProps } from "$lib/types/Arc";
import type { AxisScale, SharedAxisProps } from "$lib/types/Axis";
import type { BarProps } from "$lib/types/Bar";
import type { Margin } from "$lib/types/Chart";
import type { AllGridColumnsProps, GridScale } from "$lib/types/Grid";
import type { LegendProps } from "$lib/types/Legend";
import type { LinePathProps } from "$lib/types/Line";
import type { CommonShapeProps } from "$lib/types/Marker";
import type { TextProps } from "$lib/types/Text";

export type ChartTheme = {
  palette?: Palette;
  margin?: Margin;
  text?: TextStyle;
  dataLabel?: TextStyle;
  valueLabel?: TextStyle;
  categoryLabel?: TextStyle;
  seriesLabel?: TextStyle;
  tickLabel?: TextStyle;
  caption?: TextStyle;
  calloutValue?: TextStyle;
  calloutDescription?: TextStyle;
  breakLabel?: TextStyle;
  baseline?: BaselineStyle;
  connector?: ConnectorStyle;
  auxiliaryMark?: AuxiliaryMarkStyle;
  axis?: AxisStyle;
  line?: LineStyle;
  area?: AreaStyle;
  bar?: BarStyle;
  arc?: ArcStyle;
  grid?: GridStyle;
  legend?: LegendStyle;
  marker?: MarkerStyle;
  missing?: MissingStyle;
  capsule?: CapsuleStyle;
  dumbbell?: DumbbellStyle;
  labelMask?: LabelMaskStyle;
  timelineBreak?: TimelineBreakStyle;
}

export type Palette = {
  primary?: string;
  primaryVariant?: string;
  secondary?: string;
  secondaryVariant?: string;
  accent?: string;
  transparent?: string;
  base?: { [key: number]: string },
  neutral?: { [key: number]: string },
  categorical?: string[],
}

export type TextVariant =
  | "text"
  | "dataLabel"
  | "valueLabel"
  | "categoryLabel"
  | "seriesLabel"
  | "tickLabel"
  | "caption"
  | "calloutValue"
  | "calloutDescription"
  | "breakLabel";

export type StrokeRole = "baseline";

export type AuxiliaryMarkStyle = {
  fill?: string;
  fillOpacity?: number;
}

export type BaselineStyle = {
  stroke?: string;
  strokeWidth?: number;
}

export type ConnectorStyle = {
  strokeOpacity?: number;
  widthRatio?: number;
  strokeDasharray?: (strokeWidth: number) => string;
}

/** The Cultura em Números bar (`CapsuleBar`, `CapsuleStack`). */
export type CapsuleStyle = {
  /** One colour, or `[base, tip]` for a gradient along the bar. */
  fill?: string | readonly [string, string];
  fillOpacity?: number;
  /** Colour of the dot inside the cap. */
  dotFill?: string;
  /** Dot radius as a fraction of the cap's radius (half the thickness). */
  dotRatio?: number;
  /** Colour of the gaps between stack segments — the surface behind the chart. */
  gapFill?: string;
  /** Width of the gaps between stack segments, in px. */
  gap?: number;
}

export type DumbbellStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  fromFill?: string;
  toFill?: string;
  fromSize?: number;
  toSize?: number;
}

export type LabelMaskStyle = {
  fill?: string;
  fillOpacity?: number;
  /** Space around the label, in px — one number, or `[horizontal, vertical]`. */
  padding?: number | readonly [number, number];
  radius?: number;
}

export type TimelineBreakStyle = {
  stroke?: string;
  /** Scales the chevron glyph and its gaps from the axis and the label. */
  size?: number;
  label?: string;
}

export type MissingStyle = {
  fill?: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export type TextStyle = Pick<
  TextProps, 
  'fill' | 
  'fontFamily' | 
  'fontSize' | 
  'fontWeight' |
  'lineHeight'
>

export type AxisStyle = Pick<
  SharedAxisProps<AxisScale>,
  'hideAxisLine' |
  'hideTicks' |
  'hideZero' |
  'stroke' |
  'strokeWidth' |
  'strokeDasharray' |
  'tickStroke' |
  'tickLength' |
  'labelOffset' |
  'tickLabelProps' |
  'labelProps' |
  'tickLineProps'
>;


export type LineStyle = Pick<
  LinePathProps<unknown>,
  'curve' |
  'fill' |
  'stroke' |
  'fillOpacity' |
  'strokeWidth' |
  'strokeOpacity'
>

export type AreaStyle = Pick<
  AreaPathProps<unknown>,
  'curve' |
  'fill' |
  'stroke' |
  'fillOpacity' |
  'strokeWidth' |
  'strokeOpacity'
>

export type BarStyle = Pick<
  BarProps,
  'fill' |
  'fillOpacity' |
  'stroke' |
  'strokeWidth' |
  'strokeOpacity' |
  'rx' |
  'ry'
>

export type ArcStyle = Pick<
  ArcProps<unknown>,
  'fill' |
  'fillOpacity' |
  'stroke' |
  'strokeWidth' |
  'strokeOpacity' |
  'cornerRadius' |
  'padAngle'
>

export type GridStyle = Pick<
  AllGridColumnsProps<GridScale>,
  'stroke' |
  'strokeWidth' |
  'strokeDasharray' |
  'numTicks'
>

export type LegendStyle = Pick<
  LegendProps,
  'shape' |
  'shapeSize' |
  'labelGap' |
  'itemSpacing' |
  'direction' |
  'labelProps'
>

export type MarkerStyle = {
  circle: Pick<
    CommonShapeProps,
    'size' |
    'fill' |
    'fillOpacity' |
    'stroke' |
    'strokeOpacity' |
    'strokeWidth'
  >
}
