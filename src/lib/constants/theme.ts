import * as d3 from "d3"
import type { ChartTheme, AxisTheme, LineTheme } from "$lib/types/Theme";

export const DEFAULT_AXIS_THEME: AxisTheme = {
  hideAxisLine: true,
  hideTicks: true,
  hideZero: false,
  tickLength: 10,
  tickLabelProps: { 
    'font-family': "General Sans",
    'font-size': '12px',
    'font-weight': '500',
    'fill': '#4D5148'
  }
}

export const DEFAULT_LINE_THEME: LineTheme = {
  stroke: "#B3B2A9",
  strokeWidth: 10,
  fill: 'transparent',
  defined: () => true,
  curve: d3.curveCatmullRom.alpha(.5)
}

export const DEFAULT_THEME: ChartTheme = {
  axis: DEFAULT_AXIS_THEME,
  line: DEFAULT_LINE_THEME
}