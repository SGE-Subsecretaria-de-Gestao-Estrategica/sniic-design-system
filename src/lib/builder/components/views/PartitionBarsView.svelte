<script lang="ts">
  import PartitionBars from "$lib/core/components/partitionBars/PartitionBars.svelte";
  import { PARTITION_BARS_DEFAULTS } from "$lib/core/layouts/partitionBars";
  import { fontSize, fontWeight, strokeWidth } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readText } from "../../registry/options";
  import { createFormatter } from "../../spec/format";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    theme,
    format,
    options,
  }: ViewProps<ChartLayouts["partitionBars"]> = $props();

  // The bars show shares, whatever the file counts: the main format's decimals, as a percentage.
  const formatShare = $derived(
    createFormatter({ ...format, percent: true, prefix: "", suffix: "%", compact: false }),
  );
  // A piece's share is of its part, not of the whole: say so after the number.
  const pieceSuffix = $derived(readText(options, "pieceSuffix") ?? "da parte");
</script>

<!-- The ranking's look: names in the margin, values past the 100% end, the baseline over the bars. -->
<PartitionBars
  {layout}
  top={margin.top}
  left={margin.left}
  headerLeft={-margin.left}
  categoryWidth={Math.max(0, margin.left - PARTITION_BARS_DEFAULTS.categoryLabelGap)}
  formatValue={(row) =>
    row.kind === "piece" ? `${formatShare(row.share)} ${pieceSuffix}` : formatShare(row.share)}
  fontSize={fontSize.sm}
  pieceFontSize={fontSize.xs}
  valueWeight={fontWeight.semibold}
  baselineStroke={theme.palette.base[300]}
  baselineWidth={strokeWidth.md}
/>
