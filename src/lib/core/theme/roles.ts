import { DefaultTheme } from "./constants";
import type { ChartTheme, ConnectorStyle } from "./types";
import { resolveThemeStyles } from "./utils";

export type ResolvedConnector = {
  strokeWidth: number;
  strokeOpacity: number;
  strokeDasharray: string;
};

/**
 * The connector role, props > theme role > DefaultTheme role. Unlike the
 * other roles it can't go through `resolveThemeStyles` alone: its width and
 * dash pattern are derived from the stroke it connects.
 */
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
