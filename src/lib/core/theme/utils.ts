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

export function resolveThemeStyles<T extends Record<string, any>>(
  props: T,
  theme: Partial<T> | undefined,
  defaults: Partial<T>
): T {
  const result = { ...defaults };

  const styleNames = Object.keys(props) as (keyof T)[];
  for (const styleName of styleNames) {
    const propVal = props[styleName];
    const themeVal = theme?.[styleName];
    const defVal = defaults?.[styleName];

    result[styleName] = resolveThemeStyle(propVal, themeVal, defVal) as T[typeof styleName];
  }

  return result as T;
}