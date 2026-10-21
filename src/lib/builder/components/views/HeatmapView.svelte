<script lang="ts">
  import Heatmap from "$lib/core/components/heatmap/Heatmap.svelte";
  import LegendSteps from "$lib/core/components/legend/LegendSteps.svelte";
  import {
    fontSize,
    spacing,
    strokeWidth,
  } from "$lib/core/theme/tokens";
  import getStringWidth from "$lib/core/utils/getStringWidth";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readChoice, readToggle } from "../../registry/options";
  import {
    labelColorOn,
    pairStepColors,
    RAMP_ORDERS,
    rampStepColors,
    RAMPS,
  } from "./colors";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["heatmap"]> = $props();

  // The legend sits under the grid, in the room the chart adds to the bottom margin.
  const LEGEND = {
    gap: spacing.lg,
    lineOverhang: spacing.sm,
    labelGap: spacing.xs,
    fontSize: fontSize.xs,
  };

  const stepColors = $derived(
    rampStepColors(options, layout.steps, theme, () =>
      pairStepColors(
        readChoice(options, "ramp", RAMPS, "primary"),
        readChoice(options, "rampOrder", RAMP_ORDERS, "lightToDark"),
        layout.steps,
        theme,
      ),
    ),
  );
  const labelFills = $derived(stepColors.map((c) => labelColorOn(c, theme)));

  const legendLabels = $derived(
    readToggle(options, "legendValues", true)
      ? ([
          formatValue(layout.domain[0]),
          formatValue(layout.domain[1]),
        ] as const)
      : undefined,
  );
  // Room for the lowest value, written before the first swatch.
  const legendLeft = $derived.by(() => {
    if (!legendLabels) return LEGEND.lineOverhang;
    const text = legendLabels[0];
    const width =
      getStringWidth(text, `font-size: ${LEGEND.fontSize}px`) ??
      text.length * LEGEND.fontSize * 0.6;
    return LEGEND.lineOverhang + LEGEND.labelGap + width;
  });
</script>

<Heatmap
  {layout}
  top={margin.top}
  left={margin.left}
  {stepColors}
  emptyFill={theme.palette.base[200]}
  showValues={readToggle(options, "showValues", true)}
  formatValue={(cell) => formatValue(cell.value ?? 0)}
  valueFill={(cell) => (cell.step === null ? undefined : labelFills[cell.step])}
  rowLabelWidth={margin.left - spacing.md}
/>

<LegendSteps
  colors={stepColors}
  top={margin.top + layout.height + LEGEND.gap}
  left={margin.left + legendLeft}
  lineOverhang={LEGEND.lineOverhang}
  lineStroke={theme.palette.neutral[300]}
  lineStrokeWidth={strokeWidth.xs}
  labels={legendLabels}
  labelGap={LEGEND.labelGap}
  labelFill={theme.palette.neutral[200]}
  fontSize={LEGEND.fontSize}
/>
