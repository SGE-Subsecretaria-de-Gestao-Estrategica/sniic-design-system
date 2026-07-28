import type { AxisScale, SharedAxisProps } from "$lib/types/Axis";
import type { AllGridColumnsProps, GridScale } from "$lib/types/Grid";
import type { LinePathProps } from "$lib/types/Line";
import type { CommonShapeProps } from "$lib/types/Marker";
import type { TextProps } from "$lib/types/Text";

export type ChartTheme = {
  palette?: Palette;
  text?: TextStyle;
  dataLabel?: TextStyle;
  axis?: AxisStyle;
  line?: LineStyle;
  grid?: GridStyle;
  marker?: MarkerStyle;
}

export type Palette = {
  primary?: string;
  secondary?: string;
  accent?: string;
  transparent?: string;
  base?: { [key: number]: string },
  neutral?: { [key: number]: string },
}

export type TextStyle = Pick<
  TextProps, 
  'fill' | 
  'fontFamily' | 
  'fontSize' | 
  'fontWeight'
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

export type GridStyle = Pick<
  AllGridColumnsProps<GridScale>, 
  'stroke' | 
  'strokeWidth' | 
  'strokeDasharray' | 
  'numTicks'
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