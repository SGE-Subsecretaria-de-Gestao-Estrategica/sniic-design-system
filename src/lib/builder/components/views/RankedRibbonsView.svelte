<script lang="ts">
  import Group from "$lib/core/components/Group.svelte";
  import RankedRibbons from "$lib/core/components/rankedRibbons/RankedRibbons.svelte";
  import { RANKED_RIBBONS_DEFAULTS } from "$lib/core/layouts/rankedRibbons";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readToggle } from "../../registry/options";
  import { labelColorOn, pickedSeriesColors } from "./colors";
  import { showsAllValues } from "./lines";
  import type { ViewProps } from "./types";
  import XAxisFrame from "./XAxisFrame.svelte";

  let {
    layout,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["rankedRibbons"]> = $props();

  const colors = $derived(
    pickedSeriesColors(layout.series, options.seriesColors, theme),
  );
  const labelFills = $derived(
    new Map([...colors].map(([key, color]) => [key, labelColorOn(color, theme)])),
  );
  const all = $derived(showsAllValues(options, "all"));
</script>

<Group top={margin.top} left={margin.left}>
  <XAxisFrame axis={layout.xAxis} panels={[{ top: 0, height: layout.height }]}>
    <RankedRibbons
      {layout}
      fill={(ribbon) => colors.get(ribbon.key)}
      showValues={(slot, column) =>
        !slot.isEndLabel &&
        (all || column.isSegmentStart || column.isSegmentEnd)}
      formatValue={(slot) => formatValue(slot.value)}
      valueFill={(slot) => labelFills.get(slot.series)}
      showTotals={readToggle(options, "totals")}
      formatTotal={(column) => formatValue(column.total)}
      nameWidth={margin.right - RANKED_RIBBONS_DEFAULTS.endLabelGap}
    />
  </XAxisFrame>
</Group>
