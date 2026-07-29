import * as d3 from "d3"
import * as Tokens from './tokens'
import type { ChartTheme } from "./types";

export function getPillarTheme(pillarId: number) {
  const res = Tokens.pillarPalettes.find((p) => p.id === pillarId)
  if (!res) throw new Error(`No palette found for pillar ID: ${pillarId}`);
  const { id: _, ...pillarPalette } = res
  const palette = { ...Tokens.sharedPalette, ...pillarPalette };

  const primaryColor = d3.color(pillarPalette.primary)!

  return {
    palette: { ...palette, categorical: getCategoricalPalette(pillarPalette) },
    margin: Tokens.defaultMargin,
    text: {
      fill: palette.neutral[200],
      fontFamily: Tokens.fontFamily,
      fontSize: Tokens.fontSize.md,
      fontWeight: Tokens.fontWeight.medium
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
      strokeWidth: 3,
      numTicks: 10,
    },
    line: {
      stroke: palette.primary.toString(),
      strokeWidth: 12,
      fill: palette.transparent,
      curve: d3.curveCatmullRom.alpha(.5)
    },
    area: {
      fill: palette.primary.toString(),
      fillOpacity: 0.2,
      stroke: palette.transparent,
      strokeWidth: 0,
      curve: d3.curveCatmullRom.alpha(.5)
    },
    bar: {
      fill: palette.primary.toString(),
      stroke: palette.transparent,
      strokeWidth: 0,
      rx: Tokens.radii.sm,
    },
    arc: {
      fill: palette.primary.toString(),
      stroke: palette.base[100],
      strokeWidth: 1,
      cornerRadius: Tokens.radii.none,
      padAngle: 0,
    },
    legend: {
      direction: 'row',
      shape: 'rect',
      shapeSize: Tokens.spacing.md,
      labelGap: Tokens.spacing.md / 2,
      labelProps: {
        fontFamily: Tokens.fontFamily,
        fontSize: Tokens.fontSize.md,
        fontWeight: Tokens.fontWeight.medium,
        fill: palette.neutral[200],
      },
    },
    marker: {
      circle: {
        size: 5,
        fill: primaryColor.darker().toString()
      }
    }
  } satisfies ChartTheme
}

/**
 * Series colours for multi-series charts. The three pillar hues come first so
 * charts with few series stay on-brand; lightness variants extend the ramp
 * while keeping adjacent entries distinguishable.
 */
function getCategoricalPalette({ primary, secondary, accent }: Omit<Tokens.PillarPalette, 'id'>) {
  const [p, s, a] = [primary, secondary, accent].map((c) => d3.color(c)!)

  return [
    p,
    s,
    a,
    p.darker(0.9),
    s.brighter(0.9),
    a.darker(0.9),
    p.brighter(0.9),
    s.darker(0.9),
  ].map((c) => c.toString())
}