import { DefaultTheme } from "./constants";
import type { BaselineStyle, ChartTheme, ConnectorStyle } from "./types";
import { resolveThemeStyles } from "./utils";

// Resolvers for the stroke roles: props > theme role > DefaultTheme role.

export function resolveBaseline(
  props: BaselineStyle,
  theme?: ChartTheme,
): Required<BaselineStyle> {
  return resolveThemeStyles(props, theme?.baseline, DefaultTheme.baseline) as Required<BaselineStyle>;
}

export type ResolvedConnector = {
  strokeWidth: number;
  strokeOpacity: number;
  strokeDasharray: string;
};

export function resolveConnector(
  connectedWidth: number,
  props: { strokeWidth?: number; strokeOpacity?: number; strokeDasharray?: string },
  theme?: ChartTheme,
): ResolvedConnector {
  const role = resolveThemeStyles<ConnectorStyle>(
    { strokeOpacity: props.strokeOpacity, widthRatio: undefined, strokeDasharray: undefined },
    theme?.connector,
    DefaultTheme.connector,
  );
  const strokeWidth = props.strokeWidth ?? connectedWidth * role.widthRatio!;
  return {
    strokeWidth,
    strokeOpacity: role.strokeOpacity!,
    strokeDasharray: props.strokeDasharray ?? role.strokeDasharray!(strokeWidth),
  };
}
