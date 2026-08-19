import * as d3 from "d3"
import * as Tokens from './tokens'
import type { ChartTheme } from "./types";

export function getPillarTheme(pillarId: number) {
  const res = Tokens.pillarPalettes.find((p) => p.id === pillarId)
  if (!res) throw new Error(`No palette found for pillar ID: ${pillarId}`);
  const { id: _, ...pillarPalette } = res
  const palette = { 
    ...Tokens.sharedPalette, 
    ...pillarPalette };

  return {
    palette,
    text: {
      fill: palette.neutral[200],
      fontFamily: Tokens.fontFamily,
      fontSize: Tokens.fontSize.md,
      fontWeight: Tokens.fontWeight.medium,
      lineHeight: "1.1em"
    },
    dataLabel: {
      fill: palette.neutral[300],
      fontFamily: Tokens.fontFamily,
      fontSize: Tokens.fontSize.lg,
      fontWeight: Tokens.fontWeight.bold
    },
    axis: {
        hideAxisLine: true,
        hideTicks: true,
        hideZero: false,
        tickLength: Tokens.spacing.md,
        tickLabelProps: { 
          'font-family': Tokens.fontFamily,
          'font-size': Tokens.fontSize.md,
          'font-weight': Tokens.fontWeight.medium,
          fill: palette.neutral[200]
        }
    },
    grid: {
      stroke: palette.base[200],
      strokeWidth: 1.5,
      numTicks: 10,
    },
    line: {
      stroke: palette.primary.toString(),
      strokeWidth: 12,
      fill: palette.transparent,
      curve: d3.curveCatmullRom.alpha(.5)
    },
    marker: {
      circle: {
        size: 5,
        fill: pillarPalette.primaryVariant
      }
    }
  } satisfies ChartTheme
}