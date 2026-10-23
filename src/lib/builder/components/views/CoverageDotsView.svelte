<script lang="ts">
  import CoverageDots from "$lib/core/components/coverageDots/CoverageDots.svelte";
  import { fontSize, spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readText } from "../../registry/options";
  import { createFormatter } from "../../spec/format";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    formatValue,
    format,
    options,
  }: ViewProps<ChartLayouts["coverageDots"]> = $props();

  // Whole-number ticks drop the values' decimals: "96%", not "96,0%".
  const formatTick = $derived(
    layout.axis.ticks.every((t) => Number.isInteger(t.value))
      ? createFormatter({ ...format, decimals: 0 })
      : formatValue,
  );
</script>

<!-- Block names start at the figure's left edge; category names wrap inside the margin. -->
<CoverageDots
  {layout}
  top={margin.top}
  left={margin.left}
  headerLeft={-margin.left}
  categoryWidth={Math.max(0, margin.left - spacing.sm)}
  formatValue={(row) => formatValue(row.value)}
  {formatTick}
  referenceLabel={readText(options, "referenceName")}
  fontSize={fontSize.sm}
/>
