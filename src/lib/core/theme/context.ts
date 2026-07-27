import { createContext } from 'svelte';
import { DefaultTheme } from './constants';
import type { ChartTheme } from './types';

const [ getThemeContext, setThemeContext ] = createContext<ChartTheme>();

export function setChartTheme(theme?: ChartTheme) {
  setThemeContext(theme ?? DefaultTheme);
}
export function getChartTheme() {
  try {
    return getThemeContext();
  } catch (e) {
    return undefined
  }
}