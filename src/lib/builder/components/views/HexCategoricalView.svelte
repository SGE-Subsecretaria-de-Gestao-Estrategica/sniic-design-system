<script lang="ts">
  import HexCategorical from "$lib/core/components/hexMap/HexCategorical.svelte";
  import Legend from "$lib/core/components/legend/Legend.svelte";
  import { choroplethStepColors } from "$lib/core/layouts/hexMap";
  import { fontSize, fontWeight, strokeWidth } from "$lib/core/theme/tokens";
  import { HEX_CATEGORICAL_LEGEND } from "../../registry/charts/hexCategorical";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readChoice, readToggle } from "../../registry/options";
  import {
    labelColorOn,
    pickedSeriesColors,
    rampColors,
    RAMPS,
  } from "./colors";
  import type { LegendItem } from "$lib/types/Legend";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    theme,
    options,
  }: ViewProps<ChartLayouts["hexCategorical"]> = $props();

  const COLOR_SCALES = ["steps", "palette"] as const;

  /**
   * Ordered categories climb one colour's steps, skipping the page colour so
   * the first one still stands out from the tiles without data; unordered ones
   * take the pillar's colours, or the ones picked per category.
   */
  const colors = $derived.by(() => {
    const { categories } = layout;
    if (readChoice(options, "colorScale", COLOR_SCALES, "steps") === "palette") {
      const picked = pickedSeriesColors(
        categories,
        options.categoryColors,
        theme,
      );
      return categories.map((c) => picked.get(c)!);
    }
    const anchors = rampColors(
      readChoice(options, "ramp", RAMPS, "primary"),
      "lightToDark",
      theme,
    );
    return choroplethStepColors({
      colors: anchors,
      steps: categories.length + 1,
    }).slice(1);
  });
  const labelFills = $derived(colors.map((c) => labelColorOn(c, theme)));

  const legend = $derived.by((): LegendItem[] => {
    const counts = readToggle(options, "legendCounts", true);
    return layout.categories.map((label, i) => ({
      label: counts ? `${label} (${layout.counts[i]})` : label,
      color: colors[i],
    }));
  });
</script>

<HexCategorical
  {layout}
  top={margin.top}
  left={margin.left}
  categoryColors={colors}
  emptyFill={theme.palette.base[200]}
  tileStroke={theme.palette.base[100]}
  tileStrokeWidth={strokeWidth.sm}
  labelFill={(d) =>
    d ? labelFills[d.categoryIndex] : theme.palette.neutral[100]}
  nameFontSize={fontSize.xs}
  nameFontWeight={fontWeight.medium}
/>

<Legend
  items={legend}
  direction="column"
  shape="rect"
  itemSpacing={HEX_CATEGORICAL_LEGEND.rowHeight}
  left={margin.left}
  top={margin.top + layout.legendTop}
/>
