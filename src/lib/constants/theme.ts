import type { AxisTheme, ChartTheme } from "$lib/types/Theme";

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

export const DEFAULT_THEME: ChartTheme = {
  axis: DEFAULT_AXIS_THEME
}