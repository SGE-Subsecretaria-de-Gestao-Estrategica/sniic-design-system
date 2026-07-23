import type { AxisScale, SharedAxisProps } from "./Axis";

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

export type ChartTheme = {
  axis?: AxisTheme;
}