<script lang="ts">
  import HexChoropleth from "$lib/core/components/hexMap/HexChoropleth.svelte";
  import LegendSteps from "$lib/core/components/legend/LegendSteps.svelte";
  import { choroplethStepColors } from "$lib/core/layouts/hexMap";
  import {
    fontSize,
    fontWeight,
    spacing,
    strokeWidth,
  } from "$lib/core/theme/tokens";
  import getStringWidth from "$lib/core/utils/getStringWidth";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readChoice, readToggle } from "../../registry/options";
  import { labelColorOn, RAMP_ORDERS, rampColors, RAMPS } from "./colors";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["hexChoropleth"]> = $props();

  // The legend sits in the top margin, as in G6.10.
  const LEGEND = {
    top: spacing.sm,
    lineOverhang: spacing.sm,
    labelGap: spacing.xs,
    fontSize: fontSize.xs,
  };

  const stepColors = $derived(
    choroplethStepColors({
      colors: rampColors(
        readChoice(options, "ramp", RAMPS, "secondary"),
        readChoice(options, "rampOrder", RAMP_ORDERS, "lightToDark"),
        theme,
      ),
      steps: layout.steps,
    }),
  );
  const labelFills = $derived(stepColors.map((c) => labelColorOn(c, theme)));

  const legendLabels = $derived(
    readToggle(options, "legendValues")
      ? ([
          formatValue(layout.domain[0]),
          formatValue(layout.domain[1]),
        ] as const)
      : undefined,
  );
  // Room for the lowest value, written before the first swatch.
  const legendLeft = $derived.by(() => {
    const start = spacing.sm + LEGEND.lineOverhang;
    if (!legendLabels) return start;
    const text = legendLabels[0];
    const width =
      getStringWidth(text, `font-size: ${LEGEND.fontSize}px`) ??
      text.length * LEGEND.fontSize * 0.6;
    return start + LEGEND.labelGap + width;
  });
</script>

<LegendSteps
  colors={stepColors}
  top={LEGEND.top}
  left={legendLeft}
  lineOverhang={LEGEND.lineOverhang}
  lineStroke={theme.palette.neutral[300]}
  lineStrokeWidth={strokeWidth.xs}
  labels={legendLabels}
  labelGap={LEGEND.labelGap}
  labelFill={theme.palette.neutral[200]}
  fontSize={LEGEND.fontSize}
/>

<HexChoropleth
  {layout}
  top={margin.top}
  left={margin.left}
  {stepColors}
  emptyFill={theme.palette.base[200]}
  tileStroke={theme.palette.base[100]}
  tileStrokeWidth={strokeWidth.sm}
  formatValue={(d) => formatValue(d.value)}
  labelFill={(d) => (d ? labelFills[d.step] : theme.palette.neutral[100])}
  nameFontSize={fontSize.xs}
  nameFontWeight={fontWeight.medium}
  valueFontSize={fontSize.sm}
  valueFontWeight={fontWeight.medium}
/>
