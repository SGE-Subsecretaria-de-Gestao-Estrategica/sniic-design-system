import { DefaultTheme } from './constants';
import type { ChartTheme } from './types';

export function getCategoricalColor(index: number, theme?: ChartTheme): string {
  const scale = theme?.palette?.categorical?.length
    ? theme.palette.categorical
    : DefaultTheme.palette.categorical;

  return scale[((index % scale.length) + scale.length) % scale.length];
}

export function resolveThemeStyle<T, K extends keyof T>(
  propValue: T[K] | undefined,
  themeValue: T[K] | undefined,
  defaultValue: T[K] | undefined
): T[K] | undefined {
  const isObject = typeof defaultValue === 'object' &&
    defaultValue !== null &&
    !Array.isArray(defaultValue)

  if (isObject) {
    return {
      ...defaultValue,
      ...themeValue,
      ...propValue,
    }
  }
  return propValue ?? themeValue ?? defaultValue;
}

/** A style once resolved: whatever the defaults set is no longer optional. */
export type ResolvedStyles<T, D> = Omit<T, keyof D> & {
  [K in keyof T & keyof D]-?: Exclude<T[K], undefined>;
};

export function resolveThemeStyles<
  T extends Record<string, any>,
  D extends Partial<T> = Partial<T>,
>(
  props: T,
  theme: Partial<T> | undefined,
  defaults: D
): ResolvedStyles<T, D> {
  const result: Partial<T> = { ...defaults };

  const styleNames = Object.keys(props) as (keyof T)[];
  for (const styleName of styleNames) {
    const propVal = props[styleName];
    const themeVal = theme?.[styleName];
    const defVal = defaults?.[styleName] as T[typeof styleName] | undefined;

    result[styleName] = resolveThemeStyle(propVal, themeVal, defVal);
  }

  return result as unknown as ResolvedStyles<T, D>;
}