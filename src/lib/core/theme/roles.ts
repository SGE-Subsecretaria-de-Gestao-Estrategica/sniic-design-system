import { DefaultTheme } from "./constants";
import type {
  BaselineStyle,
  CapsuleStyle,
  ChartTheme,
  ConnectorStyle,
  DumbbellStyle,
  LabelMaskStyle,
  TimelineBreakStyle,
} from "./types";
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

// Resolvers for the mark roles: props > theme role > DefaultTheme role.

export type ResolvedCapsule = {
  /** `[base, tip]` gradient stops; equal for a solid bar. */
  stops: readonly [string, string];
  fillOpacity: number | undefined;
  dotFill: string;
  gapFill: string;
};

export function resolveCapsule(props: CapsuleStyle, theme?: ChartTheme): ResolvedCapsule {
  const style = resolveThemeStyles(props, theme?.capsule, DefaultTheme.capsule);
  const fill = style.fill!;
  return {
    stops: typeof fill === "string" ? [fill, fill] : fill,
    fillOpacity: style.fillOpacity,
    dotFill: style.dotFill!,
    gapFill: style.gapFill!,
  };
}

export function resolveDumbbell(props: DumbbellStyle, theme?: ChartTheme): Required<DumbbellStyle> {
  return resolveThemeStyles(props, theme?.dumbbell, DefaultTheme.dumbbell) as Required<DumbbellStyle>;
}

export function resolveLabelMask(props: LabelMaskStyle, theme?: ChartTheme): Required<LabelMaskStyle> {
  return resolveThemeStyles(props, theme?.labelMask, DefaultTheme.labelMask) as Required<LabelMaskStyle>;
}

export function resolveTimelineBreak(
  props: TimelineBreakStyle,
  theme?: ChartTheme,
): Required<TimelineBreakStyle> {
  return resolveThemeStyles(props, theme?.timelineBreak, DefaultTheme.timelineBreak) as Required<TimelineBreakStyle>;
}
