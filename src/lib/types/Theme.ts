import type { AxisScale, SharedAxisProps } from "./Axis";
import type { LinePathProps } from "./Line";

export type ChartTheme = {
  axis?: AxisTheme;
  line?: LineTheme;
}

export type AxisTheme = Pick<
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

export type LineTheme = Pick<
  LinePathProps<unknown>, 
  'curve' | 
  'defined' | 
  'fill' | 
  'stroke' | 
  'fillOpacity' |
  'strokeWidth' |
  'strokeOpacity'
>