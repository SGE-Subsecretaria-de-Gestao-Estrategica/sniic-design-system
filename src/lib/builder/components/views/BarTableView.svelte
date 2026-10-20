<script lang="ts">
  import BarTable from "$lib/core/components/barTable/BarTable.svelte";
  import type { ChartLayouts } from "../../registry/layouts";
  import type { ViewProps } from "./types";

  let {
    layout,
    margin,
    formatValue,
  }: ViewProps<ChartLayouts["barTable"]> = $props();
</script>

<!-- The bars take the theme's capsule colours, as in Tabela com barras. -->
<BarTable
  {layout}
  top={margin.top}
  left={margin.left}
  formatValue={(bar) => formatValue(bar.value)}
/>
