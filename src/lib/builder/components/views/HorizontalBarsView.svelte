<script lang="ts">
  import LinearGradient from "$lib/core/components/gradient/LinearGradient.svelte";
  import HorizontalBars from "$lib/core/components/horizontalBars/HorizontalBars.svelte";
  import { fontSize } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import type { ViewProps } from "./types";

  let {
    layout,
    id,
    margin,
    theme,
    formatValue,
  }: ViewProps<ChartLayouts["horizontalBars"]> = $props();

  // The gradient runs past the bar's end, so the longest bar stops short of the last colour.
  const GRADIENT_EXTENT = "115%";
</script>

<defs>
  <LinearGradient
    id="{id}-bar"
    from={theme.palette.primaryVariant}
    to={theme.palette.primary}
    vertical={false}
    x2={GRADIENT_EXTENT}
  />
</defs>

<HorizontalBars
  {layout}
  {id}
  top={margin.top}
  left={margin.left}
  barFill="url(#{id}-bar)"
  markerFill={theme.palette.primary}
  formatValue={(bar) => formatValue(bar.value)}
  fontSize={fontSize.sm}
/>
