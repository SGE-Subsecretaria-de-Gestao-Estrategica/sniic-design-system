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
  axis?: AxisStyle;
  line?: LineStyle;
  area?: AreaStyle;
  bar?: BarStyle;
  arc?: ArcStyle;
  grid?: GridStyle;
  legend?: LegendStyle;
  marker?: MarkerStyle;
  missing?: MissingStyle;
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
  /** Series colours, in assignment order, for multi-series charts. */
  categorical?: string[],
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
