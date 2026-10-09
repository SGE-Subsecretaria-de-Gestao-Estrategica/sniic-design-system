import { createContext } from 'svelte';
import { DefaultTheme } from './constants';
import type { ChartTheme } from './types';

const [ getThemeContext, setThemeContext ] = createContext<ChartTheme>();

/**
 * A theme that reads through `read` on every property access, so a component
 * deriving from `theme.axis` (or spreading the theme) re-runs when the theme
 * `read` returns changes — context is set once, but what it points to is live.
 */
export function liveTheme(read: () => ChartTheme): ChartTheme {
  return new Proxy({} as ChartTheme, {
    get: (_, key) => Reflect.get(read(), key),
    has: (_, key) => Reflect.has(read(), key),
    ownKeys: () => Reflect.ownKeys(read()),
    getOwnPropertyDescriptor: (_, key) => {
      const theme = read();
      if (!Reflect.has(theme, key)) return undefined;
      return { value: Reflect.get(theme, key), enumerable: true, configurable: true, writable: false };
    },
  });
}

/**
 * Sets the theme for descendants. Pass a getter (`() => theme`) for a theme
 * that can change after init — descendants follow it.
 */
export function setChartTheme(theme?: ChartTheme | (() => ChartTheme | undefined)) {
  const read = typeof theme === 'function' ? theme : () => theme;
  setThemeContext(liveTheme(() => read() ?? DefaultTheme));
}

export function getChartTheme() {
  try {
    return getThemeContext();
  } catch (e) {
    return undefined
  }
}
