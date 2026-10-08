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


  const text = {
    fill: palette.neutral[300],
    fontFamily: Tokens.fontFamily,
    fontSize: Tokens.fontSize.md,
    fontWeight: Tokens.fontWeight.medium,
    lineHeight: "1.1em"
  }

  const textRoles = {
    text,
    dataLabel: { ...text, fontSize: Tokens.fontSize.lg, fontWeight: Tokens.fontWeight.bold },
    valueLabel: { ...text, fontSize: Tokens.fontSize.sm },
    categoryLabel: text,
    seriesLabel: text,
    tickLabel: { ...text, fill: palette.neutral[200] },
    caption: { ...text, fill: palette.neutral[200], fontSize: Tokens.fontSize.sm },
    calloutValue: { ...text, fill: palette.primary, fontSize: 19, fontWeight: Tokens.fontWeight.bold },
    calloutDescription: { ...text, fontSize: 13 },
    breakLabel: { ...text, fill: palette.neutral[100] },
  }

  const baseline = {
    stroke: palette.base[200],
    strokeWidth: Tokens.strokeWidth.sm,
  }

  const auxiliaryMark = {
    fill: palette.neutral[100],
  }

  const connector = {
    strokeOpacity: 0.3,
    widthRatio: 2 / 3,
    strokeDasharray: (w: number) => `${Math.max(w, 6)},${Math.max(1.5 * w, 8)}`,
  }

  return {
    palette: { ...palette, categorical: getCategoricalPalette(pillarPalette) },
    margin: Tokens.defaultMargin,
    ...textRoles,
    baseline,
    connector,
    auxiliaryMark,
    axis: {
        hideAxisLine: true,
        hideTicks: true,
        hideZero: false,
        stroke: palette.neutral[300],
        strokeWidth: Tokens.strokeWidth.xs,
        tickStroke: palette.neutral[300],
        tickLength: Tokens.spacing.md,
        labelOffset: 14,
        tickLabelProps: textRoles.tickLabel,
    },
    grid: {
      ...baseline,
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
      strokeWidth: Tokens.strokeWidth.xs,
      cornerRadius: Tokens.radii.none,
      padAngle: 0,
    },
    legend: {
      direction: 'row',
      shape: 'rect',
      shapeSize: Tokens.spacing.md,
      labelGap: Tokens.spacing.md / 2,
      labelProps: textRoles.tickLabel,
    },
    marker: {
      circle: {
        size: 5,
        fill: pillarPalette.primaryVariant
      }
    },
    capsule: {
      // The gradient stops short of the full tip colour so the dot, in that
      // colour, still reads against the end of a long bar.
      fill: [
        pillarPalette.primaryVariant,
        d3.interpolateLab(pillarPalette.primaryVariant, pillarPalette.primary)(0.6),
      ] as const,
      dotFill: pillarPalette.primary,
      dotRatio: 0.55,
      gapFill: palette.base[100],
      gap: 2,
    },
    dumbbell: {
      stroke: pillarPalette.primary,
      strokeWidth: 12,
      fromFill: pillarPalette.primaryVariant,
      toFill: pillarPalette.accent,
      fromSize: 5,
      toSize: 8,
    },
    labelMask: {
      fill: palette.base[100],
      fillOpacity: 0.75,
      padding: [Tokens.spacing.sm, 2] as const,
      radius: Tokens.radii.none,
    },
    timelineBreak: {
      stroke: palette.neutral[100],
      size: Tokens.spacing.sm,
      label: "QUEBRA",
    },
    missing: {
      fill: palette.base[300],
      opacity: 1,
      stroke: palette.neutral[100],
      strokeWidth: Tokens.strokeWidth.xs,
      strokeDasharray: "4 2"
    }
  } satisfies ChartTheme
}

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